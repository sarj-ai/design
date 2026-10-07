"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { NavSearch } from "@/components/shell/nav-search"
import { SarjMark } from "@/components/shell/sarj-mark"
import { DOCS_ROOT } from "@/lib/design-system/nav"
import { MOCKUPS } from "@/lib/site/mockups-data"

/**
 * One piece of chrome for the whole lab: a pill that floats over every page.
 *
 * Four plain links, one per place, with the current one filled. They replaced
 * three dropdown menus whose panels listed every surface, reel and section:
 * a reader had to open a menu to find out where a link went, and the index
 * pages those menus opened already list the same things.
 *
 * Floating rather than a bar: the row is `pointer-events-none` and only the
 * pill takes the pointer back, so a page underneath scrolls the full width
 * and nothing has to leave a strip of itself unused.
 */

const PLACES = [
  { href: "/", label: "Mockups" },
  { href: "/reels", label: "Reels showcase" },
  { href: DOCS_ROOT, label: "Design system" },
  { href: "/changelog", label: "Changelog" },
]

/** Which place a path is in. A mockup is a top-level route, so it is matched
    against the index rather than by prefix. */
function placeOf(path: string): string | undefined {
  if (path === "/" || MOCKUPS.some((mockup) => mockup.href === path)) return "/"
  return PLACES.find(
    (place) => place.href !== "/" && path.startsWith(place.href),
  )?.href
}

export function SiteNav({
  title,
  eyebrow,
  actions,
}: {
  /** What this page is, when it is one thing — a mockup, or a reel. */
  title?: string
  eyebrow?: string
  /** This page's own controls, on the end of the pill. */
  actions?: React.ReactNode
}) {
  const active = placeOf(usePathname())

  return (
    <div className="pointer-events-none sticky top-0 z-nav flex justify-center p-4">
      <nav
        aria-label="Design lab"
        className="pointer-events-auto flex max-w-full items-center gap-1 rounded-2xl bg-background/90 p-1.5 ring-1 ring-foreground/15 backdrop-blur-sm"
      >
        <Link
          aria-label="Design lab"
          className="rounded-xl p-1 transition-colors duration-150 ease-out-cubic hover:bg-muted motion-reduce:transition-none"
          href="/"
        >
          <SarjMark />
        </Link>

        {PLACES.map((place) => {
          const current = place.href === active
          return (
            <Button
              asChild
              key={place.href}
              size="sm"
              variant={current ? "secondary" : "ghost"}
            >
              <Link
                aria-current={current ? "page" : undefined}
                href={place.href}
              >
                {place.label}
              </Link>
            </Button>
          )
        })}

        {title ? (
          <>
            <Separator
              className="mx-1 h-5 data-vertical:self-center"
              orientation="vertical"
            />

            {/* Each part capped on its own rather than the pair sharing one
                budget. A mockup's title is a sentence — the ticket's own
                wording — so at the same size as everything else the two of
                them grew the pill to two thirds of the window. Sharing a cap
                then truncated a title that would have fitted, because the
                eyebrow had already spent half of it. The full text is on the
                element, so hovering still gives it. */}
            <div
              className="flex min-w-0 items-baseline gap-1.5"
              title={eyebrow ? `${eyebrow} — ${title}` : title}
            >
              {eyebrow ? (
                <>
                  {/* One step down, not just a lighter grey. Both at `text-sm`
                      the context and the name were one run of text with a
                      colour change in the middle of it. */}
                  <span className="max-w-40 truncate text-xs text-muted-foreground">
                    {eyebrow}
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 text-xs text-muted-foreground/60"
                  >
                    /
                  </span>
                </>
              ) : null}
              <span className="max-w-72 truncate text-sm font-medium">
                {title}
              </span>
            </div>
          </>
        ) : null}

        {actions ? (
          <>
            {/* Its own rule. Without one a bare label like "Case" sat straight
                against the title and read as the end of it. */}
            <Separator
              className="mx-1 h-5 data-vertical:self-center"
              orientation="vertical"
            />
            <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
          </>
        ) : null}

        {/* Last, so it is the end of the pill on every page whether or not
            that page brought a title or controls of its own. */}
        <NavSearch />
      </nav>
    </div>
  )
}
