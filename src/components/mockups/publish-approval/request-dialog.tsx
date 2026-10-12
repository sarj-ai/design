"use client"

import * as React from "react"

import { errorId, FieldHeader } from "@/components/design-system/field-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { type CaseId, summaryFor } from "@/lib/mockups/publish-approval-data"

/**
 * Request approval — what Publish becomes on a live scenario.
 *
 * Two fields, so a dialog (the surfaces page: creating, four fields or
 * fewer). The PRD's split is the layout: the summary says what changed, for
 * the client; the note says why. The summary is generated against what
 * callers hear now and is editable here, so an inaccurate one never reaches
 * the client unread (PRD). Both are required — the PRD bars a request
 * without a note, and a request without a summary has nothing for a
 * non-technical reader.
 *
 * States: the summary still being written (the field waits, the note does
 * not), the summary failing (the requester writes it), and the send
 * failing (the dialog stays, with what was typed).
 */
export function RequestDialog({
  open,
  onOpenChange,
  version,
  live,
  org,
  replacing,
  caseId,
  onSend,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  version: number
  /** What callers hear now — the summary's basis. */
  live: number
  org: string
  /** A version already waiting, which sending this withdraws. */
  replacing: number | null
  caseId: CaseId
  /** Resolves false when sending failed. */
  onSend: (request: { summary: string; note: string }) => Promise<boolean>
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {/* Opens on the note, the one field the requester must write — not
          on the summary's (i), which would open its hint on arrival. */}
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          document.getElementById("request-note")?.focus()
        }}
      >
        <DialogHeader>
          <DialogTitle className="tabular-nums">
            Request approval for v{version}
          </DialogTitle>
          <DialogDescription className="tabular-nums">
            {org}’s approvers get an email and a notification. Callers hear v
            {version} once one of them approves.
          </DialogDescription>
        </DialogHeader>
        {/* Keyed so each opening writes its summary afresh. */}
        {open ? (
          <RequestForm
            caseId={caseId}
            key={version}
            live={live}
            onSend={onSend}
            org={org}
            replacing={replacing}
            version={version}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

type Writing = "writing" | "failed" | "ready"

function RequestForm({
  version,
  live,
  org,
  replacing,
  caseId,
  onSend,
}: {
  version: number
  live: number
  org: string
  replacing: number | null
  caseId: CaseId
  onSend: (request: { summary: string; note: string }) => Promise<boolean>
}) {
  const [writing, setWriting] = React.useState<Writing>("writing")
  const [summary, setSummary] = React.useState("")
  const [note, setNote] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const attempts = React.useRef(0)

  React.useEffect(() => {
    const timer = setTimeout(
      () => {
        if (caseId === "summary-failed") {
          setWriting("failed")
          return
        }
        setSummary(summaryFor(version, live))
        setWriting("ready")
      },
      caseId === "summary-writing" ? 4000 : 700,
    )
    return () => clearTimeout(timer)
  }, [caseId, live, version])

  const errors = submitted
    ? {
        summary:
          writing !== "writing" && summary.trim() === ""
            ? "Write what callers will notice."
            : null,
        note: note.trim() === "" ? `Say why ${org} needs it.` : null,
      }
    : { summary: null, note: null }

  async function send() {
    setSubmitted(true)
    if (writing === "writing" || !summary.trim() || !note.trim()) return
    setSending(true)
    setFailed(false)
    attempts.current += 1
    const ok =
      caseId === "send-fails" && attempts.current === 1
        ? await new Promise<boolean>((resolve) =>
            setTimeout(() => resolve(false), 900),
          )
        : await onSend({ summary: summary.trim(), note: note.trim() })
    setSending(false)
    if (!ok) setFailed(true)
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        {failed ? (
          <Alert className="bg-destructive-tint" variant="destructive">
            <AlertTitle>Couldn’t send the request</AlertTitle>
            <AlertDescription>
              Nothing reached {org}. Your summary and note are still here.
            </AlertDescription>
          </Alert>
        ) : null}

        {replacing !== null ? (
          <p className="text-sm text-muted-foreground tabular-nums">
            Sending withdraws the request for v{replacing}.
          </p>
        ) : null}

        {writing === "failed" ? (
          <Alert>
            <AlertTitle>Couldn’t write a summary</AlertTitle>
            <AlertDescription>
              Write what callers will notice. The exact changes still go with
              the request.
            </AlertDescription>
          </Alert>
        ) : null}

        <Field>
          <FieldHeader
            error={errors.summary}
            hint={`What callers will notice, compared with v${live}, which they hear now. ${org} reads this first, and can open the exact changes.`}
            htmlFor="request-summary"
          >
            Summary
          </FieldHeader>
          {writing === "writing" ? (
            <div className="flex h-28 items-center justify-center gap-2 rounded-lg bg-muted text-sm text-muted-foreground">
              <Spinner />
              Writing summary
            </div>
          ) : (
            <Textarea
              aria-describedby={
                errors.summary ? errorId("request-summary") : undefined
              }
              aria-invalid={errors.summary ? true : undefined}
              dir="auto"
              id="request-summary"
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Callers rate their visit from 1 to 5 instead of 1 to 10."
              rows={4}
              value={summary}
            />
          )}
        </Field>

        <Field>
          <FieldHeader error={errors.note} htmlFor="request-note">
            Why it’s needed
          </FieldHeader>
          <Textarea
            aria-describedby={errors.note ? errorId("request-note") : undefined}
            aria-invalid={errors.note ? true : undefined}
            dir="auto"
            id="request-note"
            onChange={(event) => setNote(event.target.value)}
            placeholder="The branch reports moved to a 5-point scale this month."
            rows={3}
            value={note}
          />
        </Field>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button disabled={sending} onClick={send}>
          {sending ? <Spinner /> : null}
          {failed ? "Try again" : "Send request"}
        </Button>
      </DialogFooter>
    </>
  )
}
