"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

import { AllSectionsIcon } from "@/components/design-system/icons"
import { Button } from "@/components/ui/button"
import { Item } from "@/components/ui/item"
import {
  DOCS_SECTIONS,
  type DocsPage,
  type DocsSection,
} from "@/lib/design-system/data"
import { docsHref } from "@/lib/design-system/nav"
import {
  AUTO_AXIS,
  AUTO_SPEED,
  DRAG_SPEED,
  ENTER_DURATION,
  FRICTION,
  IDENTITY,
  KEY_STEP,
  MOTION_FLOOR,
  type Quat,
  type Vec3,
  REVEAL_RATE,
  SMOOTHING,
  TAP_SLOP,
  X_AXIS,
  Y_AXIS,
  fibonacciSphere,
  fromAxisAngle,
  multiply,
  normalize,
  perspectiveFor,
  project,
  sphereRadius,
} from "@/lib/design-system/orbit"
import { easeOutCubic, interpolate } from "@/lib/reels/anim"

/**
 * `/design-system` — the front door, as a sphere you can spin.
 *
 * The five sections sit on a Fibonacci sphere. Dragging turns it with inertia,
 * it drifts on its own until you touch it, and every node faces you however far
 * it has travelled. Opening a section rebuilds the sphere out of that section's
 * topics; opening a topic lifts the document up from the bottom edge and lands
 * on its real URL.
 *
 * **The loop writes to the DOM, not to React state.** Fifteen nodes each
 * needing a new transform every frame is fifteen style writes, which is cheap;
 * the same thing as a state update is a full render tree fifteen times a
 * second-and-a-half of entrance plus every frame of every drag. So the motion
 * lives entirely in refs and `draw` sets `style.transform` directly. React owns
 * what is on the sphere, never where it is.
 *
 * Nothing here uses a `transition-*` or `animate-*` class either, which is why
 * none of this is quietly stretching the house motion tokens past the 300ms
 * they cap: a sphere's position is a function of a drag that is still
 * happening, and a CSS transition would be fighting for the same property.
 *
 * The clock stops when nothing is moving and any input restarts it, so an
 * untouched sphere that has finished drifting costs nothing.
 */

/** A thing on the sphere. Sections and topics differ only in what opening does. */
type OrbitItem = {
  page: DocsPage
  /** Topics only. Sections rebuild the sphere instead of navigating. */
  href?: string
  /** Sections only, for the count under the title. */
  topics?: number
}

function topicsOf(section: DocsSection): DocsPage[] {
  return section.groups.flatMap((group) => group.pages)
}

function itemsFor(section: DocsSection | null): OrbitItem[] {
  if (!section) {
    return DOCS_SECTIONS.map((entry) => ({
      page: entry,
      topics: topicsOf(entry).length,
    }))
  }

  return topicsOf(section).map((page) => ({ href: docsHref(page.id), page }))
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  return reduced
}

