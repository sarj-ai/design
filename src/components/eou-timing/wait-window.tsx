"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  MAX_WAIT_CEILING_SECONDS,
  RECOMMENDED_MAX_WAIT_CEILING_SECONDS,
  RECOMMENDED_MAX_WAIT_FLOOR_SECONDS,
  formatSeconds,
} from "@/lib/eou-timing-data"

import { FieldHelpIcon, OutOfBandIcon } from "./icons"

export type WaitWindowValue = {
  maxWaitSeconds: number
  minWaitSeconds: number
}

/**
 * Minimum and maximum wait — PRD requirements 4, 5 and 6.
 *
 * Each control says in plain language what it does and what raising or lowering
 * it means for the caller. Both are bounded, and a maximum outside the
 * recommended band warns.
 */
export function WaitWindow({
  disabled = false,
  idPrefix,
  onChange,
  value,
}: {
  disabled?: boolean
  idPrefix: string
  onChange: (value: WaitWindowValue) => void
  value: WaitWindowValue
}) {
  const { maxWaitSeconds, minWaitSeconds } = value
  const belowFloor = maxWaitSeconds < RECOMMENDED_MAX_WAIT_FLOOR_SECONDS
  const aboveCeiling = maxWaitSeconds > RECOMMENDED_MAX_WAIT_CEILING_SECONDS

  const handleNumber =
    (field: keyof WaitWindowValue) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(event.target.value)
      if (Number.isNaN(next)) return
      onChange({
        ...value,
        [field]: Math.min(Math.max(next, 0), MAX_WAIT_CEILING_SECONDS),
      })
    }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <WaitField
          disabled={disabled}
          help="How long the agent waits after the caller seems finished. Lower feels snappier."
          id={`${idPrefix}-min-wait`}
          label="Minimum wait (seconds)"
          name="minimum wait"
          onChange={handleNumber("minWaitSeconds")}
          value={minWaitSeconds}
        />

        <WaitField
          disabled={disabled}
          help="The longest the agent waits when it isn't sure. Lower risks interrupting mid-sentence."
          id={`${idPrefix}-max-wait`}
          label="Maximum wait (seconds)"
          name="maximum wait"
          onChange={handleNumber("maxWaitSeconds")}
          value={maxWaitSeconds}
        />
      </div>

      <BandWarning
        aboveCeiling={aboveCeiling && !disabled}
        belowFloor={belowFloor && !disabled}
      />
    </div>
  )
}

/**
 * One wait field: the number, with its explanation parked on a hover target
 * inside the input rather than printed under it.
 *
 * The copy is the same either way — PRD requirement 4 asks each control to say
 * what it does — but a tooltip only says it to someone who goes looking. Worth
 * knowing that this trades always-visible guidance for a tighter form.
 */
function WaitField({
  disabled,
  help,
  id,
  label,
  name,
  onChange,
  value,
}: {
  disabled: boolean
  help: string
  id: string
  label: string
  /** The field said as prose, for the help button's screen-reader name — the
   * visible label carries "(seconds)", which reads as noise when spoken. */
  name: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  value: number
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          disabled={disabled}
          id={id}
          max={MAX_WAIT_CEILING_SECONDS}
          min={0}
          onChange={onChange}
          step={0.1}
          type="number"
          value={value}
        />
        <InputGroupAddon align="inline-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                aria-label={`What ${name} does`}
                size="icon-xs"
                type="button"
              >
                <FieldHelpIcon />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent className="max-w-64">{help}</TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}

/** Shipped copy, kept word for word so the mockup does not fork the warning. */
function BandWarning({
  aboveCeiling,
  belowFloor,
}: {
  aboveCeiling: boolean
  belowFloor: boolean
}) {
  const reduce = useReducedMotion()
  const message = belowFloor
    ? `A maximum wait below ${formatSeconds(RECOMMENDED_MAX_WAIT_FLOOR_SECONDS)} increases the chance of interrupting callers mid-sentence.`
    : aboveCeiling
      ? `A maximum wait above ${formatSeconds(RECOMMENDED_MAX_WAIT_CEILING_SECONDS)} leaves callers waiting whenever the model is unsure, which is the delay this setting exists to reduce.`
      : null

  return (
    <AnimatePresence initial={false} mode="wait">
      {message ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          initial={{ opacity: 0, y: -4 }}
          key={belowFloor ? "below" : "above"}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }
          }
        >
          <Alert>
            <OutOfBandIcon className="text-warning" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
