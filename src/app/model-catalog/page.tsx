"use client"

import * as React from "react"

import { AppShell } from "@/components/app-shell"
import {
  ModelCatalogPage,
  type CatalogState,
} from "@/components/model-catalog/catalog-page"
import { MockupShell } from "@/components/mockup-shell"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/**
 * DES-169 — the model catalog, in the shared product chrome.
 *
 * It sits under Configuration beside the other platform-wide admin surfaces,
 * because onboarding a model is a Sarj-staff action whose result every
 * organization inherits. In bulbul that group is the one gated on
 * `hasSuperAdminRole`, which is where this belongs too.
 */
export default function ModelCatalogRoute() {
  const [state, setState] = React.useState<CatalogState>("populated")

  return (
    <MockupShell
      title="Model catalog — onboarding LLM, activating TTS"
      /* A reviewer control, not a product one: nothing in the app switches a
         page between loaded and failed. Up here it stays out of the design it
         exists to let you check. The states reachable by clicking — no search
         results, a live fetch that timed out, a test that failed — are in the
         page and the dialog themselves. */
      actions={
        <ToggleGroup
          onValueChange={(next) => {
            if (next) setState(next as CatalogState)
          }}
          size="sm"
          type="single"
          value={state}
          variant="outline"
        >
          <ToggleGroupItem value="populated">Populated</ToggleGroupItem>
          <ToggleGroupItem value="empty">Empty</ToggleGroupItem>
          <ToggleGroupItem value="loading">Loading</ToggleGroupItem>
          <ToggleGroupItem value="error">Error</ToggleGroupItem>
        </ToggleGroup>
      }
    >
      <AppShell active="Models">
        <div className="flex flex-1 flex-col p-3 lg:p-4">
          <ModelCatalogPage state={state} />
        </div>
      </AppShell>
    </MockupShell>
  )
}
