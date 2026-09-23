"use client"

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { CloseIcon } from "@/components/design-system/icons"
import { SECTION_FIGURES } from "@/components/design-system/section-figures"
import { Button } from "@/components/ui/button"
import { DOCS_SECTIONS, type DocsSection } from "@/lib/design-system/data"
import { docsHref, sectionHref } from "@/lib/design-system/nav"

/**
 * The five sections as a menu that opens into a grid — after Codrops' "Menu
 * to Grid" (tympanus.net/Development/MenuToGrid), rebuilt on motion/react
 * rather than GSAP + Flip.
 *
 * A row is a section's name, and its topics as a line of small tiles that
 * slide in from the end on hover. Clicking the row grows a cover out of it to
 * fill the screen, sends the other names off the top and bottom, and flies
 * the tiles out of the row into a grid of every topic on that shelf — each
 * one a link to its page. Close runs it backwards.
 *
 * Every row is still a real link to `/design-system/<section>`: the click is
 * only intercepted when it is a plain one, so a middle-click or a new tab
 * gets the section page, and so does a browser without the script.
 *
 * The timings are the reference's, not the house tokens. These are JS-driven
 * and choreographed across a whole screen, which is what the 300ms cap on
 * class-driven motion is not written for; under reduced motion every one of
 * them is zero.
 */

/** power4.inOut — the reference's curve for everything that crosses the
    screen. */
const CROSS = [0.77, 0, 0.175, 1] as const
/** power3.out — the tiles arriving on hover. */
const ARRIVE = [0.215, 0.61, 0.355, 1] as const

type Rect = { top: number; bottom: number }

function topicsOf(section: DocsSection) {
  return section.groups.flatMap((group) => group.pages)
}

/** Two digits, so a column of numbers lines up. */
function ordinal(index: number) {
  return String(index + 1).padStart(2, "0")
}

/**
 * A name that rolls: the old one leaves upward, the new one comes up from
 * below with a slight tilt. Keyed on `turn`, so any change replays it.
 */
