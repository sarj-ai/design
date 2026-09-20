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

/**
 * A walkthrough that points at the real page instead of drawing a picture of
 * it.
 *
 * It replaced a two-step dialog. That dialog had to reproduce the card and
 * the command inside itself, so the reader met a drawing of the control,
 * dismissed it, and then had to find the real one — which is the whole
 * problem it existed to solve. This one never covers the page: a small card
 * rides the reader's pointer, and when a beat is about a control it leaves,
 * draws a loop round that control, parks a pointer glyph on it, and waits for
 * the reader to actually do it. The reader finishes the tour having installed
 * a screen, not having read about installing one.
 *
 * Three things move, and each answers a question a sentence would otherwise
 * have to:
 *
 *  - **the card** — where the voice is. It trails the pointer while there is
 *    nothing to point at, and stands still the moment the pointer comes for
 *    it, so its own button is always catchable.
 *  - **the loop** — which control. Drawn, not faded in, because a stroke that
 *    arrives by being written reads as somebody pointing.
 *  - **the glyph** — what to do to it. It flies out of the card, lands on the
 *    control and taps, for as long as the beat is waiting.
 *
 * Under reduced motion none of that happens: the card is parked at the foot
 * of the viewport, the loop is simply there, and the glyph does not tap.
 *
 * It opens itself once and then never again — the flag lives in localStorage,
 * and the nav keeps a button so it is reachable rather than gone.
 */
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

/* The design system's entering curve, in the form JS animation takes it. */
const OUT_CUBIC = [0.215, 0.61, 0.355, 1] as const
/* Firm enough to arrive inside a beat, loose enough to read as a hand. */
const FLIGHT = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.9,
} as const

type Point = { x: number; y: number }
type Size = { width: number; height: number }
type Box = Point & Size

/**
 * Whether this browser has been shown the walkthrough, as an external store.
 *
 * `localStorage` is exactly what `useSyncExternalStore` is for: it is state
 * React does not own, it does not exist on the server, and reading it in an
 * effect to then `setState` is the cascading render the lint rule rejects.
 * The server snapshot is `true` — nothing is running in the HTML, and only a
 * browser that has never seen it starts after hydration.
 */
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
    /* A private window, or site data blocked. The dismissal could not be
       remembered either, so it counts as seen rather than greeting the same
       person on every visit. The nav button still starts it. */
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

  /* Null until the reader starts or ends it themselves; until then the store
     decides, which is what makes the first visit run it and every later one
     not. */
  const [manual, setManual] = React.useState<boolean | null>(null)
  /* Bumped on every press, so the button restarts a tour already running
     rather than being a control that does nothing. */
  const [run, setRun] = React.useState(0)
  const trigger = React.useRef<HTMLButtonElement>(null)

  const running = manual ?? !seen

  const stop = React.useCallback(() => {
    setManual(false)
    markSeen()
  }, [])

  return (
    <>
      {/* Ghost, in the nav's actions: this is the thing you need once, and
          that is the thing you come back for. */}
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

/**
 * The tour itself, mounted only while it runs.
 *
 * Everything it measures is live — the install menu's drops spring out of
 * their pill over about 400ms, and the loop is drawn round where they are
 * this frame, not where they were when the beat started. So one animation
 * frame loop owns the whole thing: it measures the beat's target, decides
 * where the card belongs, and hands both to springs. Nothing here polls when
 * the tour is not running, because when the tour is not running this
 * component does not exist.
 */
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

  /* The coach comes out of the button that summoned it. On a first visit
     nobody pressed that button, but it is still the thing in the nav that
     this is about, so it is still where the card arrives from. */
  const [launch] = React.useState<Point>(() => {
    const rect = origin.current?.getBoundingClientRect()
    return rect ? { x: rect.left, y: rect.bottom + 8 } : { x: EDGE, y: EDGE }
  })

  const x = useSpring(launch.x, FLIGHT)
  const y = useSpring(launch.y, FLIGHT)

  /* Where the springs are heading, kept so the card can hold a position
     rather than recompute one while the pointer is over it. */
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

  /* A control the reader cannot see is a control they cannot be asked to
     press. The nav floats over the top of the page, so `center` rather than
     `start` — it is what keeps the card out from under the pill. */
  React.useEffect(() => {
    if (!target) return
    document.querySelector(target)?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "center",
    })
  }, [target, reduced])

  /* The beat ends when the reader does it, not when they press Next. Captured
     on the way down, so a control that stops the event on its own — or
     unmounts under the pointer, which the drops do — still counts. */
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
            {/* Keyed on the beat so the line is replaced rather than patched,
                which is what gives the new one its entrance — and what makes
                a screen reader read it out rather than diff it. */}
            <p
              aria-live="polite"
              className="animate-pane-in text-sm motion-reduce:animate-none"
              key={beat.id}
            >
              {beat.say}
            </p>

            <div className="flex items-center justify-between gap-3">
              {/* Position, not a control: four dots read as "there is more"
                  without adding a second thing to press. */}
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

              {/* A beat the reader answers on the page has no button of its
                  own — the page is the button. All it needs is the way out. */}
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

/**
 * The loop round the control the beat is about.
 *
 * Drawn rather than faded in: `pathLength` runs the stroke round the shape
 * the way a hand would, which is what separates "look here" from a box that
 * was always there. Motion normalises the path length, so the rectangle can
 * keep changing size under it — and on the drops beat it does, every frame,
 * while they spring out of their pill.
 */
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

/**
 * The pointer glyph, thrown from the card onto the control.
 *
 * It taps for as long as the beat is waiting, because the beat is waiting for
 * a tap — the one piece of looping motion in the lab, and it stops the
 * instant the reader does the thing. It starts wherever the card was standing
 * when the beat began, which is why it reads as having been sent rather than
 * as having appeared.
 */
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

/**
 * One box round everything the beat is about.
 *
 * A selector matching four drops gets one loop round the four, not four
 * loops: the beat is "pick one of these", and four separate rings would be
 * four separate instructions. Zero-sized nodes are skipped — a drop still
 * parked inside its pill has no geometry worth pointing at.
 */
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

/**
 * Beside the control, on whichever side the viewport has room for.
 *
 * The inline-end side first, so the card sits where the reading eye is
 * already heading; the start side when the control is too close to the far
 * edge; and under it when neither side fits, which on this page means a
 * narrow window rather than a wide card.
 */
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

/**
 * Behind the pointer — until the pointer comes for the card.
 *
 * A card that keeps its offset from the pointer is a card whose own button
 * can never be pressed: every approach pushes it further away. So once the
 * pointer is within reach of it, it holds still and lets itself be caught.
 */
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

/**
 * Where the card waits when it has been asked not to move.
 *
 * The foot of the viewport, at the start edge: the surface dock sits at the
 * centre of that line and the toasts arrive at the end of it, and this is the
 * one position on the page that is spoken for by neither.
 */
function parked(size: Size): Point {
  return { x: EDGE, y: floor(size) }
}

/** The lowest the card's top edge can sit and still be whole. */
function floor(size: Size): number {
  return window.innerHeight - size.height - EDGE
}
