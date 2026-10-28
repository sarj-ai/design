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

const SURFACES = [
  { id: "live", label: "Live scenario" },
  { id: "test", label: "Not-live scenario" },
  { id: "conversation", label: "Conversation details" },
] as const

type Surface = (typeof SURFACES)[number]["id"]

export default function ConfigVersioningPage() {
  const [surface, setSurface] = React.useState<Surface>("live")
  const [caseId, setCaseId] = React.useState<CaseId>("normal")
  const [openAt, setOpenAt] = React.useState<number | undefined>()

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
            // Keyed so each surface and case opens fresh.
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
