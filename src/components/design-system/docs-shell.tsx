"use client";

import * as React from "react";

import { SiteNav } from "@/components/shell/site-nav";
import { CopyDesignSystemButton } from "@/components/design-system/overview/copy-design-system";
import { OverviewTour } from "@/components/design-system/overview/overview-tour";
import { type DocsPage, type DocsSection } from "@/lib/design-system/data";

/**
 * Every design-system address is the tour: the overview, a section (landing on its chapter) and a
 * topic (landing on its chapter with the topic's sheet already open).
 */
export function DesignSystemDocs({
  page,
  section,
  views,
}: {
  page: DocsPage | null;
  section: DocsSection | null;
  views: Record<string, React.ReactNode>;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SiteNav
        actions={<CopyDesignSystemButton />}
        className="site-nav-glass"
      />
      <OverviewTour
        initialSection={section?.id ?? null}
        initialTopic={page?.id ?? null}
        views={views}
      />
    </div>
  );
}
