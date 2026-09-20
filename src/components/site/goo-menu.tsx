"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * A menu whose items are drops of goo.
 *
 * The trigger is one gooey pill and every item is a drop parked inside it. On
 * hover (or a click, tap or Enter, which pins it open) the drops leave through
 * the pill's underside on a liquid spring, the nearest first and the others a
 * few frames behind, so for the first ~150ms they hang off the pill as one
 * lobed blob. Each drop drags a tail that follows half-way while it shrinks
 * on a slow-start ease; that is what stretches the neck before it snaps.
 * Settled, the drops sit in a grid 8px apart: far enough that the goo lets go
 * and they read as separate buttons. On leave they fall back on a heavier
 * spring that does not bounce and the pill swallows them; then the pill
 * itself fades and the trigger is a plain ghost button again. Labels ride
 * above the goo and fade in once their drop has pinched off. Safari skips the
 * filter (its SVG-filter-on-HTML repaints are unreliable), leaving a pill and
 * plain stadiums.
 *
 * The grid hangs down and to the left of the trigger, right edge flush with
 * it, because both triggers sit at the right edge of a card that clips its
 * overflow. Rows are filled left to right in reading order, and a partial
 * last row hangs under the pill rather than off to the left, so the drops
 * always read as coming out of it. Column count and drop width are the two
 * things that vary between menus: the install commands are four short words
 * in two columns, the links are a word and some ticket IDs in three.
 *
 * `copiedId` swaps that drop's label for a tick, for the parent that owns
 * the clipboard to say which item just landed on it.
 */

export type GooMenuItem = {
  id: string
  label: string
  onSelect: () => void
}

/* Geometry, in px. The trigger is Button size="icon-sm", 28px square. */
const PILL = 28
const DROP_H = 28
const GAP = 8 // between drops, and between the pill and the first row: over 2σ, so the goo lets go
const SIGMA = 2.5
const PAD = 20 // ≥ 3σ + spring overshoot, so the blur never reaches the layer's edge
const REST = 0.3 // a parked drop's scale: its edge stays over 2σ inside the pill's, or the blur sums and bulges the pill

/**
 * Where each drop settles, relative to the pill's centre, and the box the
 * filtered layer needs to hold all of them plus the blur around them.
 */
function layout(count: number, cols: number, dropWidth: number) {
  const slots = Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / cols)
    const inRow = Math.min(cols, count - row * cols)
    const col = inRow - 1 - (index - row * cols) // 0 hangs directly under the pill
    return {
      x: PILL / 2 - dropWidth / 2 - col * (dropWidth + GAP),
      y: PILL / 2 + GAP + DROP_H / 2 + row * (DROP_H + GAP),
      delay: row * 0.05 + col * 0.025,
      /* Each row down travels further, and a spring's overshoot grows with
         distance, so it gets more damping to keep the bounce in proportion. */
      damping: 17 + row * 5,
    }
  })
  const leftEdge =
    PILL / 2 + Math.min(0, ...slots.map((slot) => slot.x - dropWidth / 2))
  const bottomEdge =
    PILL / 2 + Math.max(PILL / 2, ...slots.map((slot) => slot.y + DROP_H / 2))
  const layer = {
    top: -PAD,
    left: leftEdge - PAD,
    right: -PAD,
    bottom: -(bottomEdge - PILL + PAD),
  }
  /* The pill's centre inside that layer. Every shape is placed from here. */
  const anchor = { left: PILL / 2 - layer.left, top: PILL / 2 + PAD }
  return { slots, layer, anchor }
}

/* The tick, as the icon set draws it: from the left end, down to the vertex,
   then up to the right — the order a hand writes one in, which is the order
   pathLength draws it. Inlined from HugeIcons' Tick02 so it can be drawn on
   the drop rather than swapped in. */
const TICK = "M5 14L8.5 17.5L19 6.5"

const ease = [0.19, 1, 0.22, 1] as const
/* The house out curve (--ease-out-cubic), for the tick: an expo curve draws
   most of the stroke in the first few frames and the hand motion is lost. */
const outCubic = [0.215, 0.61, 0.355, 1] as const
const slowStart = [0.65, 0, 0.35, 1] as const
const swallow = {
  type: "spring",
  stiffness: 220,
  damping: 24,
  mass: 1,
} as const
const snappy = { type: "spring", stiffness: 400, damping: 26, mass: 1 } as const

