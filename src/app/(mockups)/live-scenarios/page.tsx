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
import {
  HEADER_VARIANTS,
  type HeaderVariant,
} from "@/components/mockups/live-scenarios/editor-header"
import { PlaygroundList } from "@/components/mockups/live-scenarios/playground-list"
import { ScenarioEditor } from "@/components/mockups/live-scenarios/scenario-editor"
import { ScenarioIndex } from "@/components/mockups/live-scenarios/scenario-index"
import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
import { EDITOR_CASES } from "@/lib/mockups/live-scenarios-data"

/**
 * Live scenario status and the change warning — DES-203, under INT-257, for
 * PROD-234. The three places the ticket and its comments name: the editor
 * (the switch and the warning), the scenarios index (the chip and the
 * filter), and the playground list (the chip).
 *
 * The bar's last switch picks the surface. On the editor, the first picks
 * one of two takes on the top of the page, and the select picks which
 * scenario the page opens on — live, not live, one that someone turns
 * live while you edit, one you may not switch, and one whose switch fails.
 */

const SURFACES = [
  { id: "editor", label: "Editor" },
  { id: "index", label: "Scenarios" },
  { id: "playground", label: "Playground" },
] as const

type Surface = (typeof SURFACES)[number]["id"]

export default function LiveScenariosPage() {
  const [surface, setSurface] = React.useState<Surface>("editor")
  const [caseId, setCaseId] = React.useState(EDITOR_CASES[0].id)
  const [header, setHeader] = React.useState<HeaderVariant>("strip")
  const editorCase =
    EDITOR_CASES.find((entry) => entry.id === caseId) ?? EDITOR_CASES[0]

  /* A toast belongs to the case that raised it. */
  React.useEffect(() => {
    toast.dismiss()
  }, [surface, caseId])

  return (
    <MockupShell
      title="Live scenario status and change warning"
      actions={
        <>
          {surface === "editor" ? (
            <ToggleGroup
              onValueChange={(next) => {
                if (next) setHeader(next as HeaderVariant)
              }}
              size="sm"
              type="single"
              value={header}
              variant="outline"
            >
              {HEADER_VARIANTS.map((entry) => (
                <ToggleGroupItem key={entry.id} value={entry.id}>
                  {entry.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ) : null}
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
          <ScenarioEditor
            key={editorCase.id}
            editorCase={editorCase}
            header={header}
          />
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
