"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  ATTEMPTS_MAX,
  ATTEMPTS_MIN,
  hasRetryErrors,
  retryConfigErrors,
  TIMEZONES,
  type RetryConfig,
} from "@/lib/mockups/call-retry-data"
import { TimeOfDayInput } from "@/components/mockups/call-retry/time-of-day-field"
import { WaitDurationField } from "@/components/mockups/call-retry/wait-duration-field"

export function RetrySettingsCard({
  description,
  disabled = false,
  onChange,
  onSave,
  scope,
  value,
}: {
  description?: string
  disabled?: boolean
  onChange: (value: RetryConfig) => void
  onSave: () => void
  /** The inheritance control, rendered above the fields. */
  scope?: React.ReactNode
  value: RetryConfig
}) {
  const errors = retryConfigErrors(value)
  const fieldsDisabled = disabled || !value.enabled

  function update(patch: Partial<RetryConfig>) {
    onChange({ ...value, ...patch })
  }

  return (
    <Card>
      {/* The gate lives on the title row, not under it. As a row of its own it
          was a label reading "Retry calls" directly beneath a title reading
          "Call retry" — the same three words twice — and a whole line spent on
          one binary. On the title row the switch needs no label at all: the
          title is its label.

          It sits at the card's end edge, where a card-level control is looked
          for, and it is the only control in the header on either surface — the
          inheritance switch that used to share this row now leads the content
          instead. Two switches on one row put "Override scenario" between them,
          labelling neither.

          A bare switch is only unlabelled where the title says what it turns
          off. It does here. */}
      <CardHeader className="mb-2">
        <div className="flex w-full items-center justify-between gap-3">
          <CardTitle>Call retry</CardTitle>
          <Switch
            aria-label="Retry calls"
            checked={value.enabled}
            disabled={disabled}
            id="retry-enabled"
            onCheckedChange={(checked) => {
              update({ enabled: checked })
            }}
          />
        </div>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>

      {/* Retry off greys the fields rather than removing them, so the reader
          can still see what the policy was before it was switched off — and so
          the card does not change height under the hand that flipped it.

          Same read-only language as an inheriting source: every control stays,
          every control is dead. Two ways to say "you cannot edit this" would be
          two things to learn. `retryConfigErrors` already returns nothing while
          disabled, so no greyed field carries a red message and Save stays
          reachable — switching retry off is itself a change worth saving. */}
      <CardContent>
        {scope ? <div className="mb-6">{scope}</div> : null}

        {/* One rhythm, no headings. Banding the six fields 32px apart in pairs
            and 16px within a pair gave the column two spacings to read, and the
            pairs it drew — schedule, then limits — were not a difference any
            reader was asking about. One 24px step between every field, and the
            same step under the header, makes the card a single list. Six
            legends over six fields would be a heading each, which is the thing
            this repo deletes. */}
        <FieldGroup className="gap-6">
          <Field data-disabled={fieldsDisabled || undefined}>
            <FieldLabel htmlFor="retry-attempts">Retry attempts</FieldLabel>
            <Input
              className="max-w-32"
              disabled={fieldsDisabled}
              id="retry-attempts"
              max={ATTEMPTS_MAX}
              min={ATTEMPTS_MIN}
              onChange={(event) => {
                const next = Number(event.target.value)
                if (Number.isNaN(next)) return
                update({
                  attempts: Math.min(
                    Math.max(next, ATTEMPTS_MIN),
                    ATTEMPTS_MAX,
                  ),
                })
              }}
              type="number"
              value={value.attempts}
            />
          </Field>

          <WaitDurationField
            description="Measured from the end of the previous call."
            disabled={fieldsDisabled}
            error={errors.wait}
            id="retry-wait"
            label="Wait between retries"
            onChange={(wait) => {
              update({ wait })
            }}
            value={value.wait}
          />

          {/* The window is one value, so its two ends sit on one line with
                the word that joins them — "9:00 AM to 8:00 PM" — rather than
                as two separately-labelled fields the reader has to pair up.

                A FieldSet with a legend would have been the semantic wrapper
                for the window and its timezone, but `FieldLegend` carries no
                disabled hook, so on an inheriting source it stayed black
                while every other label greyed. One field per row, no
                exceptions — the timezone reads as the window's anyway, sitting
                directly under it. */}
          <Field
            data-disabled={fieldsDisabled || undefined}
            data-invalid={errors.window !== null || undefined}
          >
            <FieldLabel htmlFor="retry-window-start-hour">
              Retry window
            </FieldLabel>
            <div className="flex flex-wrap items-center gap-3">
              <TimeOfDayInput
                disabled={fieldsDisabled}
                id="retry-window-start"
                invalid={errors.window !== null}
                label="From"
                onChange={(windowStart) => {
                  update({ windowStart })
                }}
                value={value.windowStart}
              />

              <span className="text-sm text-muted-foreground">to</span>

              <TimeOfDayInput
                disabled={fieldsDisabled}
                id="retry-window-end"
                invalid={errors.window !== null}
                label="To"
                onChange={(windowEnd) => {
                  update({ windowEnd })
                }}
                value={value.windowEnd}
              />

              <span className="text-sm text-muted-foreground">in</span>

              <Select
                disabled={fieldsDisabled}
                onValueChange={(timezone) => {
                  update({ timezone })
                }}
                value={value.timezone}
              >
                <SelectTrigger
                  aria-label="Timezone"
                  className="max-w-48"
                  id="retry-timezone"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {TIMEZONES.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FieldError>{errors.window}</FieldError>
          </Field>
        </FieldGroup>
      </CardContent>

      <CardFooter className="justify-end border-t">
        <Button disabled={disabled || hasRetryErrors(errors)} onClick={onSave}>
          Save retry settings
        </Button>
      </CardFooter>
    </Card>
  )
}
