"use client"

import * as React from "react"

import { SiteNav } from "@/components/shell/site-nav"
import { DesignSystemHero } from "@/components/design-system/hero"
import { type DocsPage, type DocsSection } from "@/lib/design-system/data"

export function DesignSystemDocs({
  page,
  section,
  views,
}: {
  page: DocsPage | null
  section: DocsSection | null
  views: Record<string, React.ReactNode>
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SiteNav />
      <DesignSystemHero
        initialSection={section?.id ?? null}
        initialTopic={page?.id ?? null}
        views={views}
      />
    </div>
  )
}
