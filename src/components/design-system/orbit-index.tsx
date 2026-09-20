"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

import { AllSectionsIcon } from "@/components/design-system/icons"
import { Button } from "@/components/ui/button"
import {
  DOCS_SECTIONS,
  type DocsPage,
  type DocsSection,
} from "@/lib/design-system/data"
import { docsHref } from "@/lib/design-system/nav"
import {
  DRAG_TO_DEGREES,
  ENTER_DURATION,
  KEY_STEP_DEGREES,
  SPIN_DECAY,
  SPIN_FLOOR,
  WHEEL_TO_DEGREES,
  arrivalEnd,
  orbitArrival,
  orbitNode,
  orbitRadius,
} from "@/lib/design-system/orbit"
import { easeOutCubic, interpolate } from "@/lib/reels/anim"

/**
 * `/design-system` — the front door, as a ring rather than a grid of cards.
 *
 * Five sections orbit the title. Turning the ring brings one to the front;
 * opening one re-forms the ring out of that section's topics, and opening a
 * topic lifts the document up from the bottom edge and lands on its real URL.
 * Two levels, one gesture, and the address bar still ends up somewhere that can
 * be sent to someone — the rail and every `/design-system/<section>/<topic>`
 * page are untouched by this file.
 *
 * **Nothing here uses a `transition-*` or `animate-*` class.** Every frame is
 * computed from one clock and written to the style prop as geometry, the way
 * the reels kernel does it, because the ring's position has to be a function of
 * a rotation the wheel is still changing — a CSS transition would be fighting
 * for the same property. It also means the house motion tokens, which cap a
 * class-driven animation at 300ms, are not being quietly stretched to cover an
 * 1100ms entrance they were never written for.
 *
 * The clock stops when there is nothing left to move: the loop exits once the
 * last node has arrived and the coast has decayed, and the wheel restarts it.
 * An idle ring costs nothing, which is the whole reason it does not drift on
 * its own.
 */

/** A thing on the ring. Sections and topics differ only in what opening does. */
type OrbitItem = {
  page: DocsPage
  /** Topics only. Sections re-form the ring instead of navigating. */
  href?: string
  /** Sections only, for the count beside the title. */
  topics?: number
}

/** Every topic filed under a section, with its group labels flattened away. */
function topicsOf(section: DocsSection): DocsPage[] {
  return section.groups.flatMap((group) => group.pages)
}

function sectionItems(): OrbitItem[] {
  return DOCS_SECTIONS.map((section) => ({
    page: section,
    topics: topicsOf(section).length,
  }))
}

function topicItems(section: DocsSection): OrbitItem[] {
  return topicsOf(section).map((page) => ({
    href: docsHref(page.id),
    page,
  }))
}