function RollingTitle({
  children,
  turn,
  reduced,
}: {
  children: React.ReactNode
  turn: string
  reduced: boolean
}) {
  return (
    <span className="relative inline-grid overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          animate={{ y: "0%", rotate: 0 }}
          className="inline-block origin-left"
          exit={{
            y: "-100%",
            transition: { duration: reduced ? 0 : 0.1, ease: "easeIn" },
          }}
          initial={{ y: "100%", rotate: 15 }}
          key={turn}
          transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.1, ease: CROSS }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function SectionMenu() {
  const reduced = useReducedMotion() ?? false
  const [hovered, setHovered] = useState<string | null>(null)
  const [open, setOpen] = useState<{ id: string; rect: Rect } | null>(null)

  const cross = (delay = 0): Transition => ({
    duration: reduced ? 0 : 0.9,
    delay: reduced ? 0 : delay,
    ease: CROSS,
  })

  /* While the grid is up the page underneath must not scroll, and Escape is
     the close button. */
  useEffect(() => {
    if (!open) return
    const { overflow } = document.body.style
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  const openSection = open
    ? DOCS_SECTIONS.find((section) => section.id === open.id) ?? null
    : null
  const openIndex = open
    ? DOCS_SECTIONS.findIndex((section) => section.id === open.id)
    : -1

  /* The cover's resting shape, as a clip of the whole viewport: the row it
     grew out of. */
  const rowClip = (rect: Rect) =>
    `inset(${rect.top}px 0px calc(100% - ${rect.bottom}px) 0px)`

  return (
    <>
      <ul className="border-b">
        {DOCS_SECTIONS.map((section, index) => {
          const topics = topicsOf(section)
          const isHovered = hovered === section.id && !open
          const isOpen = open?.id === section.id

          /* The other names leave the way the reference sends them: rows
             above the opened one go up, rows below go down. */
          const away = open && !isOpen ? (index < openIndex ? "-100%" : "100%") : "0%"

          return (
            <li className="border-t" key={section.id}>
              <Link
                className="grid grid-cols-[auto_1fr] items-center gap-12 px-6 py-6 transition-colors duration-200 ease-out-cubic hover:bg-muted motion-reduce:transition-none lg:px-12"
                data-no-transition
                href={sectionHref(section.id)}
                onBlur={() => setHovered(null)}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                  event.preventDefault()
                  const box = event.currentTarget.getBoundingClientRect()
                  setHovered(null)
                  setOpen({ id: section.id, rect: { top: box.top, bottom: box.bottom } })
                }}
                onFocus={() => setHovered(section.id)}
                onPointerEnter={() => setHovered(section.id)}
                onPointerLeave={() => setHovered(null)}
              >
                <span className="overflow-hidden">
                  <motion.span
                    animate={{ y: away }}
                    className="block"
                    transition={
                      open
                        ? { duration: reduced ? 0 : 0.5, ease: CROSS }
                        : {
                            duration: reduced ? 0 : 0.5,
                            ease: CROSS,
                            /* Back in as a ripple out from the row that
                               was open, the reference's `stagger.from`. */
                            delay: reduced ? 0 : 0.4 + Math.abs(index - Math.max(openIndex, 0)) * 0.03,
                          }
                    }
                  >
                    <h3 className="text-5xl font-normal tracking-tighter whitespace-nowrap">
                      <RollingTitle reduced={reduced} turn={isHovered ? "on" : "off"}>
                        {section.title}
                      </RollingTitle>
                    </h3>
                  </motion.span>
                </span>

                {/* The shelf's topics, one tile each. Hidden until the row is
                    pointed at; they are the same elements the grid lays out,
                    which is what lets them fly there. */}
                <span aria-hidden="true" className="flex justify-end gap-2">
                  {isOpen
                    ? null
                    : topics.map((topic, i) => (
                        <motion.span
                          animate={
                            isHovered
                              ? { opacity: 1, scale: 1, x: "0%" }
                              : { opacity: 0, scale: 0.8, x: "20%" }
                          }
                          className="size-10 shrink-0 rounded-md bg-card ring-1 ring-border"
                          initial={false}
                          key={topic.id}
                          layoutId={`topic-${topic.id}`}
                          transition={{
                            duration: reduced ? 0 : 0.4,
                            ease: ARRIVE,
                            /* From the end inward, as the reference staggers
                               with a negative step. */
                            delay: reduced || !isHovered ? 0 : (topics.length - 1 - i) * 0.035,
                            layout: cross(i * 0.04),
                          }}
                        />
                      ))}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <AnimatePresence>
        {open && openSection ? (
          <motion.div
            className="fixed inset-0 z-modal overflow-y-auto"
            key="grid"
            role="dialog"
            aria-label={openSection.title}
            aria-modal="true"
          >
            {/* The cover: grows out of the row to the whole screen, and back
                into it on the way out. A clip rather than a height, so it
                costs a repaint and no layout. */}
            <motion.div
              animate={{ clipPath: "inset(0px 0px 0px 0px)" }}
              className="fixed inset-0 bg-muted"
              exit={{ clipPath: rowClip(open.rect), transition: cross(0.3) }}
              initial={{ clipPath: rowClip(open.rect) }}
              transition={cross()}
            />

            <div className="relative mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center gap-10 px-6 py-16">
              <motion.div
                animate={{ opacity: 1 }}
                className="fixed end-4 top-4"
                exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.3 } }}
                initial={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.4 }}
              >
                <Button
                  aria-label="Close"
                  onClick={() => setOpen(null)}
                  size="icon"
                  variant="ghost"
                >
                  <CloseIcon />
                </Button>
              </motion.div>

              <div className="flex flex-col gap-2">
                <span className="overflow-hidden">
                  <motion.h2
                    animate={{ y: "0%", rotate: 0 }}
                    className="origin-right text-6xl font-normal tracking-tighter"
                    exit={{ y: "100%", transition: { duration: reduced ? 0 : 0.6, ease: CROSS } }}
                    initial={{ y: "-100%", rotate: 15 }}
                    transition={{ duration: reduced ? 0 : 1, ease: CROSS }}
                  >
                    {openSection.title}
                  </motion.h2>
                </span>
                <motion.p
                  animate={{ opacity: 1 }}
                  className="max-w-2xl text-base text-muted-foreground"
                  exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.3 } }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.5 }}
                >
                  {openSection.description}
                </motion.p>
              </div>

              <ul className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6">
                {topicsOf(openSection).map((topic, i) => (
                  <li key={topic.id}>
                    <Link className="group flex flex-col gap-2" href={docsHref(topic.id)}>
                      <motion.span
                        className="relative aspect-square w-full rounded-lg bg-card ring-1 ring-border transition-colors duration-150 ease-out-cubic group-hover:ring-ring motion-reduce:transition-none"
                        exit={{ opacity: 0, scale: 0, transition: { duration: reduced ? 0 : 0.5, delay: reduced ? 0 : i * 0.04, ease: CROSS } }}
                        layoutId={`topic-${topic.id}`}
                        transition={{ layout: cross(i * 0.04) }}
                      >
                        <motion.span
                          animate={{ opacity: 1 }}
                          className="absolute start-3 top-3 text-xs tabular-nums text-muted-foreground"
                          initial={{ opacity: 0 }}
                          transition={{ duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 0.9 + i * 0.04 }}
                        >
                          {ordinal(i)}
                        </motion.span>
                      </motion.span>
                      <motion.span
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm font-medium"
                        exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.2 } }}
                        initial={{ opacity: 0, y: 8 }}
                        transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.8 + i * 0.04, ease: ARRIVE }}
                      >
                        {topic.title}
                      </motion.span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* The shelf's drawing, as the sheet the grid is laid out on. */}
              {SECTION_FIGURES[openSection.id] ? (
                <motion.div
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.3 } }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.9 }}
                >
                  {(() => {
                    const SectionFigure = SECTION_FIGURES[openSection.id]
                    return <SectionFigure className="text-border" />
                  })()}
                </motion.div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
