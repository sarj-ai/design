"use client"

import * as React from "react"
import { useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import {
  motion,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "motion/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PointerIcon } from "@/components/shell/workspace-icons"
import { TOUR, type Beat } from "@/lib/site/tour"
import { cn } from "@/lib/utils"

const SEEN_KEY = "design-lab:hey-click-seen"

/* Between the control and the loop drawn round it. */
const LOOP_PAD = 6
/* Between that loop and the card parked beside it. */
const STAND_OFF = 16
/* How far behind the pointer the card trails, on both axes. */
const TRAIL = 20
/* How close the pointer gets before the card stops running from it. */
const CATCH = 28
/* Every edge of the viewport the card keeps off. */
const EDGE = 12

// --ease-out-cubic, as Motion takes it.
const OUT_CUBIC = [0.215, 0.61, 0.355, 1] as const
const FLIGHT = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.9,
} as const

type Point = { x: number; y: number }
type Size = { width: number; height: number }
type Box = Point & Size

/** localStorage as an external store. The server snapshot is `true`, so nothing runs before hydration. */
let listeners: (() => void)[] = []

function subscribeSeen(callback: () => void) {
  listeners = [...listeners, callback]
  return () => {
    listeners = listeners.filter((listener) => listener !== callback)
  }
}

function readSeen(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) !== null
  } catch {
    // Storage unavailable (private window, blocked site data): count it as seen.
    return true
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, "1")
  } catch {
    /* Nothing to do — `readSeen` already treats an unreachable store as seen. */
  }

  for (const listener of listeners) listener()
}

export function HeyClick() {
  const seen = useSyncExternalStore(subscribeSeen, readSeen, () => true)

  // Null until the reader starts or ends it; until then the store decides.
  const [manual, setManual] = React.useState<boolean | null>(null)
  // Bumped on every press so the button restarts a running tour.
  const [run, setRun] = React.useState(0)
  const trigger = React.useRef<HTMLButtonElement>(null)

  const running = manual ?? !seen

  const stop = React.useCallback(() => {
    setManual(false)
    markSeen()
  }, [])

  return (
    <>
      <Button
        onClick={() => {
          setRun((count) => count + 1)
          setManual(true)
        }}
        ref={trigger}
        size="sm"
        variant="ghost"
      >
        <PointerIcon />
        Hey, show me around
      </Button>

      {running && typeof document !== "undefined"
        ? createPortal(
            <Coach key={run} onDone={stop} origin={trigger} />,
            document.body,
          )
        : null}
    </>
  )
}

function Coach({
  onDone,
  origin,
}: {
  onDone: () => void
  origin: React.RefObject<HTMLButtonElement | null>
}) {
  const reduced = useReducedMotion()
  const [index, setIndex] = React.useState(0)
  const beat: Beat = TOUR[index]
  const target = beat.target
  const last = index === TOUR.length - 1

  const card = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState<Box | null>(null)

  const [launch] = React.useState<Point>(() => {
    const rect = origin.current?.getBoundingClientRect()
    return rect ? { x: rect.left, y: rect.bottom + 8 } : { x: EDGE, y: EDGE }
  })

  const x = useSpring(launch.x, FLIGHT)
  const y = useSpring(launch.y, FLIGHT)

  const home = React.useRef<Point>(launch)
  const pointer = React.useRef<Point>(launch)

  const advance = React.useCallback(() => setIndex((step) => step + 1), [])

  React.useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY }
    }
    window.addEventListener("pointermove", onMove)
    return () => window.removeEventListener("pointermove", onMove)
  }, [])

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDone()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onDone])

  // `center`, not `start`, keeps the target out from under the floating nav.
  React.useEffect(() => {
    if (!target) return
    document.querySelector(target)?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "center",
    })
  }, [target, reduced])

  // Captured on the way down so a control that stops the event, or unmounts under the pointer, still counts.
  React.useEffect(() => {
    if (!target || beat.advance === "button") return

    const type = beat.advance === "reach" ? "pointerover" : "click"
    const onHit = (event: Event) => {
      const node = event.target
      if (node instanceof Element && node.closest(target)) advance()
    }

    document.addEventListener(type, onHit, true)
    return () => document.removeEventListener(type, onHit, true)
  }, [target, beat.advance, advance])

  React.useEffect(() => {
    let frame = 0

    const tick = () => {
      frame = requestAnimationFrame(tick)

      const found = target ? enclose(target) : null
      setBox((current) => (steady(current, found) ? current : found))

      const size = card.current?.getBoundingClientRect()
      if (!size) return

      const next = found
        ? beside(found, size)
        : reduced
          ? parked(size)
          : trailing(pointer.current, size, home.current)

      home.current = next
      if (reduced) {
        x.jump(next.x)
        y.jump(next.y)
      } else {
        x.set(next.x)
        y.set(next.y)
      }
    }

    tick()
    return () => cancelAnimationFrame(frame)
  }, [target, reduced, x, y])

  return (
    <div className="pointer-events-none fixed inset-0 z-tooltip">
      {box ? (
        <>
          <Loop
            beat={beat.id}
            box={box}
            key={`loop-${beat.id}`}
            reduced={reduced}
          />
          {beat.advance === "button" ? null : (
            <Tap
              box={box}
              from={{ x, y }}
              key={`tap-${beat.id}`}
              reduced={reduced}
            />
          )}
        </>
      ) : null}

      <motion.div
        className="pointer-events-auto absolute top-0 left-0"
        style={{ x, y }}
      >
        <Card className="w-72" ref={card} size="sm">
          <CardContent className="flex flex-col gap-3">
            {/* Keyed on the beat so the line is replaced, which gives it its entrance and makes screen readers read it out. */}
            <p
              aria-live="polite"
              className="animate-pane-in text-sm motion-reduce:animate-none"
              key={beat.id}
            >
              {beat.say}
            </p>

            <div className="flex items-center justify-between gap-3">
              <div aria-hidden className="flex items-center gap-1.5">
                {TOUR.map((entry, step) => (
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      step === index ? "bg-primary" : "bg-border",
                    )}
                    key={entry.id}
                  />
                ))}
              </div>

              {beat.action ? (
                <Button onClick={last ? onDone : advance} size="sm">
                  {beat.action}
                </Button>
              ) : (
                <Button onClick={onDone} size="sm" variant="ghost">
                  Skip
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

/** Motion normalises `pathLength`, so the rectangle can keep resizing under the stroke. */
function Loop({
  beat,
  box,
  reduced,
}: {
  beat: string
  box: Box
  reduced: boolean | null
}) {
  return (
    <svg aria-hidden="true" className="absolute inset-0 size-full">
      <motion.rect
        animate={{ pathLength: 1, opacity: 1 }}
        className="fill-none stroke-primary"
        height={box.height + LOOP_PAD * 2}
        initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }}
        key={beat}
        rx={12}
        strokeWidth={2}
        transition={{ duration: reduced ? 0 : 0.45, ease: OUT_CUBIC }}
        width={box.width + LOOP_PAD * 2}
        x={box.x - LOOP_PAD}
        y={box.y - LOOP_PAD}
      />
    </svg>
  )
}

