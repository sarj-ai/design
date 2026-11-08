"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { NavSearch } from "@/components/shell/nav-search";
import { SarjMark } from "@/components/shell/sarj-mark";
import { DOCS_ROOT } from "@/lib/design-system/nav";
import { MOCKUPS } from "@/lib/site/mockups-data";
import { cn } from "@/lib/utils";

/** The lab's top-level places — the nav and the index footer both list them. */
export const SITE_PLACES = [
  { href: "/", label: "Mockups" },
  { href: "/reels", label: "Reels showcase" },
  { href: DOCS_ROOT, label: "Design system" },
  { href: "/changelog", label: "Changelog" },
];

/** A mockup is a top-level route, so it is matched against the index rather than by prefix. */
function placeOf(path: string): string | undefined {
  if (path === "/" || MOCKUPS.some((mockup) => mockup.href === path))
    return "/";
  return SITE_PLACES.find(
    (place) => place.href !== "/" && path.startsWith(place.href),
  )?.href;
}

export function SiteNav({
  title,
  eyebrow,
  actions,
  className,
}: {
  title?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  /** The band's surface, when the page under it is not `bg-background`. */
  className?: string;
}) {
  const active = placeOf(usePathname());

  return (
    <div
      className={cn(
        "site-nav-band sticky top-0 z-nav -mb-4 pt-4 pb-8",
        className,
      )}
    >
      {/* The same column as the index under it (max-w-5xl, px-8), so the pill's edges line up with the cards. */}
      <div className="mx-auto w-full max-w-5xl px-8">
        <nav
          aria-label="Design lab"
          className="site-nav-pill nav-enter flex w-full items-center gap-2 rounded-3xl bg-background p-3"
        >
          <Link
            aria-label="Design lab"
            className="nav-logo me-2 rounded-xl p-1"
            href="/"
          >
            <SarjMark />
          </Link>

          {SITE_PLACES.map((place) => {
            const current = place.href === active;
            return (
              <Link
                aria-current={current ? "page" : undefined}
                className="nav-link relative shrink-0 rounded-lg whitespace-nowrap px-2.5 py-1 text-muted-foreground transition-colors duration-150 ease-out-cubic hover:text-foreground aria-[current=page]:text-foreground motion-reduce:transition-none"
                href={place.href}
                key={place.href}
              >
                {place.label}
              </Link>
            );
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

          <div aria-hidden className="flex-1" />

          {actions ? (
            <>
              <div className="flex shrink-0 items-center gap-1.5">
                {actions}
              </div>
            </>
          ) : null}

          <NavSearch />
        </nav>
      </div>
    </div>
  );
}
