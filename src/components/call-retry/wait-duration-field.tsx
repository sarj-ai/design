"use client"

import * as React from "react"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { WAIT_DAYS_MAX, type WaitDuration } from "@/lib/call-retry-data"

/**
 * The wait between retries, in days and hours:minutes.
 *
 * A single minutes box is what the platform has today, and it is why a two-week
 * wait is typed as 20160. Days pulls the number a client actually says out of
 * the arithmetic they had to do to express it.
 *
 * The hours:minutes pair carries no visible unit on purpose. The same shape
 * appears three times on this card — the window's two ends and this — so the
 * screen teaches one clock idiom rather than two. The days box beside it, and
 * the label above, are what say this one is a span and not a time.
 */
export function WaitDurationField({
  description,
  disabled = false,
  error,
  id,
  label,
  onChange,
  value,
}: {
  description: string
  disabled?: boolean
  /** Null while the value is legal. */
  error: null | string
  /** Prefix for the three input ids. The label points at the days box. */
  id: string
  label: string
  onChange: (value: WaitDuration) => void
  value: WaitDuration
}) {
  /** See TimeOfDayField — same reason, same lifetime. */
  const [draft, setDraft] = React.useState<null | {
    days: string
    hours: string
    minutes: string
  }>(null)

  const text = draft ?? {
    days: value.days.toString(),
    hours: value.hours.toString().padStart(2, "0"),
    minutes: value.minutes.toString().padStart(2, "0"),
  }

  const CEILINGS = { days: WAIT_DAYS_MAX, hours: 23, minutes: 59 }

  function edit(part: "days" | "hours" | "minutes", raw: string) {
    setDraft({ ...text, [part]: raw })

    const parsed = Number(raw)
    if (raw === "" || Number.isNaN(parsed)) return

    onChange({
      ...value,
      [part]: Math.min(Math.max(parsed, 0), CEILINGS[part]),
    })
  }

  return (
    <Field
      data-disabled={disabled || undefined}
      data-invalid={error !== null || undefined}
    >
      <FieldLabel htmlFor={`${id}-days`}>{label}</FieldLabel>
      <FieldDescription>{description}</FieldDescription>

      <div className="flex items-center gap-2">
        <InputGroup className="max-w-32">
          <InputGroupInput
            aria-invalid={error !== null || undefined}
            disabled={disabled}
            id={`${id}-days`}
            max={WAIT_DAYS_MAX}
            min={0}
            onBlur={() => {
              setDraft(null)
            }}
            onChange={(event) => {
              edit("days", event.target.value)
            }}
            type="number"
            value={text.days}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>days</InputGroupText>
          </InputGroupAddon>
        </InputGroup>

        <div className="flex items-center gap-1">
          <InputGroup className="max-w-16">
            <InputGroupInput
              className="text-center"
              aria-invalid={error !== null || undefined}
              aria-label="Hours"
              disabled={disabled}
              max={23}
              min={0}
              onBlur={() => {
                setDraft(null)
              }}
              onChange={(event) => {
                edit("hours", event.target.value)
              }}
              type="number"
              value={text.hours}
            />
          </InputGroup>

          <span className="text-sm text-muted-foreground">:</span>

          <InputGroup className="max-w-16">
            <InputGroupInput
              className="text-center"
              aria-invalid={error !== null || undefined}
              aria-label="Minutes"
              disabled={disabled}
              max={59}
              min={0}
              onBlur={() => {
                setDraft(null)
              }}
              onChange={(event) => {
                edit("minutes", event.target.value)
              }}
              type="number"
              value={text.minutes}
            />
          </InputGroup>
        </div>
      </div>

      <FieldError>{error}</FieldError>
    </Field>
  )
}
