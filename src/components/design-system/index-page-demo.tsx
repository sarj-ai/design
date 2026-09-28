"use client"

import { CallTable } from "@/components/design-system/call-table"
import {
  EmptyStatePreview,
  ErrorStatePreview,
  LoadingPreview,
  NoResultsPreview,
} from "@/components/design-system/state-previews"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  { id: "populated", label: "Populated", view: <CallTable /> },
  { id: "loading", label: "Loading", view: <LoadingPreview /> },
  { id: "empty", label: "Empty", view: <EmptyStatePreview /> },
  { id: "no-results", label: "No results", view: <NoResultsPreview /> },
  { id: "error", label: "Error", view: <ErrorStatePreview /> },
]

export function IndexPageDemo() {
  return (
    <Tabs className="gap-6" defaultValue="populated">
      <TabsList>
        {STATES.map((state) => (
          <TabsTrigger key={state.id} value={state.id}>
            {state.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {STATES.map((state) => (
        <TabsContent key={state.id} value={state.id}>
          {state.view}
        </TabsContent>
      ))}
    </Tabs>
  )
}
