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
import { TooltipProvider } from "@/components/ui/tooltip"
import { VersionedEditor } from "@/components/mockups/config-versioning/versioned-editor"
import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
import {
  CASES,
  type CaseId,
  GLOBAL_PROMPT,
  LIVE_SCENARIO,
  TEST_SCENARIO,
} from "@/lib/mockups/config-versioning-data"

/**
 * Configuration versioning — DES-202, under INT-253, for PLT-4477. The spec
 * is the "Configuration versioning" requirements doc; it builds on DES-203's
 * live status (/live-scenarios) and leaves approval to DES-204.
 *
 * The three things the PRD versions, one per surface: a live scenario (save,
 * then publish), a not-live scenario (save is what runs), and the global
 * prompt (always live). The select reaches the states the ticket names:
 * a concurrent save, a summary still being written, history failing to load,
 * view-only, and a publish that fails.
 */

const SURFACES = [
  { id: "live", label: "Live scenario" },
  { id: "test", label: "Not-live scenario" },
  { id: "global", label: "Global prompt" },
] as const

type Surface = (typeof SURFACES)[number]["id"]

export default function ConfigVersioningPage() {
  const [surface, setSurface] = React.useState<Surface>("live")
  const [caseId, setCaseId] = React.useState<CaseId>("normal")

  /* A toast belongs to the surface and case that raised it. */
  React.useEffect(() => {
    toast.dismiss()
  }, [surface, caseId])

  const subject =
    surface === "live"
      ? LIVE_SCENARIO
      : surface === "test"
        ? TEST_SCENARIO
        : GLOBAL_PROMPT

  /* In the summary case the newest version's summary is still being
     written when the page opens. */
  const initial =
    caseId === "summary-pending"
      ? {
          ...subject,
          versions: subject.versions.map((version, index) =>
            index === 0 ? { ...version, summary: null } : version,
          ),
        }
      : subject

  return (
    <MockupShell
      actions={
        <>
          <Select
            onValueChange={(value) => setCaseId(value as CaseId)}
            value={caseId}
          >
            <SelectTrigger aria-label="State" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" position="popper">
              {CASES.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToggleGroup
            aria-label="Surface"
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
      title="Configuration versioning: save, publish, history, rollback"
    >
      <TooltipProvider>
        <AppShell
          active={surface === "global" ? "Global Prompts" : "Scenarios"}
          breadcrumb={
            surface === "global"
              ? "Global Prompts"
              : ["Scenarios", subject.name]
          }
        >
          {/* Keyed so each surface and case opens as the page would find it. */}
          <VersionedEditor
            caseId={caseId}
            initial={initial}
            key={`${surface}-${caseId}`}
          />
        </AppShell>
      </TooltipProvider>
    </MockupShell>
  )
}
