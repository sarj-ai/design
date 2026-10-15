"use client"

import * as React from "react"

import { CallTranscript } from "@/components/mockups/tool-calls-transcript/call-transcript"
import { MockupShell } from "@/components/shell/mockup-shell"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CALL_CASES } from "@/lib/mockups/tool-calls-transcript-data"

/**
 * Tool calls in the call transcript — DES-205.
 *
 * Only the transcript panel changes, so only the transcript panel is drawn.
 * The two calls between them cover every result the ticket names: a tool that
 * returned text, a JSON output, an instruction to retry, a failure, a transfer
 * that rang until the caller hung up, and an empty output.
 */
export default function ToolCallsTranscriptPage() {
  const [caseId, setCaseId] = React.useState(CALL_CASES[0].id)
  const active =
    CALL_CASES.find((entry) => entry.id === caseId) ?? CALL_CASES[0]

  return (
    <MockupShell
      title="Tool calls in the call transcript"
      /* Which call is a reviewer control, not a product one. */
      actions={
        <>
          <span className="text-xs text-muted-foreground">Call</span>
          <Select onValueChange={setCaseId} value={caseId}>
            <SelectTrigger aria-label="Call" size="sm">
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
      <main className="mx-auto flex w-full max-w-3xl flex-col p-8">
        <Card>
          <CardContent>
            <CallTranscript
              key={active.id}
              messages={active.messages}
              startedAt={active.startedAt}
            />
          </CardContent>
        </Card>
      </main>
    </MockupShell>
  )
}
