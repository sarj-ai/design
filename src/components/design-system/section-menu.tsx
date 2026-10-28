"use client"

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import {
  CopySkillButton,
  FoundationsSheet,
} from "@/components/design-system/foundations-sheet"
import { CloseIcon } from "@/components/design-system/icons"
import { SECTION_FIGURES } from "@/components/design-system/section-figures"
import { TOPIC_FIGURES } from "@/components/design-system/topic-figures"
import { Button } from "@/components/ui/button"
import TextHighlightWave from "@/components/ui/text-highlight-wave"
import { DOCS_SECTIONS, type DocsSection } from "@/lib/design-system/data"
import { DOCS_ROOT, docsHref, sectionHref } from "@/lib/design-system/nav"
import { cn } from "@/lib/utils"

const FULL_WIDTH_TOPICS = new Set([
  "colour",
  "index",
  "admin-view",
  "notifications",
  "developers",
  "unsaved-changes",
  "creation-flow",
  "json-view",
  "alert",
  "integration-card",
  "surfaces",
])

const GROW = { type: "spring", bounce: 0, duration: 0.55 } as const

/** power4.inOut */
const CROSS = [0.77, 0, 0.175, 1] as const
/** power3.out */
const ARRIVE = [0.215, 0.61, 0.355, 1] as const

type Rect = { top: number; bottom: number }

function topicsOf(section: DocsSection) {
  return section.groups.flatMap((group) => group.pages)
}

/** How far below its cell a tile starts, as a percentage of its height. Fixed, not random, to keep render pure. */
function lift(index: number) {
  return (index * 67) % 200
}

function rowRect(id: string): Rect {
  const box = document
    .querySelector(`[data-section-row="${id}"]`)
    ?.getBoundingClientRect()
  return { top: box?.top ?? 0, bottom: box?.bottom ?? 0 }
}

function ordinal(index: number) {
  return String(index + 1).padStart(2, "0")
}

