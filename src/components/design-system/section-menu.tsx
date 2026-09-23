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
import { TOPIC_FIGURES } from "@/components/design-system/topic-figures"
import { Button } from "@/components/ui/button"
import TextHighlightWave from "@/components/ui/text-highlight-wave"
import { DOCS_SECTIONS, type DocsSection } from "@/lib/design-system/data"
import { docsHref, sectionHref } from "@/lib/design-system/nav"
import { cn } from "@/lib/utils"

/**
 * The five sections as a menu that opens into a grid — after Codrops' "Menu
 * to Grid" (tympanus.net/Development/MenuToGrid), rebuilt on motion/react
 * rather than GSAP + Flip.
 *
 * A row is a section's name, and its drawing on the end. Clicking the row
 * grows a purple cover out of it to fill the screen, sends the other names off the
 * top and bottom, and rises a grid of every topic on that shelf into it —
 * each one a link to its page. Close runs it backwards.
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

/** The tile-to-page move: a critically damped spring, so it leaves the tile
    quickly and eases into place with no overshoot — the curve a surface
    growing under a finger has. */
const GROW = { type: "spring", bounce: 0, duration: 0.55 } as const

/** power4.inOut — the reference's curve for everything that crosses the
    screen. */
const CROSS = [0.77, 0, 0.175, 1] as const
/** power3.out — the tile names arriving. */
const ARRIVE = [0.215, 0.61, 0.355, 1] as const

type Rect = { top: number; bottom: number }

function topicsOf(section: DocsSection) {
  return section.groups.flatMap((group) => group.pages)
}

/** How far below its cell a tile starts, as a percentage of its height. The
    reference picks at random; a fixed scatter keeps render pure. */
function lift(index: number) {
  return (index * 67) % 200
}

/** Two digits, so a column of numbers lines up. */
function ordinal(index: number) {
  return String(index + 1).padStart(2, "0")
}

