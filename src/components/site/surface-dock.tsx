"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DockIcon } from "@/components/shell/workspace-icons"

type DockSection = { id: string; label: string }

// r=8 in a 20px box leaves room for the 2px stroke at any rotation.
const RADIUS = 8
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** The sightline: where a group counts as being read, and where a jump lands its heading. Near the top because groups are short. */
const SIGHTLINE = 0.18

/* --ease-out-cubic, as the array Motion wants. */
const EASE_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1]

// Shared by the visible name and the invisible copies that size the pill; they must match to the pixel.
const NAME = "whitespace-nowrap text-xs font-semibold"

/** Written to the element, not state: this runs on every scroll frame. */
function draw(el: SVGCircleElement, fraction: number) {
  el.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - fraction))
}

export function SurfaceDock({ sections }: { sections: DockSection[] }) {
  const reduce = useReducedMotion()
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const arc = React.useRef<SVGCircleElement | null>(null)
  const progress = React.useRef(0)
  // Outside the effect because the jump below scrolls to one of them.
  const marks = React.useRef<number[]>([0])

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

      // `Math.max` keeps the marks ascending; a group that has not rendered collapses to zero length.
      const at = [0]
      for (let i = 1; i < sections.length; i += 1) {
        const el = document.getElementById(sections[i].id)
        const mark = el ? el.getBoundingClientRect().top + y - line : at[i - 1]
        // Clamped to the max scroll, or a last group near the document end could never become active.
        at.push(Math.min(Math.max(mark, at[i - 1]), maxScroll))
      }
      marks.current = at

      let index = 0
      for (let i = sections.length - 1; i > 0; i -= 1) {
        if (y >= at[i]) {
          index = i
          break
        }
      }

      // The last group runs to the end of the document, so the final ring closes on the last pixel of scroll.
      const end = index + 1 < at.length ? at[index + 1] : maxScroll
      const span = end - at[index]
      const fraction =
        span > 0 ? Math.min(1, Math.max(0, (y - at[index]) / span)) : 1

      progress.current = fraction
      if (arc.current) draw(arc.current, fraction)

      // Same number when unchanged, so React bails out of the render.
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

  const instant = { duration: 0 }
  const swap = reduce ? instant : { duration: 0.2, ease: EASE_OUT }
  const handover = reduce ? instant : { duration: 0.3, ease: EASE_OUT }

  function jump(event: React.MouseEvent, index: number) {
    const to = marks.current[index]
    if (to === undefined) return

    // Scrolls to the group's handover point (+1px), not the element, so a jump and the dock's reading agree.
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
          <motion.button
            className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-popover py-2 pe-4 ps-2.5 text-popover-foreground ring-1 ring-foreground/10 transition-[color,background-color] duration-150 ease-out-cubic outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
            transition={reduce ? instant : { duration: 0.15, ease: EASE_OUT }}
            type="button"
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative block size-5">
              {/* -rotate-90 puts zero at twelve o'clock. */}
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

                {/* One arc per group, keyed, so a handover swaps a full ring for an empty one instead of dropping to zero. */}
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
                    // Nulls ignored: both arcs mount during a handover and share this ref.
                    ref={(el: SVGCircleElement | null) => {
                      if (!el) return
                      arc.current = el
                      draw(el, progress.current)
                    }}
                    stroke="currentColor"
                    strokeDasharray={CIRCUMFERENCE}
                    // No transition on the fill: the scroll is the animation.
                    strokeDashoffset={CIRCUMFERENCE}
                    strokeLinecap="round"
                    strokeWidth="2"
                    // transform-box so the scale hinges on the circle's centre, not the viewBox origin.
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                    }}
                    transition={handover}
                  />
                </AnimatePresence>
              </svg>
            </span>

            {/* Every name renders invisibly in one grid cell, so the pill is as wide as the longest and never resizes. */}
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
