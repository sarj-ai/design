"use client"

import * as React from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  RESPONSE_MAX_CHARS,
  type PreviewVoice,
} from "@/lib/mockups/phrase-mappings-data"
import { cn } from "@/lib/utils"

import { PlayPreviewIcon, StopPreviewIcon } from "./icons"

const RENDER_MS = 700

const SPEECH_MS_PER_CHAR = 95
const MIN_SPEECH_MS = 1100

type Preview = "idle" | "rendering" | "playing"

export function ResponseField({
  disabled,
  fieldId,
  onChange,
  value,
  voice,
}: {
  disabled: boolean
  fieldId: string
  onChange: (response: string) => void
  value: string
  voice: PreviewVoice
}) {
  const [preview, setPreview] = React.useState<Preview>("idle")

  const overLimit = value.length > RESPONSE_MAX_CHARS
  const spoken = value.trim()

  React.useEffect(() => {
    if (preview === "idle") return

    const timer = window.setTimeout(
      () => setPreview(preview === "rendering" ? "playing" : "idle"),
      preview === "rendering"
        ? RENDER_MS
        : Math.max(MIN_SPEECH_MS, spoken.length * SPEECH_MS_PER_CHAR),
    )

    return () => window.clearTimeout(timer)
  }, [preview, spoken.length])

  const label =
    preview === "idle" ? `Play in ${voice.name}'s voice` : "Stop preview"

  const glyph =
    preview === "rendering" ? (
      <Spinner />
    ) : preview === "playing" ? (
      <StopPreviewIcon />
    ) : (
      <PlayPreviewIcon />
    )

  const toggle = () => setPreview(preview === "idle" ? "rendering" : "idle")

  return (
    <Field data-invalid={overLimit || undefined}>
      <FieldLabel htmlFor={`${fieldId}-response`}>Agent responds</FieldLabel>
      <FieldDescription>
        Saved exactly as typed, diacritics included.
      </FieldDescription>

      <InputGroup>
        <InputGroupInput
          aria-invalid={overLimit}
          dir="auto"
          disabled={disabled}
          id={`${fieldId}-response`}
          onChange={(event) => {
            setPreview("idle")
            onChange(event.target.value)
          }}
          placeholder="What the agent plays back"
          value={value}
        />

        {/* Over the character limit is still worth hearing: the response has
            to be cut down to something, and the reader is choosing which
            words to lose. Only an empty response has nothing to play. */}
        <InputGroupAddon align="inline-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                aria-label={label}
                disabled={!spoken}
                onClick={toggle}
                size="icon-xs"
              >
                {glyph}
              </InputGroupButton>
            </TooltipTrigger>
            {/* The voice is what the preview proves, and it is the one thing
                a triangle cannot say. Parked on the button that plays it
                rather than printed under the field.

                Live even while the field is disabled: hearing the inherited
                acknowledgment is the reason a reader opens the row, and
                playing it changes nothing. */}
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      </InputGroup>

      <div className="flex items-baseline justify-end gap-4">
        <span
          className={cn(
            "shrink-0 text-sm tabular-nums",
            overLimit ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {value.length}/{RESPONSE_MAX_CHARS} characters
        </span>
      </div>
    </Field>
  )
}
