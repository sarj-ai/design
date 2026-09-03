"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { RemoveCaseIcon } from "@/components/transfer-routing/icons"

/**
 * The cases that send a caller down this route.
 *
 * Free text, one chip each, because the agent interprets them live on the call
 * — there is no condition builder to fill in. Chips and the field they are
 * added from share one box: two nested boxes read as two controls, and this is
 * one. A chip goes amber when another route claims something that reads alike.
 */
export function CaseField({
  cases,
  overlapping,
  onAdd,
  onRemove,
}: {
  cases: string[]
  overlapping: Set<string>
  onAdd: (value: string) => void
  onRemove: (value: string) => void
}) {
  const [draft, setDraft] = React.useState("")

  function commit() {
    const value = draft.trim()
    if (!value || cases.includes(value)) return
    onAdd(value)
    setDraft("")
  }

  return (
    <InputGroup>
      {cases.length ? (
        <InputGroupAddon align="block-start" className="flex-wrap">
          {cases.map((value) => (
            <Button
              key={value}
              type="button"
              variant="secondary"
              size="xs"
              onClick={() => onRemove(value)}
              className={cn(
                overlapping.has(value) &&
                  "bg-warning/20 text-warning-foreground hover:bg-warning/30",
              )}
            >
              {value}
              <RemoveCaseIcon data-icon="inline-end" />
            </Button>
          ))}
        </InputGroupAddon>
      ) : null}

      <InputGroupInput
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return
          event.preventDefault()
          commit()
        }}
        onBlur={commit}
        placeholder="Add a reason and press Enter"
      />
    </InputGroup>
  )
}
