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
import { cn } from "@/lib/utils"

const PLACES = [
  { href: "/", label: "Mockups" },
  { href: "/reels", label: "Reels showcase" },
  { href: DOCS_ROOT, label: "Design system" },
  { href: "/changelog", label: "Changelog" },
]

/** A mockup is a top-level route, so it is matched against the index rather than by prefix. */
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
  className,
}: {
  title?: string
  eyebrow?: string
  actions?: React.ReactNode
  /** The band's surface, when the page under it is not `bg-background`. */
  className?: string
}) {
  const active = placeOf(usePathname())
  const scrolled = useScrolled()

  return (
    <div
      className={cn(
        "sticky top-0 z-nav flex justify-center border-b bg-background p-4 transition-colors duration-150 ease-out-cubic motion-reduce:transition-none",
        !scrolled && "border-transparent",
        className,
      )}
    >
      <nav
        aria-label="Design lab"
        className="flex max-w-full items-center gap-1 rounded-2xl bg-background p-1.5 ring-1 ring-foreground/15"
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

            <div
              className="flex min-w-0 items-baseline gap-1.5"
              title={eyebrow ? `${eyebrow} — ${title}` : title}
            >
              {eyebrow ? (
                <>
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
            <Separator
              className="mx-1 h-5 data-vertical:self-center"
              orientation="vertical"
            />
            <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
          </>
        ) : null}

        <NavSearch />
      </nav>
    </div>
  )
}

function useScrolled() {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const update = () => setScrolled(window.scrollY > 0)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  return scrolled
}
