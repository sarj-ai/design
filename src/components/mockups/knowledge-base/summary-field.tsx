"use client"

import * as React from "react"

import { Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  SUMMARY_SENTENCE_LIMIT,
  sentenceCount,
} from "@/lib/mockups/knowledge-base-data"
import { cn } from "@/lib/utils"
import { ReadyIcon } from "@/components/mockups/knowledge-base/icons"

type SaveState = "idle" | "unsaved" | "saving" | "saved"

export function SummaryField({ value }: { value: string }) {
  const [summary, setSummary] = React.useState(value)
  const [state, setState] = React.useState<SaveState>("idle")

  /* What is on the server; compared on blur so an unchanged blur claims no save. */
  const stored = React.useRef(value)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  function save() {
    if (summary === stored.current) return
    stored.current = summary
    setState("saving")
    timer.current = setTimeout(() => setState("saved"), 600)
  }

  const sentences = sentenceCount(summary)
  const over = sentences > SUMMARY_SENTENCE_LIMIT

  return (
    <Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FieldLabel htmlFor="kb-summary" className="w-auto">
          What this knowledge base covers
        </FieldLabel>
        <div className="flex items-center gap-3">
          <SaveStatus state={state} />
          <span
            className={cn(
              "text-sm tabular-nums",
              over ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {sentences}/{SUMMARY_SENTENCE_LIMIT} sentences
          </span>
        </div>
      </div>
      <Textarea
        id="kb-summary"
        rows={4}
        value={summary}
        onChange={(event) => {
          setSummary(event.target.value)
          setState(event.target.value === stored.current ? "idle" : "unsaved")
        }}
        onBlur={save}
        placeholder="Describe what an agent would find in here, and when it should look."
      />
    </Field>
  )
}

/** Icons sized explicitly: a plain span does not size a HugeIcon, which defaults to 24px. */
function SaveStatus({ state }: { state: SaveState }) {
  if (state === "idle") return null

  if (state === "unsaved") {
    return (
      <span className="text-sm text-muted-foreground">Unsaved changes</span>
    )
  }

  return (
    <span className="flex items-center gap-2 text-sm text-muted-foreground">
      {state === "saving" ? (
        <>
          <Spinner />
          Saving
        </>
      ) : (
        <>
          <ReadyIcon className="size-4 text-success" />
          Saved
        </>
      )}
    </span>
  )
}