export function SectionMenu({
  views,
}: {
  /** Topic id → what its page renders, shown when a tile opens in place. */
  views: Record<string, React.ReactNode>
}) {
  const reduced = useReducedMotion() ?? false
  const [hovered, setHovered] = useState<string | null>(null)
  /* How many times each row has been entered. The name's reveal is keyed on
     it, so every hover remounts it and the glow plays again. */
  const [turns, setTurns] = useState<Record<string, number>>({})
  const enter = (id: string) => {
    setHovered(id)
    setTurns((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }))
  }
  const [open, setOpen] = useState<{ id: string; rect: Rect } | null>(null)
  /* The topic zoomed open inside the section. `landed` holds its contents
     back until the page has finished growing, so the move animates one
     surface rather than a surface with a long table inside it. `lastTopic`
     outlives the page, so the tile it shrinks back into stays above its
     neighbours until it lands. */
  const [topic, setTopic] = useState<{ id: string } | null>(null)
  const [landed, setLanded] = useState(false)
  const [lastTopic, setLastTopic] = useState<string | null>(null)

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
      if (event.key !== "Escape") return
      /* One layer at a time: a topic's page first, then the section. */
      if (topic) setTopic(null)
      else setOpen(null)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener("keydown", onKey)
    }
  }, [open, topic])

  const openSection = open
    ? (DOCS_SECTIONS.find((section) => section.id === open.id) ?? null)
    : null
  /* The page's contents follow it in as the spring is settling, rather than
     after it has finished — waiting for the last fraction of a spring
     leaves a blank page on screen for a beat. */
  useEffect(() => {
    if (!topic) return
    const timer = window.setTimeout(() => setLanded(true), reduced ? 0 : 300)
    return () => window.clearTimeout(timer)
  }, [topic, reduced])

  const openTopic =
    topic && openSection
      ? (topicsOf(openSection).find((page) => page.id === topic.id) ?? null)
      : null
  const openIndex = open
    ? DOCS_SECTIONS.findIndex((section) => section.id === open.id)
    : -1

  /* The cover's resting shape, as a clip of the whole viewport: the row it
     grew out of. */
  /* The cover's resting shape, as a clip of the whole viewport: the row it
     grew out of. */
  const rowClip = (rect: Rect) =>
    `inset(${rect.top}px 0px calc(100% - ${rect.bottom}px) 0px)`
  /* Where it ends on the way out: no height at all, at the row's middle. */
  const rowLine = (rect: Rect) => {
    const middle = (rect.top + rect.bottom) / 2
    return `inset(${middle}px 0px calc(100% - ${middle}px) 0px)`
  }

  return (
    <>
      <ul className="border-b">
        {DOCS_SECTIONS.map((section, index) => {
          const SectionFigure = SECTION_FIGURES[section.id]
          const isHovered = hovered === section.id && !open
          const isOpen = open?.id === section.id

          /* The other names leave the way the reference sends them: rows
             above the opened one go up, rows below go down. */
          const away =
            open && !isOpen ? (index < openIndex ? "-100%" : "100%") : "0%"

          return (
            <li className="border-t" key={section.id}>
              <Link
                className={cn(
                  "grid grid-cols-[auto_1fr] items-center gap-12 px-6 py-6 transition-colors duration-200 ease-out-cubic motion-reduce:transition-none lg:px-12",
                  /* Pointed at, the row turns brand purple — the same surface
                     the cover opens with, so a click reads as the row
                     growing rather than something new arriving. */
                  isHovered && "bg-primary text-primary-foreground",
                )}
                data-no-transition
                href={sectionHref(section.id)}
                onBlur={() => setHovered(null)}
                onClick={(event) => {
                  if (
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  )
                    return
                  event.preventDefault()
                  const box = event.currentTarget.getBoundingClientRect()
                  setHovered(null)
                  setOpen({
                    id: section.id,
                    rect: { top: box.top, bottom: box.bottom },
                  })
                }}
                onFocus={() => enter(section.id)}
                /* On movement, not on enter. Closing the grid takes the
                   overlay out from under a pointer that has not moved, and
                   the browser reports that as the pointer entering whichever
                   row was behind the close button — which then turned purple
                   and replayed its name for a hover nobody made. */
                onPointerMove={() => {
                  if (hovered !== section.id) enter(section.id)
                }}
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
                            delay: reduced
                              ? 0
                              : 0.4 +
                                Math.abs(index - Math.max(openIndex, 0)) * 0.03,
                          }
                    }
                  >
                    {/* A highlight washes across the name a letter at a
                        time, lifting each one out of a dimmed rest. It runs
                        down the list as it scrolls into view, and again on
                        every hover. */}
                    <TextHighlightWave
                      as="h3"
                      className={cn(
                        "text-start text-5xl leading-tight font-normal tracking-tighter whitespace-nowrap sm:text-5xl",
                        isHovered
                          ? "text-primary-foreground"
                          : "text-foreground",
                      )}
                      delay={turns[section.id] ? 0 : index * 0.12}
                      key={turns[section.id] ?? 0}
                      text={section.title}
                    />
                  </motion.span>
                </span>

                {/* The shelf's drawing, where the reference shows its
                    thumbnails. Held back to `border` ink and lifted on hover,
                    so it is texture until the row is the thing pointed at. */}
                {SectionFigure ? (
                  <span aria-hidden="true" className="flex justify-end">
                    {/* Boxed, so the drawing reads as a plate set into the
                        row rather than lines floating beside the name — and
                        its guides end on the box's edge instead of in air. */}
                    <span
                      className={cn(
                        "block w-80 overflow-hidden rounded-lg ring-1 transition-colors duration-200 ease-out-cubic motion-reduce:transition-none",
                        isHovered
                          ? "bg-primary-foreground/10 ring-primary-foreground/20"
                          : "bg-muted/60 ring-border",
                      )}
                    >
                      <SectionFigure
                        className={cn(
                          "transition-colors duration-200 ease-out-cubic motion-reduce:transition-none",
                          isHovered
                            ? "text-primary-foreground/60"
                            : "text-muted-foreground/40",
                        )}
                      />
                    </span>
                  </span>
                ) : null}
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
              className="fixed inset-0 bg-primary"
              /* Back into the row and on down to a line through its middle,
                 fading as it goes, rather than stopping at the row's full
                 height and vanishing — that last frame read as a snap from a
                 purple row to a white one. */
              exit={{
                clipPath: rowLine(open.rect),
                opacity: 0,
                transition: {
                  clipPath: cross(0.3),
                  opacity: {
                    duration: reduced ? 0 : 0.35,
                    delay: reduced ? 0 : 0.85,
                    ease: "easeOut",
                  },
                },
              }}
              initial={{ clipPath: rowClip(open.rect) }}
              transition={cross()}
            />

            <motion.div
              animate={{ opacity: 1 }}
              className="fixed end-4 top-4"
              exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.3 } }}
              initial={{ opacity: 0 }}
              transition={{
                duration: reduced ? 0 : 0.6,
                delay: reduced ? 0 : 0.4,
              }}
            >
              <Button
                aria-label="Close"
                onClick={() => {
                  setTopic(null)
                  setOpen(null)
                }}
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                variant="ghost"
              >
                <CloseIcon />
              </Button>
            </motion.div>

            <div className="relative mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center gap-10 px-6 py-16">
              <div className="flex flex-col gap-2">
                {/* The page's reveal: a highlight washing across the name,
                    then the line under it, a letter at a time. Each sits in a
                    wrapper that fades on close, since the wave itself has no
                    way out. */}
                <motion.div
                  exit={{
                    opacity: 0,
                    transition: { duration: reduced ? 0 : 0.25 },
                  }}
                >
                  <TextHighlightWave
                    as="h2"
                    className="text-6xl leading-tight font-normal tracking-tighter text-primary-foreground sm:text-6xl"
                    delay={0.35}
                    text={openSection.title}
                  />
                </motion.div>
                <motion.div
                  exit={{
                    opacity: 0,
                    transition: { duration: reduced ? 0 : 0.25 },
                  }}
                >
                  <TextHighlightWave
                    as="p"
                    charStagger={0.006}
                    className="max-w-2xl text-base leading-normal font-normal tracking-normal text-primary-foreground/70 sm:text-base"
                    delay={0.6}
                    text={openSection.description}
                  />
                </motion.div>
              </div>

              <ul className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6">
                {topicsOf(openSection).map((topic, i) => {
                  const TopicFigure = TOPIC_FIGURES[topic.id]
                  return (
                    <li key={topic.id}>
                      <Link
                        className="group flex flex-col gap-2"
                        data-no-transition
                        href={docsHref(topic.id)}
                        onClick={(event) => {
                          if (
                            event.metaKey ||
                            event.ctrlKey ||
                            event.shiftKey ||
                            event.altKey
                          )
                            return
                          event.preventDefault()
                          setLanded(false)
                          setLastTopic(topic.id)
                          setTopic({ id: topic.id })
                        }}
                      >
                        <motion.span
                          animate={{ opacity: 1, scale: 1, y: "0%" }}
                          className={cn(
                            "relative aspect-square w-full rounded-lg ring-2 ring-transparent transition-colors duration-150 ease-out-cubic group-hover:ring-primary-foreground motion-reduce:transition-none",
                            lastTopic === topic.id && "z-raised",
                            /* Hidden outright while its page is open, rather
                             than trusting the shared-layout handoff to hide
                             it — that let the tile and its number show
                             through the page. It reappears on close, which
                             is the moment it takes the surface back. */
                            openTopic?.id === topic.id && "invisible",
                          )}
                          exit={{
                            opacity: 0,
                            scale: 0,
                            transition: {
                              duration: reduced ? 0 : 0.5,
                              delay: reduced ? 0 : i * 0.04,
                              ease: CROSS,
                            },
                          }}
                          initial={{ opacity: 0, scale: 0, y: `${lift(i)}%` }}
                          transition={cross(0.3 + i * 0.04)}
                        >
                          {/* The tile's surface, and the same element as the
                            page it opens into: shared by `layoutId`, so
                            motion moves it between the two boxes with
                            transforms and corrects its corners as it goes. */}
                          <motion.span
                            className="absolute inset-0 bg-card"
                            layoutId={`topic-page-${topic.id}`}
                            style={{ borderRadius: 10 }}
                            transition={{
                              layout: reduced ? { duration: 0 } : GROW,
                            }}
                          />
                          {/* The topic's drawing, from `topic-figures/`. Quiet
                            at rest, brand ink under the pointer. */}
                          {TopicFigure ? (
                            <TopicFigure className="pointer-events-none absolute inset-0 h-full text-muted-foreground/60 transition-colors duration-150 ease-out-cubic group-hover:text-primary motion-reduce:transition-none" />
                          ) : null}
                          <motion.span
                            animate={{ opacity: 1 }}
                            className="absolute start-3 top-3 text-xs tabular-nums text-muted-foreground"
                            initial={{ opacity: 0 }}
                            transition={{
                              duration: reduced ? 0 : 0.3,
                              delay: reduced ? 0 : 0.9 + i * 0.04,
                            }}
                          >
                            {ordinal(i)}
                          </motion.span>
                        </motion.span>
                        <motion.div
                          exit={{
                            opacity: 0,
                            transition: { duration: reduced ? 0 : 0.2 },
                          }}
                        >
                          <TextHighlightWave
                            as="p"
                            charStagger={0.02}
                            className="text-sm leading-normal font-medium tracking-normal text-primary-foreground sm:text-sm"
                            delay={0.8 + i * 0.04}
                            text={topic.title}
                          />
                        </motion.div>
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {/* The shelf's drawing, as the sheet the grid is laid out on. */}
              {SECTION_FIGURES[openSection.id] ? (
                <motion.div
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    transition: { duration: reduced ? 0 : 0.3 },
                  }}
                  initial={{ opacity: 0 }}
                  transition={{
                    duration: reduced ? 0 : 0.6,
                    delay: reduced ? 0 : 0.9,
                  }}
                >
                  {(() => {
                    const SectionFigure = SECTION_FIGURES[openSection.id]
                    return (
                      <div className="overflow-hidden rounded-xl bg-primary-foreground/5 ring-1 ring-primary-foreground/15">
                        <SectionFigure className="text-primary-foreground/40" />
                      </div>
                    )
                  })()}
                </motion.div>
              ) : null}
            </div>

            {/* A topic, zoomed out of its tile into a page over the section. */}
            <AnimatePresence>
              {topic && openTopic && openSection ? (
                <div
                  aria-label={openTopic.title}
                  aria-modal="true"
                  /* Above the section's raised tile, so its number cannot
                     show through the page. */
                  className="fixed inset-0 z-overlay"
                  role="dialog"
                >
                  {/* The section behind, dimmed in the gap the page leaves
                      around itself. */}
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-foreground/40"
                    exit={{
                      opacity: 0,
                      transition: {
                        duration: reduced ? 0 : 0.4,
                        ease: "easeOut",
                      },
                    }}
                    initial={{ opacity: 0 }}
                    onClick={() => setTopic(null)}
                    transition={{
                      duration: reduced ? 0 : 0.4,
                      ease: "easeOut",
                    }}
                  />

                  {/* The page: the tile's own surface, grown to the screen
                      less a gap at the top and sides, standing on the bottom
                      edge with its upper corners rounded — a sheet risen
                      over the section. Closing unmounts it and the tile
                      takes the surface back, shrinking into its slot. */}
                  <motion.div
                    className="fixed inset-x-4 top-4 bottom-0 bg-background"
                    layoutId={`topic-page-${topic.id}`}
                    style={{ borderRadius: "24px 24px 0px 0px" }}
                    transition={{ layout: reduced ? { duration: 0 } : GROW }}
                  />

                  {/* The topic, once the page has nearly landed: a fade and a
                      short rise, scrolling inside the page's own shape —
                      `inset-x-4 top-4` and `rounded-t-3xl` match the page. Not in
                      an AnimatePresence of its own — its exit has to run with
                      the page's, or it lingers over the tile shrinking home. */}
                  {landed ? (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="fixed inset-x-4 top-4 bottom-0 overflow-y-auto rounded-t-3xl"
                      exit={{
                        opacity: 0,
                        transition: { duration: reduced ? 0 : 0.12 },
                      }}
                      initial={{ opacity: 0, y: 8 }}
                      transition={{ duration: reduced ? 0 : 0.3, ease: ARRIVE }}
                    >
                      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pt-14 pb-16">
                        <header className="flex flex-col gap-1">
                          <TextHighlightWave
                            as="p"
                            charStagger={0.02}
                            className="text-sm leading-normal font-normal tracking-normal text-muted-foreground sm:text-sm"
                            text={openSection.title}
                          />
                          <TextHighlightWave
                            as="h2"
                            charStagger={0.03}
                            className="text-2xl leading-tight font-semibold tracking-normal sm:text-2xl"
                            delay={0.1}
                            text={openTopic.title}
                          />
                          <TextHighlightWave
                            as="p"
                            charStagger={0.006}
                            className="max-w-2xl text-sm leading-normal font-normal tracking-normal text-muted-foreground sm:text-sm"
                            delay={0.3}
                            text={openTopic.description}
                          />
                        </header>
                        {views[openTopic.id]}
                      </div>
                    </motion.div>
                  ) : null}

                  <motion.div
                    animate={{ opacity: 1 }}
                    className="fixed end-8 top-8"
                    exit={{
                      opacity: 0,
                      transition: { duration: reduced ? 0 : 0.2 },
                    }}
                    initial={{ opacity: 0 }}
                    transition={{
                      duration: reduced ? 0 : 0.4,
                      delay: reduced ? 0 : 0.4,
                    }}
                  >
                    <Button
                      aria-label="Close"
                      onClick={() => setTopic(null)}
                      size="icon"
                      variant="ghost"
                    >
                      <CloseIcon />
                    </Button>
                  </motion.div>
                </div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
