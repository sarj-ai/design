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
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  GENDERS,
  LANGUAGES,
  type Persona,
  type PersonaGender,
  type PersonaLanguage,
} from "@/lib/personas-depth-data"
import { VoicePicker } from "@/components/personas-depth/voice-picker"

export type PersonaDraft = {
  name: string
  language: PersonaLanguage
  gender: PersonaGender
  voiceId: string
  prompt: string
}

/* The product's actual Arabic defaults — see bulbul's backchannel-settings. */
const DEFAULT_FILLER_WORDS = ["تمام", "حاضر", "ممتاز", "زين", "نعم"]

/* The product's four ambience options, "Office" first as its default. */
const NOISE_TYPES = ["Office", "City Street", "Crowded Room", "Forest"]

/**
 * Create and edit share one dialog. The current product stacks ten sections
 * into a single narrow scroll (the DIS-17 complaint); here the form is split
 * into three tabs — identity, voice, conversation behavior — with the footer
 * always in reach.
 *
 * The form lives in a child mounted with the dialog content, so every open
 * starts from the persona being edited (or a blank slate) without effects.
 */
export function PersonaDialog({
  open,
  onOpenChange,
  persona,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing; absent when creating. */
  persona: Persona | null
  onSubmit: (draft: PersonaDraft) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <PersonaForm
          key={persona?.id ?? "new"}
          persona={persona}
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function PersonaForm({
  persona,
  onSubmit,
  onClose,
}: {
  persona: Persona | null
  onSubmit: (draft: PersonaDraft) => void
  onClose: () => void
}) {
  const editing = persona !== null

  const [tab, setTab] = React.useState("profile")
  const [name, setName] = React.useState(persona?.name ?? "")
  const [language, setLanguage] = React.useState<PersonaLanguage>(
    persona?.language ?? "Arabic",
  )
  const [gender, setGender] = React.useState<PersonaGender>(
    persona?.gender ?? "Female",
  )
  const [voiceId, setVoiceId] = React.useState(persona?.voiceId ?? "")
  const [prompt, setPrompt] = React.useState(persona?.prompt ?? "")
  const [speed, setSpeed] = React.useState(1)

  /* Conversation behavior — mock-local, not part of the submitted draft. */
  const [backchannel, setBackchannel] = React.useState(true)
  const [fillerWords, setFillerWords] = React.useState(DEFAULT_FILLER_WORDS)
  const [fillerDraft, setFillerDraft] = React.useState("")
  const [fillerFrequency, setFillerFrequency] = React.useState(0.6)
  const [backgroundNoise, setBackgroundNoise] = React.useState(false)
  const [noiseType, setNoiseType] = React.useState("Office")
  const [noiseVolume, setNoiseVolume] = React.useState(0.05)
  const [turnOverride, setTurnOverride] = React.useState(false)
  const [minWait, setMinWait] = React.useState("0.4")
  const [maxWait, setMaxWait] = React.useState("1.2")
  const [timeoutOn, setTimeoutOn] = React.useState(true)
  const [timeoutSeconds, setTimeoutSeconds] = React.useState("8")
  const [timeoutRetries, setTimeoutRetries] = React.useState("2")

  function changeLanguage(next: PersonaLanguage) {
    setLanguage(next)
    setVoiceId("")
  }

  function changeGender(next: PersonaGender) {
    setGender(next)
    setVoiceId("")
  }

  function addFillerWord() {
    const word = fillerDraft.trim()
    if (!word || fillerWords.includes(word)) return
    setFillerWords([...fillerWords, word])
    setFillerDraft("")
  }

  const canSave = name.trim().length > 0 && voiceId !== ""

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? "Edit persona" : "New persona"}</DialogTitle>
        <DialogDescription>
          A persona bundles a voice, a prompt, and conversation behavior for one
          language.
        </DialogDescription>
      </DialogHeader>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
        </TabsList>

        {/* ScrollArea instead of overflow-y-auto: the bar is an overlay that
            only shows while scrolling, so no permanent gutter on the right. */}
        <TabsContent value="profile" className="pt-2">
          <ScrollArea className="[&>[data-slot=scroll-area-viewport]]:max-h-140">
            <div className="flex flex-col gap-4 pe-3">
              <Field>
                <FieldLabel htmlFor="persona-name">Name *</FieldLabel>
                <Input
                  id="persona-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Aisha — Yelo Support"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Language *</FieldLabel>
                  <Select
                    value={language}
                    onValueChange={(value) =>
                      changeLanguage(value as PersonaLanguage)
                    }
                  >
                    <SelectTrigger>
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
                  <FieldLabel>Gender *</FieldLabel>
                  <Select
                    value={gender}
                    onValueChange={(value) =>
                      changeGender(value as PersonaGender)
                    }
                  >
                    <SelectTrigger>
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
                  id="persona-prompt"
                  rows={5}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Define the agent's identity, personality, and tone."
                />
              </Field>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="voice" className="pt-2">
          <ScrollArea className="[&>[data-slot=scroll-area-viewport]]:max-h-140">
            <div className="flex flex-col gap-4 pe-3">
              <VoicePicker
                language={language}
                gender={gender}
                selectedId={voiceId}
                onSelect={setVoiceId}
              />

              {voiceId ? (
                <Field>
                  <div className="flex items-center justify-between gap-4">
                    <FieldLabel>Voice speed</FieldLabel>
                    <span className="font-mono text-sm text-muted-foreground">
                      {speed.toFixed(2)}×
                    </span>
                  </div>
                  <Slider
                    value={[speed]}
                    onValueChange={([value]) => setSpeed(value)}
                    min={0.8}
                    max={1.2}
                    step={0.05}
                  />
                  <FieldDescription>
                    Follows the voice&apos;s own default until you move it.
                  </FieldDescription>
                </Field>
              ) : null}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="conversation" className="pt-2">
          <ScrollArea className="[&>[data-slot=scroll-area-viewport]]:max-h-140">
            <div className="flex flex-col gap-4 pe-3">
              <GroupPanel label="Sound">
                <SettingRow
                  title="Backchannel"
                  description={
                    backchannel
                      ? "Short acknowledgements while the caller speaks."
                      : "The agent stays silent while the caller speaks."
                  }
                  control={
                    <Switch
                      checked={backchannel}
                      onCheckedChange={setBackchannel}
                      aria-label="Toggle backchannel"
                    />
                  }
                >
                  {backchannel ? (
                    <>
                      {/* Outline chips, not secondary — secondary is the same
                        grey as the panel, so the chips disappeared. */}
                      <div className="flex flex-wrap gap-2">
                        {fillerWords.map((word) => (
                          <Button
                            key={word}
                            variant="outline"
                            size="xs"
                            onClick={() =>
                              setFillerWords(
                                fillerWords.filter((other) => other !== word),
                              )
                            }
                            aria-label={`Remove filler word ${word}`}
                          >
                            <span dir="auto">{word}</span> ×
                          </Button>
                        ))}
                      </div>
                      <Input
                        value={fillerDraft}
                        onChange={(event) => setFillerDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault()
                            addFillerWord()
                          }
                        }}
                        placeholder="Add a filler word and press Enter"
                        aria-label="Add filler word"
                      />
                      <SliderRow
                        label="Frequency"
                        readout={`${Math.round(fillerFrequency * 100)}%`}
                      >
                        <Slider
                          value={[fillerFrequency]}
                          onValueChange={([value]) => setFillerFrequency(value)}
                          min={0.05}
                          max={1}
                          step={0.05}
                        />
                      </SliderRow>
                    </>
                  ) : null}
                </SettingRow>

                <Separator />

                <SettingRow
                  title="Background noise"
                  description={
                    backgroundNoise
                      ? "A low ambience bed plays behind the voice."
                      : "Calls play no ambience behind the voice."
                  }
                  control={
                    <Switch
                      checked={backgroundNoise}
                      onCheckedChange={setBackgroundNoise}
                      aria-label="Toggle background noise"
                    />
                  }
                >
                  {backgroundNoise ? (
                    <>
                      <Select value={noiseType} onValueChange={setNoiseType}>
                        <SelectTrigger
                          aria-label="Sound type"
                          className="max-w-56"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NOISE_TYPES.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <SliderRow
                        label="Volume"
                        readout={`${Math.round(noiseVolume * 100)}%`}
                      >
                        <Slider
                          value={[noiseVolume]}
                          onValueChange={([value]) => setNoiseVolume(value)}
                          min={0.05}
                          max={1}
                          step={0.05}
                        />
                      </SliderRow>
                    </>
                  ) : null}
                </SettingRow>
              </GroupPanel>

              <GroupPanel label="Timing">
                <SettingRow
                  title="Turn timing"
                  description={
                    turnOverride
                      ? "Custom waits for this persona."
                      : `Waits follow the organization defaults for ${language}.`
                  }
                  control={
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setTurnOverride(!turnOverride)}
                    >
                      {turnOverride ? "Use global" : "Override"}
                    </Button>
                  }
                >
                  {turnOverride ? (
                    <div className="grid max-w-sm grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel htmlFor="turn-min">Min wait (s)</FieldLabel>
                        <Input
                          id="turn-min"
                          value={minWait}
                          onChange={(event) => setMinWait(event.target.value)}
                          inputMode="decimal"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="turn-max">Max wait (s)</FieldLabel>
                        <Input
                          id="turn-max"
                          value={maxWait}
                          onChange={(event) => setMaxWait(event.target.value)}
                          inputMode="decimal"
                        />
                      </Field>
                    </div>
                  ) : null}
                </SettingRow>

                <Separator />

                <SettingRow
                  title="Silence timeout"
                  description={
                    timeoutOn
                      ? "Reprompt when the caller goes quiet."
                      : "The call stays open however long the caller pauses."
                  }
                  control={
                    <Switch
                      checked={timeoutOn}
                      onCheckedChange={setTimeoutOn}
                      aria-label="Toggle silence timeout"
                    />
                  }
                >
                  {timeoutOn ? (
                    <div className="grid max-w-sm grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel htmlFor="timeout-duration">
                          Duration (s)
                        </FieldLabel>
                        <Input
                          id="timeout-duration"
                          value={timeoutSeconds}
                          onChange={(event) =>
                            setTimeoutSeconds(event.target.value)
                          }
                          inputMode="numeric"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="timeout-retries">
                          Max retries
                        </FieldLabel>
                        <Input
                          id="timeout-retries"
                          value={timeoutRetries}
                          onChange={(event) =>
                            setTimeoutRetries(event.target.value)
                          }
                          inputMode="numeric"
                        />
                      </Field>
                    </div>
                  ) : null}
                </SettingRow>
              </GroupPanel>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        {!canSave ? (
          <span className="me-auto self-center text-sm text-muted-foreground">
            {name.trim()
              ? "Pick a voice to finish."
              : voiceId
                ? "Name the persona to finish."
                : "A name and a voice are required."}
          </span>
        ) : null}
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          disabled={!canSave}
          onClick={() => {
            onSubmit({ name: name.trim(), language, gender, voiceId, prompt })
            onClose()
          }}
        >
          {editing ? "Save changes" : "Create persona"}
        </Button>
      </DialogFooter>
    </>
  )
}

/**
 * Two settings that belong together, on one muted panel with a quiet label.
 */
function GroupPanel({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  // Half-strength muted: full-strength matches the Slider track's own token
  // exactly, which made the unfilled track invisible.
  return (
    <section className="flex flex-col gap-4 rounded-lg bg-muted/50 p-4">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </section>
  )
}

/**
 * One setting inside a group: title and control on the first line, the
 * one-line status under them, expanded fields below. The status copy changes
 * with the switch, so a collapsed setting still says what "off" means.
 */
function SettingRow({
  title,
  description,
  control,
  children,
}: {
  title: string
  description: string
  control: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-medium">{title}</h3>
          {control}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children ? <div className="flex flex-col gap-3">{children}</div> : null}
    </div>
  )
}

function SliderRow({
  label,
  readout,
  children,
}: {
  label: string
  readout: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm text-muted-foreground">{label}</span>
      <div className="flex-1">{children}</div>
      <span className="w-10 text-end font-mono text-sm text-muted-foreground">
        {readout}
      </span>
    </div>
  )
}
