"use client"

import * as React from "react"

import { AppShell } from "@/components/shell/app-shell"
import {
  ModelCatalogPage,
  type CatalogState,
} from "@/components/mockups/model-catalog/catalog-page"
import { MockupShell } from "@/components/shell/mockup-shell"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function ModelCatalogRoute() {
  const [state, setState] = React.useState<CatalogState>("populated")

  return (
    <MockupShell
      title="Model catalog — onboarding LLM, activating TTS"
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
