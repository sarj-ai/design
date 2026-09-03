"use client"

import * as React from "react"

import { AppShell } from "@/components/app-shell"
import { ModelSettingsTab } from "@/components/call-turn-timing/model-settings-tab"
import { MockupShell } from "@/components/mockup-shell"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CALL_CASES } from "@/lib/call-turn-timing-data"

/**
 * Turn timing on the call detail — DES-173.
 *
 * Global Settings and the persona editor already carry the minimum and maximum
 * wait. What no surface carries is what a given call actually did with them, so
 * this is the one screen the ticket still needs.
 *
 * The tabs are the four states of the same panel, not four designs. A reader
 * checks a pacing complaint against whichever one the call landed in.
 */
export default function CallTurnTimingPage() {
  const [caseId, setCaseId] = React.useState(CALL_CASES[0].id)
  const active =
    CALL_CASES.find((entry) => entry.id === caseId) ?? CALL_CASES[0]

  return (
    <MockupShell
      eyebrow="Call detail · Model settings"
      title="Turn timing on the call detail"
      /* The four cases are a reviewer control, not a product one — no button in
         the app switches a call for another. In the page body they were a tab
         row a reader could mistake for part of the panel, and their summary
         line repeated what the tiles below already say. */
      actions={
        <>
          <span className="text-xs text-muted-foreground">Case</span>
          <Select onValueChange={setCaseId} value={caseId}>
            <SelectTrigger aria-label="Call case" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
      {/* The panel lives on a call's Model Settings tab, so it is reviewed
          inside the app chrome rather than full-bleed on a blank page. */}
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