export function GooMenu({
  label,
  menuLabel,
  icon,
  items,
  copiedId = "",
  cols = 2,
  dropWidth = 48,
  tour,
}: {
  /** Accessible name of the trigger. */
  label: string
  /** Accessible name of the group of drops. */
  menuLabel: string
  icon: React.ReactNode
  items: GooMenuItem[]
  /** The item whose drop shows a tick instead of its label. */
  copiedId?: string
  cols?: number
  dropWidth?: number
  /**
   * Marks this menu for the walkthrough in `hey-click.tsx`. It lands on the
   * root rather than on the trigger, because the walkthrough points at two
   * things here — the pill, and then the drops it throws — and one marker on
   * the thing that contains both is what lets it address either.
   */
  tour?: string
}) {
  const [hovered, setHovered] = React.useState(false)
  const [pinned, setPinned] = React.useState(false)
  /* Which drop the pointer is on, for the hover bump. */
  const [hoverDrop, setHoverDrop] = React.useState<number | null>(null)
  /* A lagging copy of `open`: it follows 400ms after opening, once the drops
     have finished budding, and 300ms after closing, once the pill has
     swallowed them. */
  const [settled, setSettled] = React.useState(false)

  const root = React.useRef<HTMLDivElement>(null)
  const trigger = React.useRef<HTMLButtonElement>(null)
  const leaveTimer = React.useRef<number | undefined>(undefined)
  const reducedMotion = useReducedMotion()
  const id = React.useId().replace(/[^a-zA-Z0-9-]/g, "")
  const gooId = `goo-${id}`
  const menuId = `goo-menu-${id}`

  const open = hovered || pinned
  /* The pill stays solid until the swallow has landed, and only then fades. */
  const lit = open || settled
  /* Until the drops are out, any scale change rides the bud spring with its
     stagger; after, a hover bump is immediate. */
  const out = open && settled

  const { slots, layer, anchor } = layout(items.length, cols, dropWidth)
  const dropStyle = {
    width: dropWidth,
    height: DROP_H,
    marginLeft: -dropWidth / 2,
    marginTop: -DROP_H / 2,
  }

  React.useEffect(() => () => window.clearTimeout(leaveTimer.current), [])

  React.useEffect(() => {
    const timer = window.setTimeout(() => setSettled(open), open ? 400 : 300)
    return () => window.clearTimeout(timer)
  }, [open])

  React.useEffect(() => {
    if (!pinned) return
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setPinned(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [pinned])

  const dropTarget = (index: number) => {
    const { x, y } = slots[index]
    return {
      x: open ? x : 0,
      y: open ? y : 0,
      scale: open ? (out && hoverDrop === index ? 1.08 : 1) : REST,
    }
  }
  const dropTransition = (index: number) => {
    if (reducedMotion) return { duration: 0 }
    if (!open) return swallow
    if (out) return snappy
    const { delay, damping } = slots[index]
    return { type: "spring", stiffness: 266, damping, mass: 1, delay } as const
  }

  return (
    <div
      ref={root}
      data-tour={tour}
      className="relative isolate inline-flex"
      onPointerEnter={(event) => {
        if (event.pointerType === "touch") return
        window.clearTimeout(leaveTimer.current)
        setHovered(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "touch") return
        /* A short grace, so the pointer can cross the gap between the pill
           and the drops without the drops being swallowed under it. */
        window.clearTimeout(leaveTimer.current)
        leaveTimer.current = window.setTimeout(() => setHovered(false), 120)
      }}
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget as Node)) {
          setPinned(false)
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !open) return
        setPinned(false)
        setHovered(false)
        trigger.current?.focus()
      }}
    >
      {/* Gooey filter: blur, then push alpha to 0 or 1, so the pill and the
          drops read as one liquid. Kept in the DOM at size zero, because
          Safari ignores a filter defined inside display: none. */}
      <svg
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute size-0"
      >
        <defs>
          <filter id={gooId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={SIGMA}
              result="blur"
            />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            />
          </filter>
        </defs>
      </svg>

      {/* Filtered layer: shapes only, no text. It sits under the trigger and
          overhangs it by PAD on every side, so nothing the blur touches is
          ever cut flat. Hidden at rest so the trigger matches the ghost
          button beside it, and it fades rather than vanishes so the swallow
          is seen. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute filter-(--goo) supports-[-webkit-hyphens:none]:filter-none"
        style={{ ...layer, "--goo": `url(#${gooId})` } as React.CSSProperties}
        initial={false}
        animate={{ opacity: lit ? 1 : 0 }}
        transition={{ duration: reducedMotion ? 0 : lit ? 0.1 : 0.15 }}
      >
        <span className="absolute size-0" style={anchor}>
          {/* The pill: the trigger's own shape, so it covers the button
              exactly and the button's corners never peek out. */}
          <span
            className="absolute rounded-md bg-foreground"
            style={{
              width: PILL,
              height: PILL,
              marginLeft: -PILL / 2,
              marginTop: -PILL / 2,
            }}
          />
          {items.map((item, index) => {
            const { x, y, delay } = slots[index]
            return (
              <React.Fragment key={item.id}>
                {/* Tail: re-spawns inside the pill on every open and trails
                    the drop half-way while it shrinks, so the neck stretches
                    before it breaks. */}
                <motion.span
                  className="absolute top-0 left-0 rounded-full bg-foreground"
                  style={dropStyle}
                  initial={false}
                  animate={
                    open && !reducedMotion
                      ? { x: [0, x * 0.5], y: [0, y * 0.5], scale: [0.5, 0] }
                      : { x: 0, y: 0, scale: 0 }
                  }
                  transition={
                    open && !reducedMotion
                      ? {
                          duration: 0.4,
                          delay,
                          ease,
                          scale: { duration: 0.4, delay, ease: slowStart },
                        }
                      : { duration: 0 }
                  }
                />
                <motion.span
                  className="absolute top-0 left-0 rounded-full bg-foreground"
                  style={dropStyle}
                  initial={false}
                  animate={dropTarget(index)}
                  transition={dropTransition(index)}
                />
              </React.Fragment>
            )
          })}
        </span>
      </motion.span>

      {/* Ghost, not outline: the card already carries an outlined Open mockup
          and outlined ticket chips, and this is an occasional action. The goo
          pill beneath is its hover state, so the ghost's own tint is switched
          off; it would only paint a muted square over a dark one. `relative`
          puts the button above the filtered layer. */}
      <Button
        ref={trigger}
        aria-label={label}
        aria-expanded={open}
        aria-controls={menuId}
        size="icon-sm"
        variant="ghost"
        className={cn(
          "relative hover:bg-transparent aria-expanded:bg-transparent",
          lit &&
            "text-background hover:text-background aria-expanded:text-background",
        )}
        onClick={() => setPinned((value) => !value)}
      >
        {icon}
      </Button>

      {/* The actions: real buttons riding the same springs as their drops,
          never filtered, so their labels stay crisp. */}
      <div
        id={menuId}
        role="group"
        aria-label={menuLabel}
        inert={!open}
        className="absolute top-1/2 left-1/2 size-0"
      >
        {items.map((item, index) => {
          const { delay } = slots[index]
          const done = copiedId === item.id
          return (
            <motion.button
              key={item.id}
              type="button"
              aria-label={item.label}
              className={cn(
                "absolute top-0 left-0 grid place-items-center rounded-full text-xs leading-none font-medium text-background outline-none select-none [-webkit-tap-highlight-color:transparent]",
                "focus-visible:ring-3 focus-visible:ring-ring/50",
                !open && "pointer-events-none",
              )}
              style={dropStyle}
              initial={false}
              animate={dropTarget(index)}
              transition={dropTransition(index)}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") setHoverDrop(index)
              }}
              onPointerLeave={() =>
                setHoverDrop((value) => (value === index ? null : value))
              }
              onClick={() => {
                item.onSelect()
                setPinned(false)
              }}
            >
              <motion.span
                className="grid place-items-center"
                initial={false}
                animate={{ opacity: open ? 1 : 0 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : open
                      ? { duration: 0.3, ease, delay: delay + 0.16 }
                      : { duration: 0.1 }
                }
              >
                {/* On copy the label gives way to a tick that is drawn, not shown:
                    the stroke runs from its left end down to the vertex and up
                    to the right, the way a hand writes one. Both are always
                    mounted, stacked in one cell, so the swap is a crossfade;
                    the tick leaves by fading and only then resets its length,
                    so it is never seen un-drawing backwards. */}
                <motion.span
                  className="col-start-1 row-start-1"
                  initial={false}
                  animate={{ opacity: done ? 0 : 1, scale: done ? 0.8 : 1 }}
                  transition={{ duration: reducedMotion ? 0 : 0.15, ease }}
                >
                  {item.label}
                </motion.span>
                <motion.svg
                  aria-hidden="true"
                  className="col-start-1 row-start-1 size-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  initial={false}
                  animate={{ opacity: done ? 1 : 0 }}
                  transition={{
                    duration: reducedMotion ? 0 : done ? 0.1 : 0.15,
                  }}
                >
                  <motion.path
                    d={TICK}
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={false}
                    animate={{ pathLength: done ? 1 : 0 }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : done
                          ? { duration: 0.4, delay: 0.08, ease: outCubic }
                          : { duration: 0, delay: 0.15 }
                    }
                  />
                </motion.svg>
              </motion.span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
