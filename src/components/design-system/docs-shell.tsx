"use client"

import * as React from "react"

import { SiteNav } from "@/components/shell/site-nav"
import { DesignSystemHero } from "@/components/design-system/hero"
import { type DocsPage, type DocsSection } from "@/lib/design-system/data"

/**
 * Every design-system address renders the overview. A section or topic URL
 * opens its overlay already open, so a shared link lands exactly where the
 * sender was.
 */
export function DesignSystemDocs({
  page,
  section,
  views,
}: {
  /** The topic whose pane is open, or null on the overview and a section. */
  page: DocsPage | null
  /** The section open, or the one the topic sits under; null on the
      overview. */
  section: DocsSection | null
  /** Topic id → what its pane renders. */
  views: Record<string, React.ReactNode>
}) {
  /* A section or topic URL opens the same overlay a click on the overview
     does, already open — a shared link lands where the sender was, not on a
     different-looking page. */
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SiteNav />
      {/* The topics' views ride along so a tile in an opened section can
          zoom into its topic in place. */}
      <DesignSystemHero
        initialSection={section?.id ?? null}
        initialTopic={page?.id ?? null}
        views={views}
      />
    </div>
  )
}
