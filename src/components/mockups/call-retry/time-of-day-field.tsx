"use client"

import * as React from "react"

import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { TimeOfDay } from "@/lib/mockups/call-retry-data"

/** Not `<input type="time">`: it only shows AM/PM under an en-US locale. */
export function TimeOfDayInput({
  disabled = false,
  id,
  invalid = false,
  label,
  onChange,
  value,
}: {
  disabled?: boolean
  /** Prefix for the two input ids. */
  id: string
  invalid?: boolean
  /** Accessible name for this end of the window; not rendered. */
  label: string
  onChange: (value: TimeOfDay) => void
  value: TimeOfDay
}) {
  /** Raw text while typing, so `2` is not re-padded to `02` under the caret. Cleared on blur. */
  const [draft, setDraft] = React.useState<null | {
    hour: string
    minute: string
  }>(null)

  const text = draft ?? {
    hour: value.hour.toString().padStart(2, "0"),
    minute: value.minute.toString().padStart(2, "0"),
  }

  function edit(part: "hour" | "minute", raw: string) {
    setDraft({ ...text, [part]: raw })

    const parsed = Number(raw)
    if (raw === "" || Number.isNaN(parsed)) return

    onChange({
      ...value,
      [part]:
        part === "hour"
          ? Math.min(Math.max(parsed, 1), 12)
          : Math.min(Math.max(parsed, 0), 59),
    })
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <InputGroup className="max-w-16">
          <InputGroupInput
            className="text-center"
            aria-invalid={invalid || undefined}
            aria-label={`${label} hour`}
            disabled={disabled}
            id={`${id}-hour`}
            max={12}
            min={1}
            onBlur={() => {
              setDraft(null)
            }}
            onChange={(event) => {
              edit("hour", event.target.value)
            }}
            type="number"
            value={text.hour}
          />
        </InputGroup>

        <span className="text-sm text-muted-foreground">:</span>

        <InputGroup className="max-w-16">
          <InputGroupInput
            className="text-center"
            aria-invalid={invalid || undefined}
            aria-label={`${label} minute`}
            disabled={disabled}
            max={59}
            min={0}
            onBlur={() => {
              setDraft(null)
            }}
            onChange={(event) => {
              edit("minute", event.target.value)
            }}
            type="number"
            value={text.minute}
          />
        </InputGroup>
      </div>

      <ToggleGroup
        disabled={disabled}
        onValueChange={(next) => {
          if (!next) return
          onChange({ ...value, meridiem: next as TimeOfDay["meridiem"] })
        }}
        type="single"
        value={value.meridiem}
        variant="outline"
      >
        <ToggleGroupItem aria-label={`${label} AM`} value="am">
          AM
        </ToggleGroupItem>
        <ToggleGroupItem aria-label={`${label} PM`} value="pm">
          PM
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
