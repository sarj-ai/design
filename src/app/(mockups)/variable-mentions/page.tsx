"use client"

import * as React from "react"

import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  SCENARIO,
  VARIABLE_STATES,
  variablesFor,
  type VariablesState,
} from "@/lib/mockups/variable-mentions-data"

import {
  CHIP_TREATMENTS,
  type ChipTreatment,
} from "@/components/mockups/variable-mentions/chip-treatment"
import { ScenarioPrompt } from "@/components/mockups/variable-mentions/scenario-prompt"

/**
 * Variables as `@` mentions in the scenario editor.
 *
 * Today an author types `{{guest_name}}` by hand and the editor tints the
 * braces blue. PROD-80 replaces the typing with an `@` picker; this page is
 * the direction for what that picker and the chip it inserts look like.
 * Three colour treatments are on the switch in the top bar so the team can
 * compare them on the same prompt rather than on three separate screens —
 * "By kind" is the recommended one and the one the page opens on.
 */
export default function VariableMentionsPage() {
  const [treatment, setTreatment] = React.useState<ChipTreatment>("kind")
  const [state, setState] = React.useState<VariablesState>("populated")
  const [viewOnly, setViewOnly] = React.useState(false)

  /* The chips in the prompt resolve against the loaded scenario either way;
     only the picker waits. */
  const variables = React.useMemo(
    () => variablesFor(state === "loading" ? "populated" : state),
    [state],
  )

  return (
    <MockupShell
      title="Variable mentions in the scenario editor"
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Chip colour</span>
            <ToggleGroup
              onValueChange={(value) => {
                if (value) setTreatment(value as ChipTreatment)
              }}
              size="sm"
              type="single"
              value={treatment}
              variant="outline"
            >
              {CHIP_TREATMENTS.map((option) => (
                <ToggleGroupItem key={option.value} value={option.value}>
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <Separator className="h-5" orientation="vertical" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Variables</span>
            <ToggleGroup
              onValueChange={(value) => {
                if (value) setState(value as VariablesState)
              }}
              size="sm"
              type="single"
              value={state}
              variant="outline"
            >
              {VARIABLE_STATES.map((option) => (
                <ToggleGroupItem key={option.value} value={option.value}>
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <Separator className="h-5" orientation="vertical" />

          <div className="flex items-center gap-2">
            <Label htmlFor="view-only">View only</Label>
            <Switch
              checked={viewOnly}
              id="view-only"
              onCheckedChange={setViewOnly}
            />
          </div>
        </div>
      }
    >
      <AppShell active="Scenarios" breadcrumb={["Scenarios", SCENARIO.name]}>
        <ScenarioPrompt
          treatment={treatment}
          variables={variables}
          variablesLoading={state === "loading"}
          viewOnly={viewOnly}
        />
      </AppShell>
    </MockupShell>
  )
}
