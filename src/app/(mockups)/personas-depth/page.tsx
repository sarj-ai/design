"use client"

import * as React from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
import {
  PersonasIndex,
  type PreviewState,
} from "@/components/mockups/personas-depth/personas-index"
import { VoiceLibrary } from "@/components/mockups/personas-depth/voice-library"

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
        {/* A flex column with no gap: the empty state's `flex-1` needs it to fill the page. */}
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