/** Whether the reader has asked the OS for less movement. */
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
  const [stage, setStage] = React.useState({ height: 620, width: 1280 })
  const [rotation, setRotation] = React.useState(0)

  /* Starts at the first frame of the entrance, which is every node at zero
     opacity, so the prerendered HTML is an empty stage and the ring builds
     itself once.

     Starting settled instead — a finished ring in the HTML — looked safer and
     read worse: the server's ring painted, then the first frame of the loop
     rewound it to nothing and built it again, so the entrance began with the
     ending. The cost is that the ring needs JS to appear at all, which the
     rail, the search and the collapsibles on every other docs page already
     did. Reduced motion is handled where the clock is, not here. */
  const [elapsed, setElapsed] = React.useState(0)

  const items = React.useMemo(
    () => (openSection ? topicItems(openSection) : sectionItems()),
    [openSection],
  )
  const count = items.length

  const stageRef = React.useRef<HTMLDivElement>(null)
  const rafRef = React.useRef<number | null>(null)
  const startRef = React.useRef(0)
  const spinRef = React.useRef(0)
  const rotationRef = React.useRef(0)
  const draggingRef = React.useRef(false)

  /**
   * Run the clock until nothing is moving, then stop.
   *
   * Everything that changes the ring calls this rather than starting a loop of
   * its own, so there is only ever one.
   */
  const wake = React.useCallback(() => {
    if (rafRef.current !== null || reduced) return

    let last = performance.now()

    const loop = (now: number) => {
      /* Capped: a backgrounded tab resumes with a gap of seconds, and an
         uncapped one would apply all of it to the coast in a single step. */
      const delta = Math.min(now - last, 64)
      last = now

      const since = now - startRef.current
      const arriving = since < arrivalEnd(count)
      if (arriving) setElapsed(since)

      if (spinRef.current !== 0) {
        const steps = delta / 16
        rotationRef.current += spinRef.current * steps
        spinRef.current *= Math.pow(SPIN_DECAY, steps)
        if (Math.abs(spinRef.current) < SPIN_FLOOR) spinRef.current = 0
        setRotation(rotationRef.current)
      }

      if (arriving || spinRef.current !== 0 || draggingRef.current) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      rafRef.current = null
      setElapsed(Number.POSITIVE_INFINITY)
    }

    rafRef.current = requestAnimationFrame(loop)
  }, [count, reduced])

  /**
   * Re-form the ring: every node flies in again, staggered.
   *
   * Moves the clock and starts the loop, and deliberately sets no state of its
   * own — the first frame of the loop is what pulls `elapsed` back to zero.
   * Rewinding here instead would be a synchronous setState inside the effect
   * that calls this, which is the cascading-render pattern the hooks lint
   * rejects, and the one frame of settled ring it saves is not worth it.
   */
  const reform = React.useCallback(() => {
    if (reduced) return
    startRef.current = performance.now()
    wake()
  }, [reduced, wake])

  /* The entrance, and a fresh one whenever the ring changes what it is made
     of. Depending on the level rather than on `items` keeps a re-render from
     restarting the entrance under the reader. */
  React.useEffect(() => {
    reform()
  }, [openSection, reform])

  /* Clearing the handle matters as much as cancelling the frame. `wake` treats
     a non-null handle as "a loop is already running", so a cleanup that
     cancelled without clearing left a dead id behind and every later wake
     returned early — no entrance and a wheel that did nothing. Strict Mode's
     double mount in development hits that on the very first render. */
  React.useEffect(
    () => () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    },
    [],
  )

  /* The stage drives the radius, so the ring fits a laptop and a wide monitor
     without either one being the size it was written against. */
  React.useEffect(() => {
    const element = stageRef.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      const { height, width } = entry.contentRect
      setStage({ height, width })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const turn = React.useCallback(
    (degrees: number) => {
      rotationRef.current += degrees
      setRotation(rotationRef.current)
    },
    [],
  )

  /* Non-passive, because the wheel drives the ring instead of the page and the
     browser has to be told so before it starts a scroll it will not finish. */
  React.useEffect(() => {
    const element = stageRef.current
    if (!element) return

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      if (reduced) {
        turn(event.deltaY * WHEEL_TO_DEGREES)
        return
      }
      spinRef.current += event.deltaY * WHEEL_TO_DEGREES * 0.34
      wake()
    }

    element.addEventListener("wheel", onWheel, { passive: false })
    return () => element.removeEventListener("wheel", onWheel)
  }, [reduced, turn, wake])

  /** The doc on its way up from the bottom edge, or nothing. */
  const [entering, setEntering] = React.useState<{
    href: string
    page: DocsPage
    section: string
  } | null>(null)
  const [enterMs, setEnterMs] = React.useState(0)

  React.useEffect(() => {
    if (!entering) return

    /* No climb to watch, so there is no reason to make them wait for one. */
    if (reduced) {
      router.push(entering.href)
      return
    }

    const start = performance.now()
    let frame = 0
    let pushed = false

    const loop = (now: number) => {
      const ms = now - start
      setEnterMs(ms)

      /* Pushed a little before the panel lands rather than after: the topic
         routes are prerendered, so the real page is painted underneath by the
         time the panel covers the ring, and the swap has nothing to show. */
      if (!pushed && ms >= ENTER_DURATION * 0.72) {
        pushed = true
        router.push(entering.href)
      }

      if (ms < ENTER_DURATION) frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [entering, reduced, router])

  const open = React.useCallback(
    (item: OrbitItem) => {
      if (item.href) {
        setEnterMs(0)
        setEntering({
          href: item.href,
          page: item.page,
          section: openSection?.title ?? "",
        })
        return
      }

      const next = DOCS_SECTIONS.find((section) => section.id === item.page.id)
      if (next) setOpenSection(next)
    },
    [openSection],
  )

  const radius = orbitRadius(stage.width, stage.height)
  /* Reduced motion settles the ring in render rather than by pushing state,
     which keeps it out of the effect and means a reader who flips the OS
     setting mid-entrance lands on a finished ring instead of a frozen one. */
  const settled = reduced || elapsed === Number.POSITIVE_INFINITY

  /**
   * Pointer drag, as a second way to turn the ring.
   *
   * The move and release are on `window` rather than on the stage, and nothing
   * calls `setPointerCapture`. Capturing looked tidier and quietly broke every
   * node: it retargets the pointer events at the stage, so press and release
   * no longer share the button underneath and the browser never synthesises
   * the click. Listening on the window keeps a drag that runs off the edge of
   * the stage working, which is the only thing capture was buying.
   */
  const dragRef = React.useRef({ moved: 0, x: 0 })

  React.useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!draggingRef.current) return
      const step = event.clientX - dragRef.current.x
      dragRef.current = {
        moved: dragRef.current.moved + Math.abs(step),
        x: event.clientX,
      }
      turn(step * DRAG_TO_DEGREES)
      /* Carried into the coast, so letting go mid-flick keeps going. */
      spinRef.current = step * DRAG_TO_DEGREES * 0.5
    }

    const onUp = () => {
      if (!draggingRef.current) return
      draggingRef.current = false
      wake()
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
    }
  }, [turn, wake])

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    draggingRef.current = true
    dragRef.current = { moved: 0, x: event.clientX }
    spinRef.current = 0
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className="relative flex min-h-0 flex-1 touch-pan-y select-none items-center justify-center"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") turn(-KEY_STEP_DEGREES)
          if (event.key === "ArrowRight") turn(KEY_STEP_DEGREES)
        }}
        onPointerDown={onPointerDown}
        ref={stageRef}
      >
        {/* What the ring turns around. It is the heading of the page, so the
            centre is doing a job rather than being a decorative hub. */}
        <div className="pointer-events-none absolute flex max-w-xs flex-col items-center gap-2 text-center">
          {openSection ? (
            <>
              <h1 className="text-2xl font-semibold">{openSection.title}</h1>
              <p className="text-sm text-muted-foreground">
                {openSection.description}
              </p>
              <Button
                className="pointer-events-auto mt-1"
                onClick={() => setOpenSection(null)}
                size="sm"
                variant="outline"
              >
                <AllSectionsIcon />
                All sections
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold">Design system</h1>
              <p className="text-sm text-muted-foreground">
                Every rule, pattern and primitive the product is built from.
              </p>
              <p className="text-xs text-muted-foreground">
                Scroll or drag to turn the ring.
              </p>
            </>
          )}
        </div>

        {items.map((item, index) => {
          const arrival = settled ? null : orbitArrival(index, elapsed)
          const node = orbitNode(
            index,
            count,
            rotation + (arrival?.swing ?? 0),
            radius * (arrival?.pull ?? 1),
          )

          return (
            <div
              className="absolute"
              key={item.page.id}
              style={{
                opacity: node.opacity * (arrival?.opacity ?? 1),
                transform: `translate3d(${node.x}px, ${node.y}px, 0) scale(${
                  node.scale * (arrival?.scale ?? 1)
                })`,
                zIndex: node.z,
              }}
            >
              {item.href ? (
                /* A real link, so the address is copyable and a
                   cmd-click still opens a second tab. The handler only
                   takes over the plain case, which is the one that gets
                   the panel. */
                <Button asChild className="whitespace-nowrap" variant="outline">
                  <Link
                    href={item.href}
                    onClick={(event) => {
                      /* A flick that happened to end on a node turned the
                         ring; it did not ask for this topic. */
                      if (dragRef.current.moved > 6) {
                        event.preventDefault()
                        return
                      }
                      if (
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey
                      ) {
                        return
                      }
                      event.preventDefault()
                      open(item)
                    }}
                    onPointerEnter={() => router.prefetch(item.href as string)}
                  >
                    {item.page.title}
                  </Link>
                </Button>
              ) : (
                <Button
                  className="whitespace-nowrap"
                  onClick={() => {
                    if (dragRef.current.moved > 6) return
                    open(item)
                  }}
                  variant="secondary"
                >
                  {item.page.title}
                  {/* The topic count, as a number rather than a pill: every
                      node on this ring would carry one, and a badge on all
                      five stops distinguishing anything. */}
                  <span className="text-muted-foreground">{item.topics}</span>
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {/* The document arriving. A solid surface so the ring is covered by the
          time the route swaps underneath it, carrying the heading at the size
          and position the real page puts it — the panel lands and the page it
          became is already wearing the same header. */}
      {entering ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex flex-col gap-8 bg-background p-3 lg:p-4"
          style={{
            transform: `translateY(${interpolate(
              enterMs,
              [0, ENTER_DURATION],
              [100, 0],
              { easing: easeOutCubic },
            )}%)`,
            zIndex: 50,
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
    </div>
  )
}
