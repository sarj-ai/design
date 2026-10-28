"use client"

import * as React from "react"
import { toast } from "sonner"

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
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  DeleteVoiceIcon,
  RecordIcon,
} from "@/components/mockups/voice-cloning/icons"
import { DeleteVoiceConfirm } from "@/components/mockups/voice-cloning/voice-library"
import { PERSONA, type Voice } from "@/lib/mockups/voice-cloning-data"
import { cn } from "@/lib/utils"

export function PersonaVoice({
  voices,
  voiceId,
  onVoiceChange,
  onClone,
  onDelete,
}: {
  voices: Voice[]
  voiceId: string
  onVoiceChange: (id: string) => void
  onClone: () => void
  onDelete: (voice: Voice) => void
}) {
  const [deleting, setDeleting] = React.useState<Voice | null>(null)
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
          <CardDescription>{PERSONA.name} · Arabic · Female</CardDescription>
        </CardHeader>
        <CardContent>
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
                      onDelete={
                        voice.scope === "org" && voice.cloned
                          ? () => setDeleting(voice)
                          : null
                      }
                      selected={voice.id === voiceId}
                      voice={voice}
                    />
                  ))}
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        {/* The card's action gets its own band, end-aligned — the Forms
            rule for a card's actions, as /language-switching's Save. */}
        <CardFooter className="justify-end">
          <Button onClick={onClone} variant="outline">
            <RecordIcon />
            Clone a voice
          </Button>
        </CardFooter>
      </Card>

      <DeleteVoiceConfirm
        onConfirm={(voice) => {
          onDelete(voice)
          toast(`${voice.name} deleted`)
        }}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        voice={deleting}
      />
    </main>
  )
}

/** The label is stretched over the card; Delete sits above it so deleting never selects. */
function VoiceCard({
  voice,
  selected,
  onDelete,
}: {
  voice: Voice
  selected: boolean
  onDelete: (() => void) | null
}) {
  return (
    <Item
      className={cn(
        "relative cursor-pointer hover:bg-muted/50",
        selected && "border-primary ring-1 ring-primary",
      )}
      variant="outline"
    >
      <ItemMedia>
        <RadioGroupItem id={`persona-voice-${voice.id}`} value={voice.id} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle dir="auto">
          <Label
            className="cursor-pointer after:absolute after:inset-0"
            htmlFor={`persona-voice-${voice.id}`}
          >
            {voice.name}
          </Label>
        </ItemTitle>
        <ItemDescription dir="auto">
          {voice.vibe ?? voice.provider}
        </ItemDescription>
      </ItemContent>
      {onDelete ? (
        <ItemActions className="relative z-raised">
          <Button
            aria-label={`Delete ${voice.name}`}
            onClick={onDelete}
            size="icon-sm"
            variant="ghost"
          >
            <DeleteVoiceIcon />
          </Button>
        </ItemActions>
      ) : null}
    </Item>
  )
}
