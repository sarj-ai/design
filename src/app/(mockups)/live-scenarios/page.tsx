"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PlaygroundList } from "@/components/mockups/live-scenarios/playground-list"
import { ScenarioEditor } from "@/components/mockups/live-scenarios/scenario-editor"
import { ScenarioIndex } from "@/components/mockups/live-scenarios/scenario-index"
import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
import { EDITOR_CASES } from "@/lib/mockups/live-scenarios-data"

const SURFACES = [
  { id: "editor", label: "Editor" },
  { id: "index", label: "Scenarios" },
  { id: "playground", label: "Playground" },
] as const

type Surface = (typeof SURFACES)[number]["id"]

export default function LiveScenariosPage() {
  const [surface, setSurface] = React.useState<Surface>("editor")
  const [caseId, setCaseId] = React.useState(EDITOR_CASES[0].id)
  const editorCase =
    EDITOR_CASES.find((entry) => entry.id === caseId) ?? EDITOR_CASES[0]

  React.useEffect(() => {
    toast.dismiss()
  }, [surface, caseId])

  return (
    <MockupShell
      title="Live scenario status and change warning"
      actions={
        <>
          {surface === "editor" ? (
            <Select value={caseId} onValueChange={setCaseId}>
              <SelectTrigger aria-label="Scenario" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                {EDITOR_CASES.map((entry) => (
                  <SelectItem key={entry.id} value={entry.id}>
                    {entry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <ToggleGroup
            onValueChange={(next) => {
              if (next) setSurface(next as Surface)
            }}
            size="sm"
            type="single"
            value={surface}
            variant="outline"
          >
            {SURFACES.map((entry) => (
              <ToggleGroupItem key={entry.id} value={entry.id}>
                {entry.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </>
      }
    >
      {surface === "editor" ? (
        <AppShell
          active="Scenarios"
          breadcrumb={["Scenarios", editorCase.scenario]}
        >
          {/* Keyed so each case opens as the page would find it. */}
          <ScenarioEditor key={editorCase.id} editorCase={editorCase} />
        </AppShell>
      ) : null}
      {surface === "index" ? (
        <AppShell active="Scenarios">
          <ScenarioIndex />
        </AppShell>
      ) : null}
      {surface === "playground" ? (
        <AppShell active="Playground">
          <PlaygroundList />
        </AppShell>
      ) : null}
    </MockupShell>
  )
}
