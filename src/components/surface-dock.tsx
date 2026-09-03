"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DockIcon } from "@/components/workspace-icons"

/**
 * The dock: a pill at the foot of the index carrying a ring that fills as the
 * surface group under the reader is read, the name of that group, and the list
 * of every group when it is clicked.
 *
 * It sits at the foot rather than the top on purpose. The index is a document
 * you scan, not a site you navigate: the questions it gets asked are "which
 * surface am I in" — which a row of tabs cannot answer — and "take me to
 * Settings", which tabs answer by spending a strip of every screen on links
 * most readers use once. The dock answers both and costs nothing at the top of
 * the page, where the search field is.
 *
 * The ring measures the GROUP, not the page. One arc creeping down a list of
 * nine groups barely moves per screen, and it answers a question nobody asks.
 * Per group it moves visibly and lands on a full circle exactly as the next
 * group takes over — so each one gets a circle of its own to complete.
 *
 * Ported from the Flipsuite brand kit's section dock. The structure is that
 * one; every colour, size and duration is this repo's.
 */

export type DockSection = { id: string; label: string }

/* Ring geometry. r=8 in a 20px box leaves 2px for the 2px stroke to sit inside
   without clipping at any rotation. */
const RADIUS = 8
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Where down the viewport a group counts as "the one being read", and — the
 * same thing — where the dock lands a group's heading when you jump to it.
 *
 * Near the top, because these groups are short. A sightline at mid-screen
 * would mean a one-card group was never the answer: you would ask for
 * Personas, its heading would go to the top of the window, and the middle of
 * the window would already be showing Scenario Edit — so the dock would name
 * the group below the one you asked for. At 0.18 the heading lands just under
 * the top edge and every group is wider than the band that reads it.
 */
const SIGHTLINE = 0.18

/* --ease-out-cubic, as the array Motion wants. */
const EASE_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1]

/* The name's own type, written once because two elements have to agree on it
   to the pixel: the visible name, and the invisible copies of every other name
   that hold the box open behind it. A difference between them would size the
   pill for a word nobody can see. */
const NAME = "whitespace-nowrap text-xs font-semibold"

/**
 * The arc's fill, written straight to the element.
 *
 * Straight to the element, and not through state, because this runs on every
 * scroll frame — a `setState` here would re-render the dock 60 times a second.
 * Nothing else in it depends on the number, so nothing else needs to know it
 * changed.
 */
function draw(el: SVGCircleElement, fraction: number) {
  el.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - fraction))
}

