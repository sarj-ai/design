"use client"

import { motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

import { ClearIcon, SearchIcon } from "@/components/shell/workspace-icons"
import { Card } from "@/components/ui/card"
import { Kbd } from "@/components/ui/kbd"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { DOCS_SECTIONS } from "@/lib/design-system/data"
import { docsHref } from "@/lib/design-system/nav"
import { MOCKUPS } from "@/lib/site/mockups-data"
import { REELS } from "@/lib/site/reels-data"
import { cn } from "@/lib/utils"

/* `COLLAPSED` matches `InputGroup`'s `h-8`. Width is animated on purpose:
   scaleX would stretch the corner radius over a ~7x growth. */
const COLLAPSED = 32
const EXPANDED = 268

const MAX_RESULTS = 7

type Hit = { group: string; href: string; title: string }

const HAYSTACK: Hit[] = [
  ...DOCS_SECTIONS.flatMap((section) =>
    section.groups.flatMap((group) =>
      group.pages.map((page) => ({
        group: section.title,
        href: docsHref(page.id),
        title: page.title,
      })),
    ),
  ),
  ...MOCKUPS.map((entry) => ({
    group: "Mockups",
    href: entry.href,
    title: entry.title,
  })),
  ...REELS.map((entry) => ({
    group: "Reels showcase",
    href: entry.href,
    title: entry.title,
  })),
]

function search(term: string): Hit[] {
  const needle = term.trim().toLowerCase()
  if (!needle) return []

  return HAYSTACK.filter((hit) => hit.title.toLowerCase().includes(needle))
    .sort((a, b) => {
      const lead =
        Number(b.title.toLowerCase().startsWith(needle)) -
        Number(a.title.toLowerCase().startsWith(needle))
      return lead || a.title.length - b.title.length
    })
    .slice(0, MAX_RESULTS)
}

const NEVER_CHANGES = () => () => {}

/** Empty until hydration: the server cannot know the reader's keyboard. */
function useModifierKey() {
  return React.useSyncExternalStore(
    NEVER_CHANGES,
    () => (navigator.userAgent.includes("Mac") ? "⌘" : "Ctrl"),
    () => "",
  )
}

export function NavSearch() {
  const router = useRouter()
  const reduced = useReducedMotion()
  const modifier = useModifierKey()

  const [open, setOpen] = React.useState(false)
  const [term, setTerm] = React.useState("")
  const [active, setActive] = React.useState(0)

  const rootRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const hits = React.useMemo(() => search(term), [term])

  const close = React.useCallback(() => {
    setOpen(false)
    setTerm("")
    setActive(0)
  }, [])

  // ⌘F deliberately overrides the browser's find bar.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key !== "f" && key !== "k") return
      if (!event.metaKey && !event.ctrlKey) return

      event.preventDefault()
      setOpen(true)
      inputRef.current?.focus()
      inputRef.current?.select()
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // `pointerdown` rather than `click` so it closes on the press that starts an interaction elsewhere.
  React.useEffect(() => {
    if (!open) return

    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close()
    }

    window.addEventListener("pointerdown", onDown)
    return () => window.removeEventListener("pointerdown", onDown)
  }, [close, open])

  const go = (hit: Hit) => {
    close()
    router.push(hit.href)
  }

  return (
    <div className="relative shrink-0" ref={rootRef}>
      {/* `clip`, not `hidden`: `overflow: hidden` makes a scroll container, and focusing the input would scroll it out of line. */}
      <motion.div
        animate={{ width: open ? EXPANDED : COLLAPSED }}
        className="overflow-clip"
        initial={false}
        transition={
          reduced
            ? { duration: 0 }
            : { damping: 26, mass: 1, stiffness: 300, type: "spring" }
        }
      >
        {/* No focus ring: the pill around it already draws one. */}
        <InputGroup className="has-[[data-slot=input-group-control]:focus-visible]:border-input has-[[data-slot=input-group-control]:focus-visible]:ring-0">
          <InputGroupAddon>
            <InputGroupButton
              aria-expanded={open}
              aria-label={open ? "Close search" : "Search the lab"}
              onClick={() => {
                if (open) {
                  close()
                  return
                }
                setOpen(true)
                inputRef.current?.focus()
              }}
              size="icon-xs"
            >
              {open ? <ClearIcon /> : <SearchIcon />}
            </InputGroupButton>
          </InputGroupAddon>

          <InputGroupInput
            aria-label="Search the lab"
            onChange={(event) => {
              setTerm(event.target.value)
              setActive(0)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                close()
                return
              }
              if (!hits.length) return

              if (event.key === "ArrowDown") {
                event.preventDefault()
                setActive((index) => (index + 1) % hits.length)
              }
              if (event.key === "ArrowUp") {
                event.preventDefault()
                setActive((index) => (index - 1 + hits.length) % hits.length)
              }
              if (event.key === "Enter") {
                event.preventDefault()
                const hit = hits[active]
                if (hit) go(hit)
              }
            }}
            placeholder="Search"
            ref={inputRef}
            tabIndex={open ? 0 : -1}
            value={term}
          />

          {open && !term ? (
            <InputGroupAddon align="inline-end">
              <Kbd>{modifier}F</Kbd>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      </motion.div>

      {open && hits.length ? (
        <Card
          className="absolute end-0 top-full z-popover mt-2 w-80 gap-0"
          size="sm"
        >
          {hits.map((hit, index) => (
            <Link
              className={cn(
                "flex items-baseline justify-between gap-3 rounded-md px-2 py-1.5 text-sm",
                index === active ? "bg-muted" : "hover:bg-muted/60",
              )}
              href={hit.href}
              key={`${hit.href}-${hit.title}`}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey) return
                event.preventDefault()
                go(hit)
              }}
              onPointerEnter={() => setActive(index)}
            >
              <span className="truncate">{hit.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {hit.group}
              </span>
            </Link>
          ))}
        </Card>
      ) : null}
    </div>
  )
}