export function SectionMenu({
  views,
  initialSection = null,
  initialTopic = null,
}: {
  views: Record<string, React.ReactNode>
  initialSection?: string | null
  initialTopic?: string | null
}) {
  const reduced = useReducedMotion() ?? false
  const [hovered, setHovered] = useState<string | null>(null)
  /* Keys the name's reveal, so every hover remounts it and replays the glow. */
  const [turns, setTurns] = useState<Record<string, number>>({})
  const enter = (id: string) => {
    setHovered(id)
    setTurns((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }))
  }
  const [open, setOpen] = useState<{ id: string; rect: Rect } | null>(
    initialSection ? { id: initialSection, rect: { top: 0, bottom: 0 } } : null,
  )
  /* `landed` holds the contents back until the page has grown; `lastTopic` outlives the page so its tile stays above its neighbours until it lands. */
  const [topic, setTopic] = useState<{ id: string } | null>(
    initialTopic ? { id: initialTopic } : null,
  )
  const [landed, setLanded] = useState(Boolean(initialTopic))
  const [lastTopic, setLastTopic] = useState<string | null>(initialTopic)

  /* Read inside the popstate listener, which is bound once. */
  const topicRef = useRef(topic)
  useEffect(() => {
    topicRef.current = topic
  })

  /* Close steps back through history entries this page pushed, and only rewrites the address when it must go shallower than it loaded. */
  const base = initialTopic ? 2 : initialSection ? 1 : 0
  const depth = useRef(base)

  useEffect(() => {
    const sync = () => {
      const [sectionId, topicId] = window.location.pathname
        .slice(DOCS_ROOT.length)
        .split("/")
        .filter(Boolean)
      const section = DOCS_SECTIONS.find((item) => item.id === sectionId)
      depth.current = section ? (topicId ? 2 : 1) : 0
      if (!section) {
        setTopic(null)
        setOpen(null)
        return
      }
      setOpen((current) =>
        current?.id === section.id
          ? current
          : { id: section.id, rect: rowRect(section.id) },
      )
      const next = topicsOf(section).some((page) => page.id === topicId)
        ? topicId
        : null
      if (!next) {
        setTopic(null)
      } else if (topicRef.current?.id !== next) {
        setLanded(false)
        setLastTopic(next)
        setTopic({ id: next })
      }
    }
    window.addEventListener("popstate", sync)
    return () => window.removeEventListener("popstate", sync)
  }, [])

  const closeTo = (target: 0 | 1) => {
    if (target >= base) {
      window.history.go(target - depth.current)
      return
    }
    const sectionId = open?.id
    window.history.replaceState(
      null,
      "",
      target === 1 && sectionId ? sectionHref(sectionId) : DOCS_ROOT,
    )
    depth.current = target
    setTopic(null)
    if (target === 0) setOpen(null)
  }
  const closeTopic = () => closeTo(1)
  const closeSection = () => closeTo(0)
  /* For the Escape listener, which is bound before these are declared. */
  const closers = useRef({ topic: closeTopic, section: closeSection })
  useEffect(() => {
    closers.current = { topic: closeTopic, section: closeSection }
  })

  const cross = (delay = 0): Transition => ({
    duration: reduced ? 0 : 0.9,
    delay: reduced ? 0 : delay,
    ease: CROSS,
  })

  useEffect(() => {
    if (!open) return
    const { overflow } = document.body.style
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      if (topic) closers.current.topic()
      else closers.current.section()
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
  const sheet = openSection?.id === "foundations"
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

  const rowClip = (rect: Rect) =>
    `inset(${rect.top}px 0px calc(100% - ${rect.bottom}px) 0px)`
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

          const away =
            open && !isOpen ? (index < openIndex ? "-100%" : "100%") : "0%"

          return (
            <li className="border-t" key={section.id}>
              <Link
                className={cn(
                  "grid grid-cols-[auto_1fr] items-center gap-12 px-6 py-6 transition-colors duration-200 ease-out-cubic motion-reduce:transition-none lg:px-12",
                  isHovered && "bg-primary text-primary-foreground",
                )}
                data-no-transition
                data-section-row={section.id}
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
                  window.history.pushState(null, "", sectionHref(section.id))
                  depth.current = 1
                  const box = event.currentTarget.getBoundingClientRect()
                  setHovered(null)
                  setOpen({
                    id: section.id,
                    rect: { top: box.top, bottom: box.bottom },
                  })
                }}
                onFocus={() => enter(section.id)}
                /* On pointer move, not enter: closing the grid makes the browser report an enter on whichever row was under the close button. */
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
                            delay: reduced
                              ? 0
                              : 0.4 +
                                Math.abs(index - Math.max(openIndex, 0)) * 0.03,
                          }
                    }
                  >
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

                {SectionFigure ? (
                  <span aria-hidden="true" className="flex justify-end">
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

      <AnimatePresence initial={!initialSection}>
        {open && openSection ? (
          <motion.div
            className="fixed inset-0 z-modal overflow-y-auto"
            key="grid"
            role="dialog"
            aria-label={openSection.title}
            aria-modal="true"
          >
            <motion.div
              animate={{ clipPath: "inset(0px 0px 0px 0px)" }}
              className="fixed inset-0 bg-primary"
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
                onClick={closeSection}
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                variant="ghost"
              >
                <CloseIcon />
              </Button>
            </motion.div>

            <div
              className={cn(
                "relative mx-auto flex min-h-full w-full max-w-5xl flex-col gap-10 px-6 py-16",
                !sheet && "justify-center",
              )}
            >
              <div className="flex flex-col items-start gap-2">
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
                {sheet ? (
                  <div className="pt-4">
                    <CopySkillButton />
                  </div>
                ) : null}
              </div>

              {sheet ? (
                <FoundationsSheet section={openSection} views={views} />
              ) : (
                <ul className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6">
                  {topicsOf(openSection).map((topic, i) => {
                    const TopicFigure = TOPIC_FIGURES[topic.id]
                    return (
                      <li key={topic.id}>
                        <Link
                          className="group flex flex-col gap-2 outline-none"
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
                            window.history.pushState(
                              null,
                              "",
                              docsHref(topic.id),
                            )
                            depth.current = 2
                            setLanded(false)
                            setLastTopic(topic.id)
                            setTopic({ id: topic.id })
                          }}
                        >
                          <motion.span
                            animate={{ opacity: 1, scale: 1, y: "0%" }}
                            className={cn(
                              "relative aspect-square w-full rounded-lg ring-2 ring-transparent transition-colors duration-150 ease-out-cubic group-hover:ring-primary-foreground group-focus-visible:ring-primary-foreground motion-reduce:transition-none",
                              lastTopic === topic.id && "z-raised",
                              /* Hidden outright while its page is open: the shared-layout handoff alone let the tile show through. */
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
                            <motion.span
                              className="absolute inset-0 bg-card"
                              layoutId={`topic-page-${topic.id}`}
                              style={{ borderRadius: 10 }}
                              transition={{
                                layout: reduced ? { duration: 0 } : GROW,
                              }}
                            />
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
              )}

              {!sheet && SECTION_FIGURES[openSection.id] ? (
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

            <AnimatePresence>
              {topic && openTopic && openSection ? (
                <div
                  aria-label={openTopic.title}
                  aria-modal="true"
                  /* Above the section's raised tile, so its number cannot show through the page. */
                  className="fixed inset-0 z-overlay"
                  role="dialog"
                >
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
                    onClick={closeTopic}
                    transition={{
                      duration: reduced ? 0 : 0.4,
                      ease: "easeOut",
                    }}
                  />

                  <motion.div
                    className="fixed inset-x-4 top-4 bottom-0 bg-background"
                    layoutId={`topic-page-${topic.id}`}
                    style={{ borderRadius: "24px 24px 0px 0px" }}
                    transition={{ layout: reduced ? { duration: 0 } : GROW }}
                  />

                  {/* Not in its own AnimatePresence: its exit must run with the page's, or it lingers over the shrinking tile. */}
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
                      <div
                        className={cn(
                          "mx-auto flex w-full flex-col gap-8 px-6 pt-14 pb-16",
                          FULL_WIDTH_TOPICS.has(openTopic.id)
                            ? "max-w-none sm:px-10"
                            : "max-w-3xl",
                        )}
                      >
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
                      onClick={closeTopic}
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
