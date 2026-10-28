"use client"

import * as React from "react"

import { AppShell } from "@/components/shell/app-shell"
import { ModelSettingsTab } from "@/components/mockups/call-turn-timing/model-settings-tab"
import { MockupShell } from "@/components/shell/mockup-shell"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CALL_CASES } from "@/lib/mockups/call-turn-timing-data"

export default function CallTurnTimingPage() {
  const [caseId, setCaseId] = React.useState(CALL_CASES[0].id)
  const active =
    CALL_CASES.find((entry) => entry.id === caseId) ?? CALL_CASES[0]

  return (
    <MockupShell
      eyebrow="Call detail · Model settings"
      title="Turn timing on the call detail"
      actions={
        <>
          <span className="text-xs text-muted-foreground">Case</span>
          <Select onValueChange={setCaseId} value={caseId}>
            <SelectTrigger aria-label="Call case" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {CALL_CASES.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      }
    >
      <AppShell active="Conversations" breadcrumb="Conversations · Call detail">
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 lg:p-4">
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">
              {active.call.organization}
            </h1>
            <p className="text-sm text-muted-foreground">
              {active.call.direction} · {active.call.duration} ·{" "}
              {active.call.language} · {active.call.id}
            </p>
          </header>

          <Card>
            <CardContent>
              <ModelSettingsTab timing={active.timing} voice={active.voice} />
            </CardContent>
          </Card>
        </main>
      </AppShell>
    </MockupShell>
  )
}