export function SurfaceDock({ sections }: { sections: DockSection[] }) {
  const reduce = useReducedMotion()
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const arc = React.useRef<SVGCircleElement | null>(null)
  const progress = React.useRef(0)
  /* The scroll position at which each group takes over, kept outside the
     effect because the jump below scrolls to one of them. */
  const marks = React.useRef<number[]>([0])

  /* One read per frame, off the native scroll event. */
  React.useEffect(() => {
    let queued = false

    function read() {
      queued = false

      const y = window.scrollY
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      )
      const line = window.innerHeight * SIGHTLINE

      /* Every group's handover point, in document coordinates: the scroll
         position at which it crosses the sightline and becomes the one being
         read. The first group has none to measure — it owns the top.

         `Math.max` against the previous mark keeps the list ascending whatever
         the DOM says. A group that has not rendered collapses to zero length
         here and is stepped over, instead of turning the arithmetic below
         inside out. */
      const at = [0]
      for (let i = 1; i < sections.length; i += 1) {
        const el = document.getElementById(sections[i].id)
        const mark = el ? el.getBoundingClientRect().top + y - line : at[i - 1]
        /* Ascending whatever the DOM says, and never past the end of the
           scroll. A last group that starts within a viewport of the document
           end has a handover point nobody can scroll to, so without the clamp
           it could never become the active one — you would reach the foot of
           the page and the dock would still name the group above. */
        at.push(Math.min(Math.max(mark, at[i - 1]), maxScroll))
      }
      marks.current = at

      /* The last mark the reader is past. Walking backwards and stopping at
         the first hit is the same answer as filtering and taking the last,
         minus the array. */
      let index = 0
      for (let i = sections.length - 1; i > 0; i -= 1) {
        if (y >= at[i]) {
          index = i
          break
        }
      }

      /* How far through that group's own span the reader is. The last group
         runs to the end of the document rather than to a next mark, which is
         what makes the final ring close on the final pixel of scroll. A span
         of zero has no progress to report, so call it read. */
      const end = index + 1 < at.length ? at[index + 1] : maxScroll
      const span = end - at[index]
      const fraction =
        span > 0 ? Math.min(1, Math.max(0, (y - at[index]) / span)) : 1

      progress.current = fraction
      if (arc.current) draw(arc.current, fraction)

      /* The same number when nothing has changed, so React bails out of the
         render rather than re-running one per frame. */
      setActive(index)
    }

    function onScroll() {
      if (queued) return
      queued = true
      requestAnimationFrame(read)
    }

    read()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [sections])

  /* A search can drop the group the dock was sitting in before the scroll
     handler has run again. */
  const current = sections[Math.min(active, sections.length - 1)]

  /* Reduced motion is answered by collapsing the durations to zero rather than
     by dropping the animations: same states, same code path, no movement. */
  const instant = { duration: 0 }
  const swap = reduce ? instant : { duration: 0.2, ease: EASE_OUT }
  const handover = reduce ? instant : { duration: 0.3, ease: EASE_OUT }

  function jump(event: React.MouseEvent, index: number) {
    const to = marks.current[index]
    if (to === undefined) return

    /* Scrolled to the group's own handover point rather than to the element,
       so asking for a group and the dock naming it are the same position by
       construction. `scrollIntoView` would land the heading at the top of the
       window, which for a short group is already past it. One pixel over, so
       the comparison in `read` is a clear pass and not a tie.

       Taken over from the anchor for that reason and for the smooth scroll;
       the href stays on the element for keyboard and right-click. */
    event.preventDefault()
    window.scrollTo({ behavior: reduce ? "auto" : "smooth", top: to + 1 })

    setOpen(false)
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-nav flex justify-center px-4">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          asChild
          aria-label={`${current.label}. Open the surface list`}
        >
          {/* Not a `<Button>`: a pill is a shape Button does not own, and
              reaching past it to set radius and height would fork it. */}
          <motion.button
            className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-popover py-2 pe-4 ps-2.5 text-popover-foreground ring-1 ring-foreground/10 transition-[color,background-color] duration-150 ease-out-cubic outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
            transition={reduce ? instant : { duration: 0.15, ease: EASE_OUT }}
            type="button"
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative block size-5">
              {/* -rotate-90 puts zero at twelve o'clock, which is where a
                  progress ring is read from. Track and arc share one geometry
                  so the arc cannot sit off its own groove. */}
              <svg className="size-full -rotate-90" viewBox="0 0 20 20">
                <circle
                  className="text-border"
                  cx="10"
                  cy="10"
                  fill="none"
                  r={RADIUS}
                  stroke="currentColor"
                  strokeWidth="2"
                />

                {/* One arc per group, keyed to it, so the handover is a swap
                    and not a jump: the outgoing ring is full at the moment it
                    is replaced, and it leaves by opening outward past its own
                    track while the new empty one drops in under it. Without
                    that, the arc would fall from a complete circle to nothing
                    between two frames and a reader who blinked would see it
                    quietly lose its progress. */}
                <AnimatePresence initial={false}>
                  <motion.circle
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-primary"
                    cx="10"
                    cy="10"
                    exit={{ opacity: 0, scale: 1.3 }}
                    fill="none"
                    initial={{ opacity: 0, scale: 0.7 }}
                    key={current.id}
                    r={RADIUS}
                    /* Nulls ignored: both arcs are mounted during a handover
                       and they share this ref, so taking the null React sends
                       when the outgoing one finally leaves would blank the
                       pointer to the arc that replaced it. Painting on attach
                       is what gives a fresh arc the right fill immediately. */
                    ref={(el: SVGCircleElement | null) => {
                      if (!el) return
                      arc.current = el
                      draw(el, progress.current)
                    }}
                    stroke="currentColor"
                    strokeDasharray={CIRCUMFERENCE}
                    /* No transition on the fill itself. The scroll IS the
                       animation; easing it would put the ring behind the thing
                       it measures. */
                    strokeDashoffset={CIRCUMFERENCE}
                    strokeLinecap="round"
                    strokeWidth="2"
                    /* transform-box so the scale hinges on the circle's own
                       centre — an SVG child's origin is the viewBox by
                       default, and the ring would fly off its corner. */
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                    }}
                    transition={handover}
                  />
                </AnimatePresence>
              </svg>
            </span>

            {/* The name, turning over inside a box that cannot change size.
                Every name the dock can show is rendered here, invisible, all
                stacked into ONE grid cell — so the cell is as wide as the
                longest of them, always, and the visible name lies on top of
                it. There is no flow for the two names to fight over, so the
                pill holds still and the chevron never hears about a change.

                A pill that resizes as you scroll was never the better version,
                and the width it settles on is a decision made once rather than
                a layout animation on every handover. */}
            <span className="relative grid justify-items-center">
              {sections.map((section) => (
                <span
                  aria-hidden
                  className={`${NAME} invisible col-start-1 row-start-1`}
                  key={`sizer-${section.id}`}
                >
                  {section.label}
                </span>
              ))}

              <AnimatePresence initial={false}>
                <motion.span
                  animate={{ opacity: 1, y: 0 }}
                  className={`${NAME} col-start-1 row-start-1`}
                  /* Rises by the 6px the name it replaced falls by, so the
                     swap reads as one word turning over rather than as two
                     words trading places. */
                  exit={{ opacity: 0, y: -6 }}
                  initial={{ opacity: 0, y: 6 }}
                  key={current.id}
                  transition={swap}
                >
                  {current.label}
                </motion.span>
              </AnimatePresence>
            </span>

            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              className="flex shrink-0 text-muted-foreground"
              transition={swap}
            >
              <DockIcon className="size-3.5" />
            </motion.span>
          </motion.button>
        </PopoverTrigger>

        <PopoverContent
          align="center"
          aria-label="Surfaces"
          className="w-56 gap-0.5 p-1.5"
          side="top"
          sideOffset={8}
        >
          {sections.map((section, index) => (
            <Button
              asChild
              className={
                section.id === current.id
                  ? "w-full justify-start bg-primary-tint text-primary-tint-foreground"
                  : "w-full justify-start"
              }
              key={section.id}
              size="sm"
              variant="ghost"
            >
              <a
                href={`#${section.id}`}
                onClick={(event) => jump(event, index)}
              >
                {section.label}
              </a>
            </Button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  )
}
