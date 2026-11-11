"use client";

import * as React from "react";

import { errorId, FieldHeader } from "@/components/design-system/field-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  type CaseId,
  summaryFor,
} from "@/lib/mockups/global-prompt-versioning-data";

export function RequestDialog({
  open,
  onOpenChange,
  version,
  live,
  replacing,
  caseId,
  onSend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  version: number;
  live: number;
  replacing: number | null;
  caseId: CaseId;
  onSend: (request: { summary: string; note: string }) => Promise<boolean>;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById("request-note")?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="tabular-nums">
            Request approval for v{version}
          </DialogTitle>
          <DialogDescription className="tabular-nums">
            Approvers get an email and a notification. Every scenario gets v
            {version} once one of them approves.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <RequestForm
            caseId={caseId}
            key={version}
            live={live}
            onSend={onSend}
            replacing={replacing}
            version={version}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type Writing = "writing" | "failed" | "ready";

function RequestForm({
  version,
  live,
  replacing,
  caseId,
  onSend,
}: {
  version: number;
  live: number;
  replacing: number | null;
  caseId: CaseId;
  onSend: (request: { summary: string; note: string }) => Promise<boolean>;
}) {
  const [writing, setWriting] = React.useState<Writing>("writing");
  const [summary, setSummary] = React.useState("");
  const [note, setNote] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const attempts = React.useRef(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSummary(summaryFor(version, live));
      setWriting("ready");
    }, 700);
    return () => clearTimeout(timer);
  }, [live, version]);

  const errors = submitted
    ? {
        summary:
          writing !== "writing" && summary.trim() === ""
            ? "Write what callers will notice."
            : null,
        note: note.trim() === "" ? "Say why it’s needed." : null,
      }
    : { summary: null, note: null };

  async function send() {
    setSubmitted(true);
    if (writing === "writing" || !summary.trim() || !note.trim()) return;
    setSending(true);
    setFailed(false);
    attempts.current += 1;
    const ok =
      caseId === "send-fails" && attempts.current === 1
        ? await new Promise<boolean>((resolve) =>
            setTimeout(() => resolve(false), 900),
          )
        : await onSend({ summary: summary.trim(), note: note.trim() });
    setSending(false);
    if (!ok) setFailed(true);
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        {failed ? (
          <Alert className="bg-destructive-tint" variant="destructive">
            <AlertTitle>Couldn’t send the request</AlertTitle>
            <AlertDescription>
              Nothing was sent. Your summary and note are still here.
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
            hint={`What callers will notice, compared with v${String(live)}, which every scenario uses now. Approvers read this first, and can open the exact changes.`}
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
              placeholder="Callers hear IDs read in pairs instead of threes."
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
            placeholder="Callers kept mishearing national IDs read in threes."
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
  );
}
