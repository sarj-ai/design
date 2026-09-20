"use client"

import { motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

import { PRIMITIVE_NAMES } from "@/components/design-system/component-catalog"
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

/**
 * The lab's search, folded into the nav as an icon until it is wanted.
 *
 * It replaces the field that lived in the design system's sidebar rail and went
 * with it. A permanent input in a floating pill would cost that width on every
 * page to serve the few visits that are a search; an icon costs one control and
 * opens into the same field.
 *
 * **Width is the animated property, deliberately.** The house rule is transform
 * and opacity only, and the usual substitute — `scaleX` on a pill — is wrong
 * here: this control grows about seven times its collapsed size, and a uniform
 * scale drags the corner radius out with it, so a 12px radius arrives as an
 * 84px lozenge that snaps back on settle. The reflow is confined to one leaf
 * inside a pill that is already `position: sticky` on its own layer, which is
 * the case the rule's own carve-out describes. Everything else here is opacity.
 *
 * The spring is the long-travel one rather than the snappy one: over 200px a
 * lightly damped spring overshoots far enough to read as a bounce, and a search
 * field that wobbles reads as a toy.
 */

/**
 * Collapsed to the icon button, and opened to the field. In pixels.
 *
 * `COLLAPSED` is `InputGroup`'s own `h-8`, so the closed control is a square
 * and reads as one icon button among the others in the pill rather than as a
 * field that has been squashed.
 */
const COLLAPSED = 32
const EXPANDED = 268

/** Nothing below this is worth a panel; nothing above it is worth reading. */
const MAX_RESULTS = 7

type Hit = { group: string; href: string; title: string }

/**
 * Everything addressable in the lab, flattened once.
 *
 * Built at module scope: the four sources are static imports, so rebuilding
 * this per keystroke would be recomputing a constant.
 */
const HAYSTACK: Hit[] = [
  ...DOCS_SECTIONS.flatMap((section) =>
    section.groups.flatMap((group) =>
      group.pages.flatMap((page) => {
        const topic: Hit = {
          group: section.title,
          href: docsHref(page.id),
          title: page.title,
        }

        /* A primitive is not a page, but it is what people actually search
           for — "Tooltip" is findable even though the topic is "Overlays". */
        return [
          topic,
          ...(PRIMITIVE_NAMES[page.id] ?? []).map((name) => ({
            group: page.title,
            href: docsHref(page.id),
            title: name,
          })),
        ]
      }),
    ),
  ),
  ...MOCKUPS.map((entry) => ({
    group: "Mockups",
    href: entry.href,
    title: entry.title,
  })),
  ...REELS.map((entry) => ({
    group: "Reels",
    href: entry.href,
    title: entry.title,
  })),
]

function search(term: string): Hit[] {
  const needle = term.trim().toLowerCase()
  if (!needle) return []

  /* Titles that start with the term first: typing "to" should reach Tooltip
     before it reaches "Empty and zero states", which merely contains a "to". */
  return HAYSTACK.filter((hit) => hit.title.toLowerCase().includes(needle))
    .sort((a, b) => {
      const lead =
        Number(b.title.toLowerCase().startsWith(needle)) -
        Number(a.title.toLowerCase().startsWith(needle))
      return lead || a.title.length - b.title.length
    })
    .slice(0, MAX_RESULTS)
}

/** The keyboard never changes under us, so there is nothing to subscribe to. */
const NEVER_CHANGES = () => () => {}

/**
 * Which modifier to print in the shortcut hint.
 *
 * It depends on the reader's keyboard, which the server cannot know, so the
 * hint is empty until hydration rather than rendering one modifier and
 * correcting itself to the other in front of the reader.
 */
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

  /* Opened from the keyboard, because the one thing a search behind an icon
     loses is that you can no longer just start typing at it.

     ⌘F over the browser's own find bar, which is the trade the index made
     before this replaced its field: find-in-page searches the cards already
     on screen, not the pages a query would reach. ⌘K as well, since it costs
     nothing and is what most people try first. */
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

  /* A click anywhere else puts it away. `pointerdown` rather than `click` so it
     closes on the press that starts an interaction elsewhere, not after it. */
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
      <motion.div
        animate={{ width: open ? EXPANDED : COLLAPSED }}
        className="overflow-hidden"
        initial={false}
        transition={
          reduced
            ? { duration: 0 }
            : { damping: 26, mass: 1, stiffness: 300, type: "spring" }
        }
      >
        {/* No focus ring. This sits inside a pill that already draws a ring
            of its own, so the control's own ring lands a second edge a
            hair inside the first. Focus still reads: the field is only this
            wide because it was opened, and it holds the caret. */}
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
            /* Out of the tab order while it is a 36px sliver — the button
               beside it is the control at that width. */
            tabIndex={open ? 0 : -1}
            value={term}
          />

          {/* The hint the index's field carried. A search folded into an icon
              is a shortcut nobody can discover, so it says so while it is
              open and empty, and gets out of the way once there is a query. */}
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
