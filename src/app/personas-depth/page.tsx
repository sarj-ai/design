"use client"

import * as React from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AppShell } from "@/components/app-shell"
import { MockupShell } from "@/components/mockup-shell"
import {
  PersonasIndex,
  type PreviewState,
} from "@/components/personas-depth/personas-index"
import { VoiceLibrary } from "@/components/personas-depth/voice-library"

/**
 * DES-117 — the personas surface in the shared product chrome. Personas and
 * Voice Library are separate pages in the product's sidebar, so they are two
 * views of this one route, switched from the nav — no extra tabs on the page.
 * The state toggle lives in the workspace bar above the design.
 */
export default function PersonasDepthPage() {
  const [previewState, setPreviewState] = React.useState<PreviewState>("data")
  const [view, setView] = React.useState<"Personas" | "Voice Library">(
    "Personas",
  )

  return (
    <MockupShell
      eyebrow="Page depth"
      title="Personas"
      actions={
        <>
          <span className="text-xs text-muted-foreground">Preview</span>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={previewState}
            onValueChange={(value) => {
              if (value) setPreviewState(value as PreviewState)
            }}
          >
            <ToggleGroupItem value="data">Data</ToggleGroupItem>
            <ToggleGroupItem value="loading">Loading</ToggleGroupItem>
            <ToggleGroupItem value="empty">Empty</ToggleGroupItem>
            <ToggleGroupItem value="error">Error</ToggleGroupItem>
          </ToggleGroup>
        </>
      }
    >
      <AppShell
        active={view}
        onNavigate={(title) => {
          if (title === "Personas" || title === "Voice Library") setView(title)
        }}
      >
        {/* Same gutter as the Conversations page, and no page heading for the
            same reason it has none: the sidebar item is already lit and the
            breadcrumb already says Personas, so an <h1> repeats the answer to a
            question nobody asked and costs a row of vertical space above the
            filters. */}
        {/* A flex column with no gap: the column is what lets the empty state's
            own `flex-1` fill the page and centre itself, and no gap keeps the
            filter row at the same y as the Conversations page. It was `block`
            for a moment, which made `flex-1` inert and left the empty state
            pinned to the top above 700px of nothing. */}
        <div className="flex flex-1 flex-col p-3 lg:p-4">
          {view === "Personas" ? (
            <PersonasIndex state={previewState} />
          ) : (
            <VoiceLibrary state={previewState} />
          )}
        </div>
      </AppShell>
    </MockupShell>
  )
}
