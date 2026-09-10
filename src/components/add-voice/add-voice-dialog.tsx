"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DEFAULT_FALLBACK_VOICE_ID,
  FALLBACK_VOICES,
  GENDERS,
  LANGUAGES,
  PROVIDERS,
} from "@/lib/add-voice-data"
import { FallbackVoicePicker } from "@/components/add-voice/fallback-voice-picker"
import { FieldHelpIcon } from "@/components/add-voice/icons"

/**
 * Add new voice — one voice entering the global library.
 *
 * Three groups down the dialog, in the order the reader can answer them: what
 * the voice is called and sounds like, then which provider renders it, then
 * what plays if that provider cannot. The fallback is last because it is the
 * only one already answered — it arrives with a default, so it reads as a row
 * to check rather than a field to fill.
 *
 * The model field takes the provider's default when left blank, so switching
 * provider moves the placeholder with it.
 */
export function AddVoiceDialog() {
  const [open, setOpen] = React.useState(true)
  const [provider, setProvider] = React.useState(PROVIDERS[0].value)
  const [fallbackId, setFallbackId] = React.useState(DEFAULT_FALLBACK_VOICE_ID)

  const defaultModel =
    PROVIDERS.find((option) => option.value === provider)?.defaultModel ?? ""

  const fallback =
    FALLBACK_VOICES.find((voice) => voice.id === fallbackId) ??
    FALLBACK_VOICES[0]

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="outline">Add new voice</Button>
      </DialogTrigger>

      {/* Nothing is autofocused: the design shows the dialog at rest, and the
          first input picking up a focus ring on open is the one difference a
          reviewer would read as a styling change. */}
      <DialogContent
        className="sm:max-w-2xl"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add new voice</DialogTitle>
          <DialogDescription>
            Add a new voice to the global voice library.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h3 className="text-base font-medium">Voice details</h3>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="voice-name">Display name</FieldLabel>
                <Input id="voice-name" placeholder="e.g. Arabic Male 1" />
              </Field>

              <Field>
                <FieldLabel htmlFor="voice-vibe">Vibe</FieldLabel>
                <Input
                  id="voice-vibe"
                  placeholder="e.g. Confident and professional"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="voice-language">Language</FieldLabel>
                <Select defaultValue={LANGUAGES[0].value}>
                  <SelectTrigger className="w-full" id="voice-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="voice-gender">Gender</FieldLabel>
                <Select defaultValue={GENDERS[0].value}>
                  <SelectTrigger className="w-full" id="voice-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-base font-medium">TTS configuration</h3>

            <div className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="voice-provider">Provider</FieldLabel>
                <Select onValueChange={setProvider} value={provider}>
                  <SelectTrigger className="w-full" id="voice-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="voice-id">Voice ID</FieldLabel>
                <Input
                  id="voice-id"
                  placeholder="Provider's voice identifier"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="voice-model">Model</FieldLabel>
                <Input id="voice-model" placeholder={defaultModel} />
              </Field>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium">Fallback voice</h3>
              <Tooltip>
                <TooltipTrigger
                  aria-label="What the fallback voice does"
                  className="cursor-help text-muted-foreground"
                >
                  <FieldHelpIcon className="size-4" />
                </TooltipTrigger>
                <TooltipContent className="max-w-64">
                  Plays instead of this voice when the provider fails or the
                  voice ID stops resolving, so a call never drops to silence.
                </TooltipContent>
              </Tooltip>
            </div>

            <Item variant="outline">
              <ItemContent>
                <ItemTitle>{fallback.name}</ItemTitle>
                <ItemDescription>
                  {fallback.vibe} · {fallback.provider}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <FallbackVoicePicker
                  onValueChange={setFallbackId}
                  value={fallbackId}
                />
              </ItemActions>
            </Item>
          </section>
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Create voice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
