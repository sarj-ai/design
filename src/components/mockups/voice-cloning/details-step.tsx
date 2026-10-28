"use client"

import * as React from "react"

import { errorId, FieldHeader } from "@/components/design-system/field-header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
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
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { usePlayback } from "@/components/mockups/voice-cloning/audio"
import {
  PauseVoiceIcon,
  PlayVoiceIcon,
} from "@/components/mockups/voice-cloning/icons"
import {
  DIALECTS,
  GENDER_OPTIONS,
  type Gender,
  LANGUAGE_OPTIONS,
  type LanguageCode,
  PREVIEW_LINE,
} from "@/lib/mockups/voice-cloning-data"

export type Details = {
  name: string
  vibe: string
  language: LanguageCode
  dialect: string
  gender: Gender
  publish: boolean
  consent: boolean
}

export function detailsErrors(details: Details) {
  return {
    name: details.name.trim() === "" ? "Name the voice." : null,
    consent: details.consent
      ? null
      : "Confirm you have the right to use this voice.",
  }
}

export function DetailsStep({
  details,
  setDetails,
  canPublish,
  showErrors,
}: {
  details: Details
  setDetails: React.Dispatch<React.SetStateAction<Details>>
  canPublish: boolean
  showErrors: boolean
}) {
  const playback = usePlayback(4)
  const { play } = playback
  const errors = showErrors ? detailsErrors(details) : null

  React.useEffect(() => {
    play()
  }, [play])

  const set = <Key extends keyof Details>(key: Key, value: Details[Key]) =>
    setDetails((current) => ({ ...current, [key]: value }))

  return (
    <div className="flex flex-col gap-6">
      {/* The same shape as Script on step 1 — a label, then the words in a
          muted panel — so the reader sees the line they read become the
          line the clone says. One line of text beside the button, so they
          centre on each other. */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Preview</span>
        <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
          <Button
            aria-label={playback.playing ? "Pause preview" : "Play preview"}
            onClick={playback.toggle}
            size="icon"
          >
            {playback.playing ? <PauseVoiceIcon /> : <PlayVoiceIcon />}
          </Button>
          <p className="flex-1 text-base leading-relaxed" dir="rtl">
            {PREVIEW_LINE}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldHeader error={errors?.name} htmlFor="clone-name">
            Name
          </FieldHeader>
          <Input
            aria-describedby={errors?.name ? errorId("clone-name") : undefined}
            aria-invalid={errors?.name ? true : undefined}
            dir="auto"
            id="clone-name"
            onChange={(event) => set("name", event.target.value)}
            placeholder="Khalid"
            value={details.name}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="clone-vibe">
            Vibe <span className="text-muted-foreground">(optional)</span>
          </FieldLabel>
          <Input
            dir="auto"
            id="clone-vibe"
            onChange={(event) => set("vibe", event.target.value)}
            placeholder="Calm, reassuring"
            value={details.vibe}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="clone-language">Language</FieldLabel>
          <Select
            onValueChange={(value) => {
              const language = value as LanguageCode
              setDetails((current) => ({
                ...current,
                language,
                dialect: DIALECTS[language][0],
              }))
            }}
            value={details.language}
          >
            <SelectTrigger className="w-full" id="clone-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {LANGUAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="clone-dialect">Dialect</FieldLabel>
          <Select
            onValueChange={(value) => set("dialect", value)}
            value={details.dialect}
          >
            <SelectTrigger className="w-full" id="clone-dialect">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {DIALECTS[details.language].map((dialect) => (
                <SelectItem key={dialect} value={dialect}>
                  {dialect}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="clone-gender">Gender</FieldLabel>
          <Select
            onValueChange={(value) => set("gender", value as Gender)}
            value={details.gender}
          >
            <SelectTrigger className="w-full" id="clone-gender">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Separator />

      {canPublish ? (
        <Field orientation="horizontal">
          <Switch
            checked={details.publish}
            id="clone-publish"
            onCheckedChange={(checked) => set("publish", checked)}
          />
          <FieldContent>
            <FieldLabel htmlFor="clone-publish">
              Request for all organizations
            </FieldLabel>
            <FieldDescription>
              Sends a request. The voice stays in Sarj, usable, until someone
              with publish access approves it.
            </FieldDescription>
          </FieldContent>
        </Field>
      ) : null}

      {/* The error sits above the row, like every other field here; the
          label stays its own colour — it is not the thing that is wrong. */}
      <Field>
        {errors?.consent ? <FieldError>{errors.consent}</FieldError> : null}
        <div className="flex items-start gap-3">
          <Checkbox
            aria-invalid={errors?.consent ? true : undefined}
            checked={details.consent}
            id="clone-consent"
            onCheckedChange={(checked) => set("consent", checked === true)}
          />
          <FieldLabel className="font-normal" htmlFor="clone-consent">
            I have the right to use this voice, and won’t use it for unlawful,
            fraudulent or misleading purposes.
          </FieldLabel>
        </div>
      </Field>
    </div>
  )
}
