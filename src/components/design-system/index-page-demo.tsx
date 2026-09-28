"use client"

import * as React from "react"

import { IndexPagePreview } from "@/components/design-system/page-preview"
import {
  EmptyStatePreview,
  ErrorStatePreview,
  LoadingPreview,
  NoResultsPreview,
} from "@/components/design-system/state-previews"
import { Card, CardContent } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { PrimaryTabs } from "@/components/design-system/tabs-preview"

/**
 * The index page, whole: the populated page and the four states it can be in
 * instead, one tab each.
 *
 * Built only from what the Patterns section already defines — the list table
 * from Index page, and the Loading, Empty state, No results and Error
 * previews — so this and those pages cannot drift apart. Tabs, because these
 * are one page in five states, not five pages.
 */
const STATES = [
  { id: "populated", label: "Populated", view: <IndexPagePreview /> },
  { id: "loading", label: "Loading", view: <LoadingPreview /> },
  { id: "empty", label: "Empty", view: <EmptyStatePreview /> },
  { id: "no-results", label: "No results", view: <NoResultsPreview /> },
  { id: "error", label: "Error", view: <ErrorStatePreview /> },
]

export function IndexPageDemo() {
  const [state, setState] = React.useState(STATES[0].id)

  /* The state switch sits above the page, not inside it: it is a control on
     the demo, and inside the card it read as part of the index page. */
  return (
    <PrimaryTabs items={STATES} value={state} onValueChange={setState}>
      {STATES.map((entry) => (
        <TabsContent key={entry.id} value={entry.id}>
          <Card>
            <CardContent>{entry.view}</CardContent>
          </Card>
        </TabsContent>
      ))}
    </PrimaryTabs>
  )
}
