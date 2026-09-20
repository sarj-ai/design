"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

import { AllSectionsIcon } from "@/components/design-system/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
  DOCS_SECTIONS,
  type DocsPage,
  type DocsSection,
} from "@/lib/design-system/data"
import { docsHref } from "@/lib/design-system/nav"
import {
  DRAW_DURATION,
  OPEN_DELAY,
  HUB,
  LABEL_DURATION,
  LABEL_STAGGER,
  RINGS,
  dotSpeed,
  dots,
  entranceEnd,
  figureRadius,
  placements,
  ringPoint,
} from "@/lib/design-system/orbit"
import { easeOutCubic, interpolate } from "@/lib/reels/anim"

/**
 * `/design-system` — the front door, as an orbit diagram.
 *
 * A hub with orbits drawn through it, one label per section sitting on a curve,
 * and dots travelling the paths. Opening a section redraws the figure out of
 * that section's topics; opening a topic lifts the document up from the bottom
 * edge and lands on its real URL.
 *
 * **The loop writes to the DOM, not to React state.** The dots move every
 * frame, and a dot's position as state would re-render the whole figure sixty
 * times a second to move eighteen circles four pixels. React owns what is on
 * the diagram; the loop owns where the moving parts are.
 *
 * Nothing here uses a `transition-*` or `animate-*` class, so the house motion
 * tokens — which cap a class-driven animation at 300ms — are not being quietly
 * stretched to cover a 900ms draw-in.
 *
 * The clock stops when the entrance is done and reduced motion has stopped the
 * dots; otherwise the dots are the one thing that keeps it running, because a
 * diagram of orbits with nothing moving on them is just a drawing.
 */

