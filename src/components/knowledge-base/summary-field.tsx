"use client"

import * as React from "react"

import { Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  SUMMARY_SENTENCE_LIMIT,
  sentenceCount,
} from "@/lib/knowledge-base-data"
import { cn } from "@/lib/utils"
import { ReadyIcon } from "@/components/knowledge-base/icons"

/** Where an edit has got to. Nothing showing means nothing has been touched. */
type SaveState = "idle" | "unsaved" | "saving" | "saved"

/**
 * The only part of a knowledge base that still reaches the agent's prompt.
 *
 * With the content itself moved out and fetched on demand, this description is
 * what tells the agent the tool exists and when it might apply — there is no
 * separate trigger list to configure. Write it badly and the agent never calls
 * the tool, so it is a field a client fills in, not a detail under the hood.
 *
 * It saves itself when it loses focus rather than behind a Save button, and
 * says so — the field is the whole form, so a button would guard one control
 * and someone who clicked away would have no way to tell whether their words
 * survived.
 */
export function SummaryField({ value }: { value: string }) {
  const [summary, setSummary] = React.useState(value)
  const [state, setState] = React.useState<SaveState>("idle")

  /* What is on the server. Compared against on blur, so clicking away without
     changing anything does not claim a save that never happened. */
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
      {/* The label and the field's state share the top line, so the card ends
          at the textarea instead of trailing a row underneath it. */}
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

/**
 * Whether what is on screen is what is stored.
 *
 * Both icons are set to size-4 explicitly. Nothing sizes an icon in a plain
 * span — the primitives do it through their own `[&_svg]:size-4` rules — so an
 * unsized HugeIcon lands at its 24px default and towers over the 14px text
 * beside it.
 */
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