function Tap({
  box,
  from,
  reduced,
}: {
  box: Box
  from: { x: MotionValue<number>; y: MotionValue<number> }
  reduced: boolean | null
}) {
  const [start] = React.useState<Point>(() => ({
    x: from.x.get(),
    y: from.y.get(),
  }))

  return (
    <motion.div
      animate={{
        opacity: 1,
        scale: 1,
        x: box.x + box.width - 2,
        y: box.y + box.height - 2,
      }}
      className="absolute top-0 left-0 text-primary"
      initial={{
        opacity: reduced ? 1 : 0,
        scale: reduced ? 1 : 0.6,
        x: reduced ? box.x + box.width - 2 : start.x,
        y: reduced ? box.y + box.height - 2 : start.y,
      }}
      transition={reduced ? { duration: 0 } : FLIGHT}
    >
      <motion.span
        animate={reduced ? {} : { scale: [1, 0.82, 1] }}
        className="block"
        transition={{
          duration: 0.45,
          ease: OUT_CUBIC,
          repeat: Infinity,
          repeatDelay: 1.1,
        }}
      >
        <PointerIcon className="size-5" />
      </motion.span>
    </motion.div>
  )
}

function enclose(selector: string): Box | null {
  let top = Infinity
  let left = Infinity
  let right = -Infinity
  let bottom = -Infinity

  for (const node of Array.from(document.querySelectorAll(selector))) {
    const rect = node.getBoundingClientRect()
    if (!rect.width || !rect.height) continue
    top = Math.min(top, rect.top)
    left = Math.min(left, rect.left)
    right = Math.max(right, rect.right)
    bottom = Math.max(bottom, rect.bottom)
  }

  if (top === Infinity) return null
  return { x: left, y: top, width: right - left, height: bottom - top }
}

/** Sub-pixel churn is not a change; re-rendering on it every frame is. */
function steady(a: Box | null, b: Box | null): boolean {
  if (!a || !b) return a === b
  return (
    Math.abs(a.x - b.x) < 0.5 &&
    Math.abs(a.y - b.y) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  )
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), Math.max(low, high))
}

function beside(box: Box, size: Size): Point {
  const after = box.x + box.width + LOOP_PAD + STAND_OFF
  const before = box.x - LOOP_PAD - STAND_OFF - size.width
  const middle = box.y + box.height / 2 - size.height / 2

  if (after + size.width + EDGE <= window.innerWidth) {
    return { x: after, y: clamp(middle, EDGE, floor(size)) }
  }
  if (before >= EDGE) {
    return { x: before, y: clamp(middle, EDGE, floor(size)) }
  }
  return {
    x: clamp(box.x, EDGE, window.innerWidth - size.width - EDGE),
    y: clamp(box.y + box.height + LOOP_PAD + STAND_OFF, EDGE, floor(size)),
  }
}

function trailing(pointer: Point, size: Size, current: Point): Point {
  const caught =
    pointer.x > current.x - CATCH &&
    pointer.x < current.x + size.width + CATCH &&
    pointer.y > current.y - CATCH &&
    pointer.y < current.y + size.height + CATCH

  if (caught) return current
  return {
    x: clamp(pointer.x + TRAIL, EDGE, window.innerWidth - size.width - EDGE),
    y: clamp(pointer.y + TRAIL, EDGE, floor(size)),
  }
}

function parked(size: Size): Point {
  return { x: EDGE, y: floor(size) }
}

function floor(size: Size): number {
  return window.innerHeight - size.height - EDGE
}
