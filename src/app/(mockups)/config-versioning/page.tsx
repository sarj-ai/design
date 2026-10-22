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
import { ConversationVersion } from "@/components/mockups/config-versioning/conversation-version"
import { VersionedEditor } from "@/components/mockups/config-versioning/versioned-editor"
import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
import {
  CASES,
  type CaseId,
  LIVE_SCENARIO,
  TEST_SCENARIO,
} from "@/lib/mockups/config-versioning-data"

/**
 * Configuration versioning — DES-202, for PLT-4477, to the TDD "Live
 * scenarios and configuration versioning" (22 Oct 2026). It builds on
 * DES-203's live status (/live-scenarios); approval is DES-204, a separate
 * feature after both.
 *
 * Scenarios only: a live one (save, then publish) and one that is not live
 * (save is in use from the next call), plus a call's details, which show
 * the version it ran with and open it in history. The select reaches the
 * states the TDD names: a concurrent save, a failed save, history failing
 * to load, view-only, no permission to turn live on or off, a failed
 * publish, and the two ways applying an old version can go wrong.
 */

const SURFACES = [
  { id: "live", label: "Live scenario" },
  { id: "test", label: "Not-live scenario" },
  { id: "conversation", label: "Conversation details" },
] as const

type Surface = (typeof SURFACES)[number]["id"]

export default function ConfigVersioningPage() {
  const [surface, setSurface] = React.useState<Surface>("live")
  const [caseId, setCaseId] = React.useState<CaseId>("normal")
  /* The version a call's details asked to open, in the live scenario. */
  const [openAt, setOpenAt] = React.useState<number | undefined>()

  /* A toast belongs to the surface and case that raised it. */
  React.useEffect(() => {
    toast.dismiss()
  }, [surface, caseId])

  const subject = surface === "test" ? TEST_SCENARIO : LIVE_SCENARIO

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
              if (!next) return
              setSurface(next as Surface)
              setOpenAt(undefined)
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
      title="Configuration versioning: save, publish, history, apply"
    >
      <TooltipProvider>
        <AppShell
          active={surface === "conversation" ? "Conversations" : "Scenarios"}
          breadcrumb={
            surface === "conversation"
              ? "Conversations"
              : ["Scenarios", subject.name]
          }
        >
          {surface === "conversation" ? (
            <ConversationVersion
              onOpenVersion={(n) => {
                setSurface("live")
                setOpenAt(n)
              }}
            />
          ) : (
            /* Keyed so each surface and case opens as the page would find
               it. */
            <VersionedEditor
              caseId={caseId}
              initial={subject}
              key={`${surface}-${caseId}-${openAt ?? ""}`}
              openAt={openAt}
            />
          )}
        </AppShell>
      </TooltipProvider>
    </MockupShell>
  )
}
