"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { RecordIcon } from "@/components/mockups/voice-cloning/icons"
import { PERSONA, type Voice } from "@/lib/mockups/voice-cloning-data"
import { cn } from "@/lib/utils"

/**
 * The Voice section of the persona form, as `VoiceSelector` renders it on the
 * platform — radio cards, filtered to the persona's language and gender —
 * with two changes for DES-198:
 *
 *  - Two groups: the organization's own voices first, then Sarj's catalog. A
 *    clone sits where its owner looks for it, and a catalog voice is never
 *    mistaken for one. The first group is absent until the organization has
 *    a voice of this language and gender.
 *  - Clone a voice at the foot, the design system's "Create … at the foot of
 *    a picker". It opens the same flow as the Voice library and comes back
 *    with the new voice selected — no sample to a voice on the persona in
 *    one sitting.
 *
 * Only the voice section is drawn; the rest of the persona form is unchanged
 * by this ticket (DES-148 owns it). Inactive voices are not offered, as today.
 */

export function PersonaVoice({
  voices,
  voiceId,
  onVoiceChange,
  onClone,
}: {
  voices: Voice[]
  voiceId: string
  onVoiceChange: (id: string) => void
  onClone: () => void
}) {
  const offered = voices.filter(
    (voice) =>
      voice.language === PERSONA.language &&
      voice.gender === PERSONA.gender &&
      voice.status !== "inactive",
  )
  const groups = [
    {
      label: "Your organization",
      voices: offered.filter((voice) => voice.scope === "org"),
    },
    {
      label: "Sarj library",
      voices: offered.filter((voice) => voice.scope === "catalog"),
    },
  ].filter((group) => group.voices.length > 0)

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Voice</CardTitle>
          <CardDescription>
            {PERSONA.name} · Arabic · Female
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <RadioGroup
            aria-label="Voice"
            className="flex flex-col gap-6"
            onValueChange={onVoiceChange}
            value={voiceId}
          >
            {groups.map((group) => (
              <div className="flex flex-col gap-2" key={group.label}>
                <span className="text-sm text-muted-foreground">
                  {group.label}
                </span>
                <div className="grid gap-4 sm:grid-cols-3">
                  {group.voices.map((voice) => (
                    <VoiceCard
                      key={voice.id}
                      selected={voice.id === voiceId}
                      voice={voice}
                    />
                  ))}
                </div>
              </div>
            ))}
          </RadioGroup>

          <div>
            <Button onClick={onClone} variant="outline">
              <RecordIcon />
              Clone a voice
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

function VoiceCard({ voice, selected }: { voice: Voice; selected: boolean }) {
  return (
    <Item
      asChild
      className={cn(
        "cursor-pointer hover:bg-muted/50",
        selected && "border-primary ring-1 ring-primary",
      )}
      variant="outline"
    >
      <label htmlFor={`persona-voice-${voice.id}`}>
        <ItemMedia>
          <RadioGroupItem id={`persona-voice-${voice.id}`} value={voice.id} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle dir="auto">{voice.name}</ItemTitle>
          <ItemDescription dir="auto">
            {voice.vibe ?? voice.provider}
          </ItemDescription>
        </ItemContent>
      </label>
    </Item>
  )
}