type OrbitItem = {
  page: DocsPage
  /** Topics only. Sections redraw the figure instead of navigating. */
  href?: string
  /** Sections only, for the count beside the title. */
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
  const [stage, setStage] = React.useState({ height: 620, width: 1280 })
  const [entering, setEntering] = React.useState<{
    href: string
    page: DocsPage
  } | null>(null)

  const items = React.useMemo(() => itemsFor(openSection), [openSection])
  const spots = React.useMemo(() => placements(items.length), [items.length])
  const riders = React.useMemo(() => dots(), [])

  const stageRef = React.useRef<HTMLDivElement>(null)
  const ringRefs = React.useRef<(SVGEllipseElement | null)[]>([])
  const dotRefs = React.useRef<(SVGCircleElement | null)[]>([])
  const labelRefs = React.useRef<(HTMLDivElement | null)[]>([])

  const rafRef = React.useRef<number | null>(null)
  const startRef = React.useRef(0)
  const countRef = React.useRef(items.length)
  countRef.current = items.length
  const radiusRef = React.useRef(0)
  const reducedRef = React.useRef(reduced)

  React.useEffect(() => {
    reducedRef.current = reduced
  }, [reduced])

  const radius = figureRadius(stage.width, stage.height)
  radiusRef.current = radius

  const draw = React.useCallback(function step(now: number) {
    rafRef.current = null

    const still = reducedRef.current
    const elapsed = still ? Number.MAX_SAFE_INTEGER : now - startRef.current
    const r = radiusRef.current

    /* The orbits drawing themselves in. `pathLength={1}` normalises every
       ellipse to one unit of stroke whatever its real circumference, so one
       number drives all six regardless of how different their sizes are. */
    const drawn = interpolate(elapsed, [0, DRAW_DURATION], [1, 0], {
      easing: easeOutCubic,
    })
    for (const ring of ringRefs.current) {
      if (ring) ring.style.strokeDashoffset = String(drawn)
    }

    /* The labels, staggered, each arriving from slightly inside its orbit so
       it settles outward onto the curve rather than fading in on top of it. */
    for (let index = 0; index < labelRefs.current.length; index += 1) {
      const label = labelRefs.current[index]
      if (!label) continue

      const from = index * LABEL_STAGGER
      const span = [from, from + LABEL_DURATION] as const
      const at = interpolate(elapsed, span, [0, 1], { easing: easeOutCubic })

      label.style.opacity = String(at)
      label.style.transform = `translate(-50%, -50%) scale(${0.82 + at * 0.18})`
    }

    /* The dots, riding their orbits. Position only — they do not fade in,
       because a dot arriving is indistinguishable from a dot moving. */
    const seconds = still ? 0 : elapsed / 1000
    for (let index = 0; index < riders.length; index += 1) {
      const dot = dotRefs.current[index]
      const rider = riders[index]
      if (!dot || !rider) continue

      const t = (rider.t + seconds * dotSpeed(rider.ring)) % 1
      const at = ringPoint(RINGS[rider.ring], t)
      dot.setAttribute("cx", String(at.x * r))
      dot.setAttribute("cy", String(at.y * r))
    }

    /* Reduced motion has no dots to keep running for, so once the figure has
       settled the loop has nothing left to do. */
    if (!still || elapsed < entranceEnd(countRef.current)) {
      rafRef.current = requestAnimationFrame(step)
    }
  }, [riders])

  const wake = React.useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(draw)
  }, [draw])

  /* Mount and every level change replay the entrance. Refs and a frame request
     only — nothing here sets state. */
  React.useEffect(() => {
    startRef.current = performance.now()
    ringRefs.current = ringRefs.current.slice(0, RINGS.length)
    labelRefs.current = labelRefs.current.slice(0, items.length)
    wake()
  }, [items, wake])

  React.useEffect(
    () => () => {
      /* Clearing the handle matters as much as cancelling the frame: `wake`
         reads a non-null handle as "already running", so cancelling without
         clearing leaves a dead id behind and every later wake returns early.
         Strict Mode's double mount in development hits that on first render. */
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    },
    [],
  )

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

  const open = React.useCallback((item: OrbitItem) => {
    if (item.href) {
      setEntering({ href: item.href, page: item.page })
      return
    }

    const next = DOCS_SECTIONS.find((entry) => entry.id === item.page.id)
    if (next) setOpenSection(next)
  }, [])

  /* One timeout, not a frame loop.

     This used to drive the panel's own transform from `requestAnimationFrame`,
     setting state every frame — which re-rendered the whole figure sixty times
     a second to move one card, and was exactly why the climb stuttered. The
     movement is a keyframe token now, so the compositor owns it and React is
     left with one job: push the route once the panel has landed. */
  React.useEffect(() => {
    if (!entering) return

    /* No climb to wait for, so there is no reason to make them wait for one. */
    if (reduced) {
      router.push(entering.href)
      return
    }

    const timer = window.setTimeout(
      () => router.push(entering.href),
      OPEN_DELAY,
    )
    return () => window.clearTimeout(timer)
  }, [entering, reduced, router])

  const cx = stage.width / 2
  const cy = stage.height / 2

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* In flow above the figure, not floating over it, so the orbits and the
          title can never collide at any size. */}
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
        ) : null}
      </div>

      <div className="relative min-h-0 flex-1" ref={stageRef}>
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full"
          height={stage.height}
          width={stage.width}
        >
          <g transform={`translate(${cx} ${cy})`}>
            {RINGS.map((ring, index) => (
              <ellipse
                className="fill-none stroke-border"
                key={index}
                pathLength={1}
                ref={(node) => {
                  ringRefs.current[index] = node
                }}
                rx={ring.rx * radius}
                ry={ring.ry * radius}
                strokeDasharray={1}
                strokeDashoffset={1}
                strokeWidth={1}
                transform={`rotate(${ring.rotate})`}
              />
            ))}

            {riders.map((rider, index) => (
              <circle
                className="fill-muted-foreground"
                key={index}
                r={2}
                ref={(node) => {
                  dotRefs.current[index] = node
                }}
              />
            ))}

            {/* The hub. A tinted disc rather than a mark: whatever sits at the
                centre of this figure is the thing the orbits belong to, and
                that is the page you are already on. */}
            <circle className="fill-primary-tint" r={HUB * radius} />
            <circle
              className="fill-none stroke-border"
              r={HUB * radius}
              strokeWidth={1}
            />
          </g>
        </svg>

        {items.map((item, index) => {
          const spot = spots[index]
          const at = ringPoint(RINGS[spot.ring], spot.t)

          return (
            <div
              className="absolute opacity-0"
              key={item.page.id}
              ref={(node) => {
                labelRefs.current[index] = node
              }}
              style={{
                insetInlineStart: `${cx + at.x * radius}px`,
                top: `${cy + at.y * radius}px`,
              }}
            >
              {/* `Badge asChild` over a real link or a real button: the
                  primitive is already the pill, and the child stays the right
                  element. Two Badges rather than one wrapping a ternary — the
                  anchor has to be the pill's immediate child for `asChild` to
                  merge onto it at all. */}
              {item.href ? (
                <Badge asChild variant="secondary">
                  <Link
                    href={item.href}
                    onClick={(event) => {
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
                </Badge>
              ) : (
                <Badge asChild variant="secondary">
                  <button onClick={() => open(item)} type="button">
                    {item.page.title}
                    <span className="text-muted-foreground">{item.topics}</span>
                  </button>
                </Badge>
              )}
            </div>
          )
        })}
      </div>

      {/* The drawer. A narrow card standing up from the bottom edge rather
          than a full-bleed sheet: the topic it names is prerendered and arrives
          in a third of a second, so this is an acknowledgement of the click,
          and something that covers the page to say "one moment" is louder than
          the thing it is announcing.

          `animate-drawer-up` rather than a transition on a state flip — a
          keyframe runs on mount with nothing to toggle, so there is no first
          frame at the destination to hide. */}
      {entering ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-modal flex justify-center px-4"
        >
          <Card
            className="w-full max-w-sm animate-drawer-up motion-reduce:animate-none"
            size="sm"
          >
            <CardHeader>
              <CardTitle>{entering.page.title}</CardTitle>
              <CardAction>
                <Spinner />
              </CardAction>
            </CardHeader>
          </Card>
        </div>
      ) : null}

    </div>
  )
}
