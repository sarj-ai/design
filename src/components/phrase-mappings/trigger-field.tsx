"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  MAX_TRIGGERS,
  TRIGGER_MAX_CHARS,
  isContested,
  normalize,
  type Conflict,
} from "@/lib/phrase-mappings-data"
import { cn } from "@/lib/utils"

import { RemoveTriggerIcon } from "./icons"

/**
 * The caller phrases that select one mapping.
 *
 * The chips sit above the field, and the field carries Add on a shared edge,
 * so the row reads as one control rather than a button dropped in it. A phrase
 * claimed by another active rule turns destructive here as well as in the
 * alert below the list — the alert says which rules clash, the chip says which
 * word did it.
 *
 * An inherited set keeps every control and disables it, rather than dropping
 * the input and the ×. One dead control reads as "not yours to edit"; a control
 * that is simply absent reads as a screen that failed to render.
 */
export function TriggerField({
  conflicts,
  disabled,
  onAdd,
  onRemove,
  triggers,
}: {
  conflicts: Conflict[]
  /** Persona scope only: the inherited global set, shown but not editable. */
  disabled: boolean
  onAdd: (trigger: string) => void
  onRemove: (trigger: string) => void
  triggers: string[]
}) {
  const [draft, setDraft] = React.useState("")

  const full = triggers.length >= MAX_TRIGGERS
  const tooLong = draft.length > TRIGGER_MAX_CHARS
  /* Compared normalised, so "سلام" is not added twice as "سلامٌ". */
  const duplicate = triggers.some(
    (trigger) => normalize(trigger) === normalize(draft) && draft.trim() !== "",
  )

  function commit() {
    const value = draft.trim()
    if (!value || full || tooLong || duplicate) return
    onAdd(value)
    setDraft("")
  }

  return (
    <div className="flex flex-col gap-2">
      {/* The chips sit above the field rather than inside it: a phrase here
          can run to a full sentence, which wraps better with the row to
          itself. */}
      {triggers.length ? (
        <div className="flex flex-wrap gap-1.5">
          {triggers.map((trigger) => (
            <Button
              className={cn(
                isContested(trigger, conflicts) &&
                  "bg-destructive/15 text-destructive hover:bg-destructive/25",
              )}
              dir="auto"
              disabled={disabled}
              key={trigger}
              onClick={() => onRemove(trigger)}
              size="xs"
              type="button"
              variant="secondary"
            >
              {trigger}
              <RemoveTriggerIcon data-icon="inline-end" />
            </Button>
          ))}
        </div>
      ) : null}

      {/* Input and Add share an edge instead of the button sitting inside the
          field. Inside, it reads as an ornament on the input; joined, the two
          read as the one control they are — type here, press that. */}
      <ButtonGroup className="w-full">
        <Input
          aria-invalid={tooLong || duplicate}
          dir="auto"
          disabled={disabled || full}
          onBlur={commit}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return
            event.preventDefault()
            commit()
          }}
          placeholder={
            full
              ? `All ${MAX_TRIGGERS} phrases used`
              : "Add a caller phrase, then press Enter"
          }
          value={draft}
        />

        {/* An explicit Add as well as Enter. Enter alone is invisible, and this
            field is the one place a reader is typing a language the rest of
            the panel is not written in. */}
        <Button
          disabled={disabled || full || !draft.trim() || tooLong || duplicate}
          onClick={commit}
          type="button"
          variant="outline"
        >
          Add
        </Button>
      </ButtonGroup>

      <FieldError>
        {tooLong
          ? `A phrase can be at most ${TRIGGER_MAX_CHARS} characters. This one is ${draft.length}.`
          : duplicate
            ? "This mapping already has that phrase."
            : null}
      </FieldError>
    </div>
  )
}
