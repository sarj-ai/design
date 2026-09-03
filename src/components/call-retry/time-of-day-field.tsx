"use client"

import * as React from "react"

import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { TimeOfDay } from "@/lib/call-retry-data"

/**
 * A time of day, written the way the PRD asks for it: hours, minutes, AM/PM.
 *
 * There is no time picker in this repo and `<input type="time">` is not one
 * either — it renders AM/PM only under an en-US browser locale and falls back
 * to a 24-hour field everywhere else. `npm run shots` runs a clean profile, so
 * the one thing the PRD names explicitly is the thing most likely to be missing
 * from the screenshot. Three controls render the same everywhere.
 *
 * The control carries no visible label of its own. Both ends of the window sit
 * on one row under one label — "Calling window: 9:00 AM to 8:00 PM" — so `label`
 * is what names each end to a screen reader, not what is printed beside it.
 *
 * AM and PM stay capitalised. They are acronyms — ante and post meridiem — not
 * a label shouting at the reader, and they are the PRD's own spelling.
 */
export function TimeOfDayInput({
  disabled = false,
  id,
  invalid = false,
  label,
  onChange,
  value,
}: {
  disabled?: boolean
  /** Prefix for the two input ids, so the row's label can point at the hour. */
  id: string
  /** The window rule failed. The message itself lives once, under the row. */
  invalid?: boolean
  /** The accessible name for this end of the window: "From" or "To". */
  label: string
  onChange: (value: TimeOfDay) => void
  value: TimeOfDay
}) {
  /**
   * What is on screen while a box is being typed into, which is not always what
   * the value is: `2` has to be allowed to sit there without being re-padded to
   * `02` under the caret. Cleared on blur, which is what re-pads it.
   */
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