export function DesignSystemOrbit() {
  const router = useRouter()
  const reduced = useReducedMotion()

  const [openSection, setOpenSection] = React.useState<DocsSection | null>(null)
  const [entering, setEntering] = React.useState<{
    href: string
    page: DocsPage
  } | null>(null)
  const [enterMs, setEnterMs] = React.useState(0)

  const items = React.useMemo(() => itemsFor(openSection), [openSection])

  const stageRef = React.useRef<HTMLDivElement>(null)
  const nodeRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  /* The layout of the sphere is derived, so it is a memo. Everything the loop
     mutates frame to frame is a ref, so a drag never re-renders. */
  const points = React.useMemo(
    () => fibonacciSphere(items.length),
    [items.length],
  )

  const pointsRef = React.useRef<Vec3[]>([])
  const rotation = React.useRef<Quat>(IDENTITY)
  const target = React.useRef({ x: 0, y: 0 })
  const smooth = React.useRef({ x: 0, y: 0 })
  const velocity = React.useRef({ x: 0, y: 0 })
  const reveal = React.useRef(0)
  const touched = React.useRef(false)
  const rafRef = React.useRef<number | null>(null)
  const lastRef = React.useRef(0)
  const reducedRef = React.useRef(reduced)

  React.useEffect(() => {
    reducedRef.current = reduced
  }, [reduced])

  /* A named function expression so the loop can re-schedule itself by its own
     binding. A self-referencing arrow held in a const is the same loop, but it
     reads its own name out of the enclosing scope before that name exists. */
  const draw = React.useCallback(function step(now: number) {
    rafRef.current = null

    const stage = stageRef.current
    if (!stage) return

    const still = reducedRef.current
    /* Capped: a backgrounded tab resumes with a gap of seconds, and applying
       all of it in one step would fling the sphere. */
    const dt = Math.min(32, now - (lastRef.current || now)) / 16.667
    lastRef.current = now

    if (still) {
      velocity.current.x = 0
      velocity.current.y = 0
      smooth.current = { ...target.current }
      reveal.current = 1
    } else {
      target.current.x += velocity.current.x * dt
      target.current.y += velocity.current.y * dt
      const friction = Math.pow(FRICTION, dt)
      velocity.current.x *= friction
      velocity.current.y *= friction
    }

    const previous = { ...smooth.current }

    if (!still) {
      const ease = 1 - Math.pow(1 - SMOOTHING, dt)
      smooth.current.x += (target.current.x - smooth.current.x) * ease
      smooth.current.y += (target.current.y - smooth.current.y) * ease
      reveal.current += (1 - reveal.current) * (1 - Math.pow(REVEAL_RATE, dt))
    }

    /* Pre-multiplied, so each drag is applied in the viewer's frame rather
       than in the sphere's — that is what keeps a sideways drag sideways
       after the sphere has already been tilted. */
    rotation.current = multiply(
      fromAxisAngle(Y_AXIS, smooth.current.x - previous.x),
      rotation.current,
    )
    rotation.current = multiply(
      fromAxisAngle(X_AXIS, smooth.current.y - previous.y),
      rotation.current,
    )

    if (!touched.current && !still) {
      rotation.current = multiply(
        fromAxisAngle(AUTO_AXIS, AUTO_SPEED * dt),
        rotation.current,
      )
    }

    rotation.current = normalize(rotation.current)

    const width = stage.clientWidth
    const height = stage.clientHeight
    const radius = sphereRadius(width, height)
    const perspective = perspectiveFor(height)

    for (let index = 0; index < pointsRef.current.length; index += 1) {
      const node = nodeRefs.current[index]
      if (!node) continue

      const at = project(
        pointsRef.current[index],
        rotation.current,
        radius,
        perspective,
        reveal.current,
      )

      node.style.transform = `translate(-50%, -50%) translate3d(${at.x}px, ${at.y}px, 0) scale(${at.scale})`
      node.style.opacity = String(at.opacity)
      node.style.zIndex = String(at.z + 1000)
    }

    const drifting = !touched.current && !still
    const moving =
      Math.abs(velocity.current.x) +
        Math.abs(velocity.current.y) +
        Math.abs(target.current.x - smooth.current.x) +
        Math.abs(target.current.y - smooth.current.y) >
      MOTION_FLOOR

    if (moving || reveal.current < 0.9999 || drifting) {
      rafRef.current = requestAnimationFrame(step)
    }
  }, [])

  const wake = React.useCallback(() => {
    if (rafRef.current !== null || document.hidden) return
    lastRef.current = performance.now()
    rafRef.current = requestAnimationFrame(draw)
  }, [draw])

  /* Hands the new layout to the loop and rewinds the reveal, so mounting and
     changing level both play the sphere out of the centre. Refs and a frame
     request only — nothing here sets state. */
  React.useEffect(() => {
    pointsRef.current = points
    nodeRefs.current = nodeRefs.current.slice(0, points.length)
    reveal.current = 0
    wake()
  }, [points, wake])

  React.useEffect(
    () => () => {
      /* Clearing the handle matters as much as cancelling the frame: `wake`
         reads a non-null handle as "already running", so a cleanup that
         cancelled without clearing would leave a dead id behind and every
         later wake would return early. Strict Mode's double mount in
         development hits that on the very first render. */
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    },
    [],
  )

  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const observer = new ResizeObserver(() => wake())
    observer.observe(stage)
    return () => observer.disconnect()
  }, [wake])

  /* The drag. Pointer capture keeps a drag alive past the edge of the stage,
     and costs the click: with the pointer captured, press and release no longer
     share the node underneath, so the browser never synthesises one. The tap is
     resolved by hit-testing the release point instead. */
  const pointerId = React.useRef<number | null>(null)
  const last = React.useRef({ x: 0, y: 0 })
  const travel = React.useRef(0)

  const openItem = React.useCallback(
    (item: OrbitItem) => {
      if (item.href) {
        setEnterMs(0)
        setEntering({ href: item.href, page: item.page })
        return
      }

      const next = DOCS_SECTIONS.find((entry) => entry.id === item.page.id)
      if (next) setOpenSection(next)
    },
    [],
  )

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return
    pointerId.current = event.pointerId
    last.current = { x: event.clientX, y: event.clientY }
    travel.current = 0
    touched.current = true
    velocity.current = { x: 0, y: 0 }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== event.pointerId) return

    const dx = event.clientX - last.current.x
    const dy = event.clientY - last.current.y
    last.current = { x: event.clientX, y: event.clientY }
    travel.current += Math.hypot(dx, dy)

    if (reducedRef.current) {
      target.current.x += dx * DRAG_SPEED * 8
      target.current.y += dy * DRAG_SPEED * 8
    } else {
      velocity.current.x += dx * DRAG_SPEED
      velocity.current.y += dy * DRAG_SPEED
    }

    wake()
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== event.pointerId) return
    pointerId.current = null

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (event.type !== "pointerup" || travel.current > TAP_SLOP) return

    const hit = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-sphere-node]")

    if (!hit) return

    const index = Number(hit.dataset.sphereNode)
    const item = items[index]
    if (item) openItem(item)
  }

  React.useEffect(() => {
    if (!entering) return

    if (reduced) {
      router.push(entering.href)
      return
    }

    const start = performance.now()
    let frame = 0
    let pushed = false

    const climb = (now: number) => {
      const ms = now - start
      setEnterMs(ms)

      /* Pushed a little before the panel lands: the topic routes are
         prerendered, so the real page is painted underneath by the time the
         panel covers the sphere and the swap has nothing to show. */
      if (!pushed && ms >= ENTER_DURATION * 0.72) {
        pushed = true
        router.push(entering.href)
      }

      if (ms < ENTER_DURATION) frame = requestAnimationFrame(climb)
    }

    frame = requestAnimationFrame(climb)
    return () => cancelAnimationFrame(frame)
  }, [entering, reduced, router])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* In flow above the stage, not floating over it. Absolutely placed, the
          near face of the sphere rides straight through the title — the nodes
          reach further from the centre than the sphere's own radius because
          perspective scales the close ones up. Giving the heading its own band
          and handing the rest to the stage means they cannot collide at any
          size. */}
      <div className="flex flex-col items-center gap-1 px-6 pt-6 text-center">
        <h1 className="text-2xl font-semibold">
          {openSection ? openSection.title : "Design system"}
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {openSection
            ? openSection.description
            : "Every rule, pattern and primitive the product is built from."}
        </p>

        {openSection ? (
          <Button
            className="mt-2"
            onClick={() => setOpenSection(null)}
            size="sm"
            variant="outline"
          >
            <AllSectionsIcon />
            All sections
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Drag to turn the sphere.
          </p>
        )}
      </div>

      <div
        aria-label="Design system sections. Drag to turn the sphere, arrow keys to rotate."
        className="relative min-h-0 flex-1 cursor-grab touch-none select-none outline-none"
        onKeyDown={(event) => {
          const step =
            event.key === "ArrowLeft"
              ? -KEY_STEP
              : event.key === "ArrowRight"
                ? KEY_STEP
                : 0
          const lift =
            event.key === "ArrowUp"
              ? -KEY_STEP
              : event.key === "ArrowDown"
                ? KEY_STEP
                : 0

          if (!step && !lift) return
          event.preventDefault()
          touched.current = true
          target.current.x += step
          target.current.y += lift
          wake()
        }}
        onPointerCancel={onPointerUp}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        ref={stageRef}
        role="application"
        tabIndex={0}
      >
        {items.map((item, index) => (
          /* `Item asChild` over a raw button: the primitive brings the ring,
             the radius and the hover, and the button stays a real button. */
          <Item
            asChild
            className="absolute start-1/2 top-1/2 w-24 flex-col items-stretch gap-2 opacity-0"
            key={item.page.id}
            variant="outline"
          >
            <button
              data-sphere-node={index}
              ref={(node) => {
                nodeRefs.current[index] = node
              }}
              type="button"
            >
              {/* The illustration slot. Empty until there is art for it —
                  a muted panel at the tile's aspect, so the sphere already
                  has the shape the pictures will land in. */}
              <span className="h-28 w-full rounded-md bg-muted" />
              <span className="text-xs font-medium">{item.page.title}</span>
              {item.topics ? (
                <span className="text-xs text-muted-foreground">
                  {item.topics} topics
                </span>
              ) : null}
            </button>
          </Item>
        ))}
      </div>

      {/* The document arriving: a solid surface climbing from the bottom edge,
          carrying the heading at the size and position the real page puts it,
          so the panel lands already wearing the header it becomes. */}
      {entering ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-modal flex flex-col gap-8 bg-background p-3 lg:p-4"
          style={{
            transform: `translateY(${interpolate(
              enterMs,
              [0, ENTER_DURATION],
              [100, 0],
              { easing: easeOutCubic },
            )}%)`,
          }}
        >
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">{entering.page.title}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {entering.page.description}
            </p>
          </header>
        </div>
      ) : null}

      {/* A sphere is a pointer toy. The same list, reachable without one. */}
      <nav className="sr-only">
        {items.map((item) =>
          item.href ? (
            <Link href={item.href} key={item.page.id}>
              {item.page.title}
            </Link>
          ) : null,
        )}
      </nav>
    </div>
  )
}
