"use client"

import * as React from "react"

import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
import { ScenarioEditor } from "@/components/mockups/scenario-single-screen/scenario-editor"
import { ScenarioEditor as ScenarioEditorV2 } from "@/components/mockups/scenario-single-screen/v2/scenario-editor"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { SCENARIO } from "@/lib/mockups/scenario-single-screen-data"

type Version = "1" | "2"

export default function ScenarioSingleScreenPage() {
  const [version, setVersion] = React.useState<Version>("2")

  const [isStaff, setIsStaff] = React.useState(false)

  const Editor = version === "1" ? ScenarioEditor : ScenarioEditorV2

  return (
    <MockupShell
      title="Scenario editor on one screen"
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Version</span>
            <ToggleGroup
              onValueChange={(value) => {
                if (value) setVersion(value as Version)
              }}
              size="sm"
              type="single"
              value={version}
              variant="outline"
            >
              <ToggleGroupItem value="1">1</ToggleGroupItem>
              <ToggleGroupItem value="2">2</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Separator className="h-5" orientation="vertical" />

          <div className="flex items-center gap-2">
            <Label htmlFor="staff-view">Sarj staff</Label>
            <Switch
              checked={isStaff}
              id="staff-view"
              onCheckedChange={setIsStaff}
            />
          </div>
        </div>
      }
    >
      <AppShell active="Scenarios" breadcrumb={`Scenarios · ${SCENARIO.name}`}>
        {/* Keyed so switching version remounts, dropping v1's drawer and dirty state. */}
        <Editor isStaff={isStaff} key={version} />
      </AppShell>
    </MockupShell>
  )
}
