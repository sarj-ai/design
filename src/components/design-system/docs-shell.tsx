"use client"

import Link from "next/link"
import * as React from "react"

import { SiteNav } from "@/components/shell/site-nav"
import { AllSectionsIcon } from "@/components/design-system/icons"
import { Button } from "@/components/ui/button"
import {
  type DocsPage,
  type DocsSection,
} from "@/lib/design-system/data"
import { DOCS_ROOT } from "@/lib/design-system/nav"
import { CopyLinkButton } from "@/components/design-system/copy-link-button"
import { DesignSystemOrbit } from "@/components/design-system/orbit-index"

/**
 * A rail entry while a search is running.
 *
 * Same shape the rail always renders, plus the primitive names that matched
 * under it — the only thing a search puts in the rail that is not otherwise in
 * it, and it hangs off the shelf it belongs to rather than floating loose.
 */

/**
 * The documentation shell: a rail listing every topic, and one topic open
 * beside it.
 *
 * The rail replaces a tab strip that had grown to twelve triggers on two
 * wrapped lines — at that width a tab strip stops being a switch and starts
 * being a list that happens to be horizontal. A rail holds the same list in
 * the shape a list wants, keeps the section it sits under visible, and has
 * room for the twelve primitive groups the strip could never have carried.
 *
 * Views arrive as a prop rather than being built here: the route file stays
 * the place the content lives, which is where anyone editing this page will
 * look first. Every topic has one; a section does not, because a section is a
 * shelf in the rail rather than a page.
 */

export function DesignSystemDocs({
  activeId,
  page,
  section,
  views,
}: {
  /** The rail entry that reads as current. Empty on the overview. */
  activeId: string
  /** The topic whose pane is open, or null on the overview. */
  page: DocsPage | null
  /** The section that topic sits under, or null on the overview. */
  section: DocsSection | null
  /** Topic id → what its pane renders. */
  views: Record<string, React.ReactNode>
}) {
  /* The overview is the orbit figure. `DocsOverview` — a grid of five cards
     listing the same five sections — went with the rail.

     No `AppHeader` on it either. Its trail here read "Home › Design system",
     which is the nav above it saying the same thing twice, and the figure
     wants the height more than the breadcrumb wants the row. A topic still
     gets one, because there the trail names which topic of which section is
     open. */
  if (!page) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <SiteNav />
        <DesignSystemOrbit />
      </div>
    )
  }

  return (
    <>
      <SiteNav />

      {/* No `AppHeader` on a topic either. Its trail restated the nav above
          it and then the title below it, so the row cost height to say a third
          time what the page already says twice. The two controls it carried
          were worth keeping, so they moved onto the page's own header, beside
          the title they act on. */}
      <div className="min-h-0 flex-1 overflow-auto">
        {/* Keyed on the topic so React replaces the pane rather than patching
            it, which is what gives the new one an entrance to play.

            Capped and centred, which the rail used to do by taking 15rem off
            the side. Full-bleed prose on a wide monitor is a 1400px line
            length, and the tables on these pages still have room at this
            width. */}
        <main
          className="mx-auto flex w-full max-w-5xl animate-pane-in flex-col gap-8 p-3 motion-reduce:animate-none lg:p-4"
          key={activeId}
        >
          <header className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              {/* Which shelf this topic sits on. The breadcrumb said it and is
                  gone; a topic title alone does not tell you that Choice is a
                  shadcn component rather than a pattern. */}
              {section && page.id !== section.id ? (
                <p className="text-sm text-muted-foreground">{section.title}</p>
              ) : null}
              <h1 className="text-2xl font-semibold">{page.title}</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {page.description}
              </p>
            </div>

            {/* Pinned to the title's line rather than centred on the block, as
                every other trailing action in this system is. */}
            <div className="flex shrink-0 items-center gap-2">
              {/* Every topic has an address, so the one thing a reader wants
                  from a reference page — hand this exact page to someone — is
                  a control rather than a trip to the address bar. */}
              <CopyLinkButton />
              {/* With the rail gone this is the only way back up. */}
              <Button asChild size="sm" variant="outline">
                <Link href={DOCS_ROOT}>
                  <AllSectionsIcon />
                  All sections
                </Link>
              </Button>
            </div>
          </header>

          {views[activeId]}
        </main>
      </div>
    </>
  )
}
