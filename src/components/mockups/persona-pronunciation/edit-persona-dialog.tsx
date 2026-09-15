"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
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
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  GENDERS,
  LANGUAGES,
  PERSONA,
  VOICES,
  type PersonaGender,
  type PersonaLanguage,
} from "@/lib/mockups/persona-pronunciation-data"
import { PronunciationTerms } from "@/components/mockups/persona-pronunciation/pronunciation-terms"
import {
  BehaviorSettingsIcon,
  CloseIcon,
  RenameIcon,
} from "@/components/mockups/persona-pronunciation/icons"

/**
 * Edit persona, rebuilt wide so pronunciation terms get a table instead of a
 * strip at the bottom of a narrow scroll.
 *
 * One column, five sections in the order an operator reads them: who the
 * persona is, which voice says it, how it behaves in a call, when it hangs
 * up, and finally the terms that voice has to say correctly. The footer stays
 * pinned so Save is never below the table.
 */
export function EditPersonaDialog() {
  const [open, setOpen] = React.useState(true)

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit persona</Button>
      </DialogTrigger>

      {/* The dialog's own close sits in the header row, next to the title,
          so the primitive's corner button is switched off. Nothing is
          autofocused: the design shows the dialog at rest. */}
      <DialogContent
        className="sm:max-w-200"
        onOpenAutoFocus={(event) => event.preventDefault()}
        showCloseButton={false}
      >
        <PersonaForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function PersonaForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = React.useState(PERSONA.name)
  const [renaming, setRenaming] = React.useState(false)
  const [language, setLanguage] = React.useState<PersonaLanguage>(
    PERSONA.language,
  )
  const [gender, setGender] = React.useState<PersonaGender>(PERSONA.gender)
  const [prompt, setPrompt] = React.useState(PERSONA.prompt)
  const [voiceId, setVoiceId] = React.useState(PERSONA.voiceId)
  const [fillerWords, setFillerWords] = React.useState(PERSONA.fillerWords)
  const [backgroundNoise, setBackgroundNoise] = React.useState(
    PERSONA.backgroundNoise,
  )
  const [endCallOnSilence, setEndCallOnSilence] = React.useState(
    PERSONA.endCallOnSilence,
  )
  const [silenceSeconds, setSilenceSeconds] = React.useState(
    PERSONA.silenceSeconds,
  )
  const [maxRetries, setMaxRetries] = React.useState(PERSONA.maxRetries)

  function commitName(value: string) {
    const next = value.trim()
    if (next) setName(next)
    setRenaming(false)
  }

  return (
    <>
      <DialogHeader className="-mx-4 -mt-4 flex-row items-center justify-between gap-4 border-b px-6 py-5">
        <div className="flex items-center gap-4">
          {/* Not <Avatar>: the primitive draws a border ring and the design
              has a plain muted circle. No edge, no padding, so it stays a
              bare element rather than a rebuilt primitive. */}
          <span
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-lg"
          >
            {PERSONA.initial}
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              {renaming ? (
                <Input
                  autoFocus
                  aria-label="Persona name"
                  defaultValue={name}
                  dir="auto"
                  onBlur={(event) => commitName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur()
                    if (event.key === "Escape") setRenaming(false)
                  }}
                />
              ) : (
                <>
                  <DialogTitle dir="auto">{name}</DialogTitle>
                  {/* Negative vertical margins keep the 28px hit area from
                      making the title row taller than the title, so the
                      subtitle sits 4px under the text as in the design. */}
                  <Button
                    aria-label="Rename persona"
                    className="-my-1.5 text-muted-foreground"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setRenaming(true)}
                  >
                    <RenameIcon />
                  </Button>
                </>
              )}
            </div>
            <DialogDescription>
              {language}
              {PERSONA.isDefault ? " · Default" : null}
            </DialogDescription>
          </div>
        </div>
        <DialogClose asChild>
          <Button aria-label="Close" size="icon-sm" variant="ghost">
            <CloseIcon />
          </Button>
        </DialogClose>
      </DialogHeader>

      {/* ScrollArea instead of overflow-y-auto: the bar is an overlay that only
          shows while scrolling, so no permanent gutter beside the fields. The
          negative vertical margins eat the dialog's own gap so content clips
          exactly at the header and footer borders, not 16px short of them. */}
      <ScrollArea className="-mx-4 -my-4 [&>[data-slot=scroll-area-viewport]]:max-h-150">
        <div className="flex flex-col gap-8 px-6 py-6">
          <section className="flex flex-col gap-4">
            <h3 className="text-base font-semibold">Identity</h3>
            <div className="grid grid-cols-2 gap-6">
              <Field>
                <FieldLabel htmlFor="persona-language">Language</FieldLabel>
                <Select
                  value={language}
                  onValueChange={(value) =>
                    setLanguage(value as PersonaLanguage)
                  }
                >
                  <SelectTrigger className="w-full" id="persona-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="persona-gender">Gender</FieldLabel>
                <Select
                  value={gender}
                  onValueChange={(value) => setGender(value as PersonaGender)}
                >
                  <SelectTrigger className="w-full" id="persona-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="persona-prompt">Persona prompt</FieldLabel>
              <Textarea
                className="min-h-32"
                dir="auto"
                id="persona-prompt"
                rows={4}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
            </Field>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-base font-semibold">Voice</h3>
            <RadioGroup
              className="grid-cols-3 gap-4"
              value={voiceId}
              onValueChange={(value) => setVoiceId(value as string)}
            >
              {VOICES.map((voice) => {
                const selected = voice.id === voiceId
                return (
                  <Item
                    asChild
                    key={voice.id}
                    variant="outline"
                    className={cn(
                      "cursor-pointer hover:bg-muted/50",
                      selected && "border-primary ring-1 ring-primary",
                    )}
                  >
                    <label htmlFor={`voice-${voice.id}`}>
                      <ItemMedia>
                        <RadioGroupItem
                          id={`voice-${voice.id}`}
                          value={voice.id}
                        />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle dir="auto">{voice.name}</ItemTitle>
                        <ItemDescription>{voice.vibe}</ItemDescription>
                      </ItemContent>
                    </label>
                  </Item>
                )
              })}
            </RadioGroup>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-base font-semibold">Behavior</h3>
            <div className="grid grid-cols-2 gap-6">
              <Item variant="outline">
                <ItemContent>
                  <ItemTitle>
                    Filler words
                    <BehaviorSettingsIcon aria-hidden className="size-5" />
                  </ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Switch
                    aria-label="Filler words"
                    checked={fillerWords}
                    onCheckedChange={setFillerWords}
                  />
                </ItemActions>
              </Item>

              <Item variant="outline">
                <ItemContent>
                  <ItemTitle>
                    Background noise
                    <BehaviorSettingsIcon aria-hidden className="size-5" />
                  </ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Switch
                    aria-label="Background noise"
                    checked={backgroundNoise}
                    onCheckedChange={setBackgroundNoise}
                  />
                </ItemActions>
              </Item>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold">End call on silence</h3>
              <Switch
                aria-label="End call on silence"
                checked={endCallOnSilence}
                onCheckedChange={setEndCallOnSilence}
              />
            </div>
            {/* Off is greyed, not removed — the reader still sees what the
                timeout was set to. */}
            <div className="grid grid-cols-2 gap-6">
              <Field>
                <FieldLabel htmlFor="silence-seconds">
                  Duration (seconds)
                </FieldLabel>
                <Input
                  disabled={!endCallOnSilence}
                  id="silence-seconds"
                  inputMode="numeric"
                  value={silenceSeconds}
                  onChange={(event) => setSilenceSeconds(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="silence-retries">Max retries</FieldLabel>
                <Input
                  disabled={!endCallOnSilence}
                  id="silence-retries"
                  inputMode="numeric"
                  placeholder="2"
                  value={maxRetries}
                  onChange={(event) => setMaxRetries(event.target.value)}
                />
              </Field>
            </div>
          </section>

          <PronunciationTerms />
        </div>
      </ScrollArea>

      <DialogFooter className="px-6">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={onClose}>Save changes</Button>
      </DialogFooter>
    </>
  )
}
