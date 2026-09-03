"use client"

import * as React from "react"

import { AppShell } from "@/components/app-shell"
import { MockupShell } from "@/components/mockup-shell"
import { ScenarioEditor } from "@/components/scenario-single-screen/scenario-editor"
import { ScenarioEditor as ScenarioEditorV2 } from "@/components/scenario-single-screen/v2/scenario-editor"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { SCENARIO } from "@/lib/scenario-single-screen-data"

type Version = "1" | "2"

/**
 * The scenario editor with the tabs taken out.
 *
 * Today the editor splits one scenario across Scenario, Configuration and
 * Optimization Opportunities, so nothing about the agent can be read without
 * knowing which tab it was filed under. This puts the whole thing on one
 * screen: the prompt and the first message — the only parts a person writes —
 * take the page, and every other setting becomes a row in a rail that states
 * its current value and opens a drawer to change it.
 *
 * Same settings, same data, same save. What changes is that the scenario can
 * now be read in one pass.
 *
 * Two versions live here. Version 1 is the design as it was reviewed and does
 * not move; version 2 is where the next round of work happens. They are two
 * takes on one design rather than two designs, so they share this route and
 * the switch in the top bar decides which is on screen — a second card on the
 * index would imply the older one is still a candidate.
 */
export default function ScenarioSingleScreenPage() {
  const [version, setVersion] = React.useState<Version>("2")

  /* The Sarj-staff rows are behind `isSuperAdmin` in the app, so they are
     behind a reviewer switch here rather than drawn as if everyone sees them. */
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

          {/* The two switches control different things — which design, and who
              is looking at it — so they get a rule between them rather than
              sitting in one undifferentiated row. */}
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
        {/* Keyed so switching version remounts rather than handing v2 the
            drawer and dirty state v1 was left in. */}
        <Editor isStaff={isStaff} key={version} />
      </AppShell>
    </MockupShell>
  )
}
