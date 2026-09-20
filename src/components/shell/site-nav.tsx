"use client"

import * as React from "react"
import Link from "next/link"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Separator } from "@/components/ui/separator"
import { SarjMark } from "@/components/shell/sarj-mark"
import {
  MockupsFigure,
  ReelsFigure,
  SystemFigure,
} from "@/components/shell/nav-figures"
import { DOCS_SECTIONS } from "@/lib/design-system/data"
import { DOCS_ROOT } from "@/lib/design-system/nav"
import { REELS } from "@/lib/site/reels-data"
import { groupBySurface, MOCKUPS, surfaceId } from "@/lib/site/mockups-data"
import { cn } from "@/lib/utils"

/**
 * One piece of chrome for the whole lab: a pill that floats over every page.
 *
 * It replaced four different headers — the index's row of buttons, the reel
 * index's back link, and the identical sticky bars `MockupShell` and
 * `ReelPage` each carried — which between them meant the way to the design
 * system existed on exactly one page, and the way to the reels on two.
 *
 * Three menus, and each one opens the same shape: a drawing of the thing on
 * the left, and every address under it on the right. The drawing is not
 * decoration — it carries the measurement that governs what the menu opens,
 * which is the one fact a list of links cannot state. See `nav-figures.tsx`.
 *
 * The panel is `NavigationMenu`'s shared viewport, so moving between menus
 * resizes one panel rather than closing a box and opening another. That
 * resize is the animation; it is the primitive's, which is why there is no
 * layout transition written anywhere in this file.
 *
 * Floating rather than a bar: the row is `pointer-events-none` and only the
 * pill takes the pointer back, so a page underneath scrolls the full width
 * and nothing has to leave a strip of itself unused.
 */

type NavLink = { href: string; label: string }

type Menu = {
  id: string
  label: string
  feature: { href: string; title: string; body: string }
  figure: (props: { className?: string }) => React.ReactElement
  links: NavLink[]
  /** Two columns of links, for the one menu with more than five. */
  wide?: boolean
}

const MENUS: Menu[] = [
  {
    id: "mockups",
    label: "Mockups",
    feature: {
      href: "/",
      title: "All mockups",
      body: "Every screen in the lab, grouped by the surface it redesigns.",
    },
    figure: MockupsFigure,
    /* The index's own groups, so a surface nothing has been designed for yet
       never appears here — the same list the page renders, from the same
       function. */
    links: groupBySurface(MOCKUPS).map(({ surface }) => ({
      href: `/#${surfaceId(surface)}`,
      label: surface ?? "No surface label",
    })),
    wide: true,
  },
  {
    id: "reels",
    label: "Reels",
    feature: {
      href: "/reels",
      title: "All reels",
      body: "Release videos, each one a composition on the same canvas.",
    },
    figure: ReelsFigure,
    links: REELS.map(({ href, title }) => ({ href, label: title })),
  },
  {
    id: "design-system",
    label: "Design system",
    feature: {
      href: DOCS_ROOT,
      title: "The written system",
      body: "Every rule the mockups are built from, one topic per address.",
    },
    figure: SystemFigure,
    links: DOCS_SECTIONS.map((section) => ({
      href: `${DOCS_ROOT}/${section.id}`,
      label: section.title,
    })),
  },
]

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
  return (
    <div className="pointer-events-none sticky top-0 z-nav flex justify-center p-4">
      <nav
        aria-label="Design lab"
        className="pointer-events-auto flex max-w-full items-center gap-1 rounded-2xl bg-background/85 p-1.5 ring-1 ring-foreground/10 backdrop-blur-sm"
      >
        <Link
          aria-label="Design lab"
          className="rounded-xl p-1 transition-colors duration-150 ease-out-cubic hover:bg-muted motion-reduce:transition-none"
          href="/"
        >
          <SarjMark />
        </Link>

        {/* The name only where nothing else is named. On a mockup the title
            below says where you are, and two names in one pill is one too
            many. */}
        {title ? null : (
          <span className="pe-2 ps-1 text-sm font-semibold">Design lab</span>
        )}

        <NavigationMenu>
          <NavigationMenuList>
            {MENUS.map((menu) => (
              <NavigationMenuItem key={menu.id}>
                <NavigationMenuTrigger>{menu.label}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <Panel menu={menu} />
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {title ? (
          <>
            <Separator
              className="mx-1 h-5 data-vertical:self-center"
              orientation="vertical"
            />
            <div className="flex min-w-0 items-center gap-2 pe-2">
              {eyebrow ? (
                <span className="truncate text-sm text-muted-foreground">
                  {eyebrow}
                </span>
              ) : null}
              <span className="truncate text-sm font-medium">{title}</span>
            </div>
          </>
        ) : null}

        {actions ? (
          <div className="flex shrink-0 items-center gap-1">{actions}</div>
        ) : null}
      </nav>
    </div>
  )
}

/**
 * One menu's panel: the drawing and the addresses, in one row.
 *
 * The hover state moves the drawing and brightens it rather than tinting the
 * cell alone — the drawing is the largest thing in the panel, so it is what
 * the pointer is actually over.
 */
function Panel({ menu }: { menu: Menu }) {
  const Figure = menu.figure

  return (
    <div className={cn("grid grid-cols-2", menu.wide ? "w-192" : "w-160")}>
      <NavigationMenuLink asChild>
        <Link
          className="group/cell flex flex-col gap-1 overflow-hidden border-e p-4 transition-colors duration-150 ease-out-cubic hover:bg-muted/50 motion-reduce:transition-none"
          href={menu.feature.href}
        >
          <span className="text-sm font-medium">{menu.feature.title}</span>
          <span className="text-sm text-muted-foreground">
            {menu.feature.body}
          </span>

          {/* Pulled out to the cell's edges so the guide lines run off the
              sides, which is what makes it read as a drawing cropped from a
              sheet rather than a picture placed in a box. */}
          <div className="-mx-4 -mb-4 mt-4 overflow-hidden">
            <Figure className="text-border transition duration-200 ease-out-cubic group-hover/cell:-translate-y-1 group-hover/cell:text-muted-foreground/60 motion-reduce:transition-none" />
          </div>
        </Link>
      </NavigationMenuLink>

      <ul
        className={cn(
          "grid content-start gap-0.5 p-2",
          menu.wide && "grid-cols-2",
        )}
      >
        {menu.links.map((link) => (
          <li key={link.href}>
            <NavigationMenuLink asChild>
              <Link
                className="block truncate rounded-lg px-3 py-2 text-sm transition-colors duration-150 ease-out-cubic hover:bg-muted motion-reduce:transition-none"
                href={link.href}
              >
                {link.label}
              </Link>
            </NavigationMenuLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
