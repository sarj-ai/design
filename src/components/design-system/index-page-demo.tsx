"use client"

import * as React from "react"

import { IndexPagePreview } from "@/components/design-system/page-preview"
import { KnowledgeIndexPreview } from "@/components/design-system/knowledge-index-preview"
import {
  EmptyStatePreview,
  ErrorStatePreview,
  LoadingPreview,
  NoResultsPreview,
} from "@/components/design-system/state-previews"
import { Card, CardContent } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { PrimaryTabs } from "@/components/design-system/tabs-preview"

const STATES = [
  { id: "populated", label: "Populated", view: <IndexPagePreview /> },
  { id: "loading", label: "Loading", view: <LoadingPreview /> },
  { id: "empty", label: "Empty", view: <EmptyStatePreview /> },
  { id: "no-results", label: "No results", view: <NoResultsPreview /> },
  { id: "error", label: "Error", view: <ErrorStatePreview /> },
]

export function IndexPageDemo() {
  const [state, setState] = React.useState(STATES[0].id)

  return (
    <div className="flex flex-col gap-12">
      <PrimaryTabs items={STATES} value={state} onValueChange={setState}>
        {STATES.map((entry) => (
          <TabsContent key={entry.id} value={entry.id}>
            <Card>
              <CardContent>{entry.view}</CardContent>
            </Card>
          </TabsContent>
        ))}
      </PrimaryTabs>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold">With ways to add</h3>
          <p className="text-sm text-muted-foreground">
            When there are several ways in, they sit under the title as tiles
            and the search row keeps only the search.
          </p>
        </div>
        <Card>
          <CardContent>
            <KnowledgeIndexPreview />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
