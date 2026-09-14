"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"

import { RemoveTriggerIcon } from "./icons"

/**
 * The generic filler words that already ship today.
 *
 * Same control as the trigger field, deliberately: both are a free list of
 * short phrases, and giving the existing half of this panel a different
 * affordance would suggest it behaves differently. It has no limit and no
 * conflict rules, so it stays the plain version.
 */
export function GenericFillerField({
  disabled,
  fillers,
  onAdd,
  onRemove,
}: {
  /** Persona scope only: the inherited global set, shown but not editable. */
  disabled: boolean
  fillers: string[]
  onAdd: (filler: string) => void
  onRemove: (filler: string) => void
}) {
  const [draft, setDraft] = React.useState("")

  function commit() {
    const value = draft.trim()
    if (!value || fillers.includes(value)) return
    onAdd(value)
    setDraft("")
  }

  return (
    <div className="flex flex-col gap-2">
      {fillers.length ? (
        <div className="flex flex-wrap gap-1.5">
          {fillers.map((filler) => (
            <Button
              dir="auto"
              disabled={disabled}
              key={filler}
              onClick={() => onRemove(filler)}
              size="xs"
              type="button"
              variant="secondary"
            >
              {filler}
              <RemoveTriggerIcon data-icon="inline-end" />
            </Button>
          ))}
        </div>
      ) : null}

      <ButtonGroup className="w-full">
        <Input
          dir="auto"
          disabled={disabled}
          onBlur={commit}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return
            event.preventDefault()
            commit()
          }}
          placeholder="Add a filler word, then press Enter"
          value={draft}
        />

        <Button
          disabled={disabled || !draft.trim()}
          onClick={commit}
          type="button"
          variant="outline"
        >
          Add
        </Button>
      </ButtonGroup>
    </div>
  )
}
