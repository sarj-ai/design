"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FALLBACK_VOICES } from "@/lib/mockups/add-voice-data"

export function FallbackVoicePicker({
  onValueChange,
  value,
}: {
  onValueChange: (voiceId: string) => void
  value: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button variant="outline">Change voice</Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-80">
        <RadioGroup
          className="gap-0"
          onValueChange={(voiceId) => {
            onValueChange(voiceId)
            setOpen(false)
          }}
          value={value}
        >
          {FALLBACK_VOICES.map((voice) => (
            <Label
              className="items-start gap-3 rounded-md px-2 py-1.5 font-normal transition-colors duration-150 hover:bg-accent motion-reduce:transition-none"
              htmlFor={`fallback-${voice.id}`}
              key={voice.id}
            >
              <RadioGroupItem
                className="mt-1"
                id={`fallback-${voice.id}`}
                value={voice.id}
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-base font-medium">{voice.name}</span>
                <span className="text-muted-foreground">
                  {voice.vibe} · {voice.gender}
                </span>
              </span>
            </Label>
          ))}
        </RadioGroup>
      </PopoverContent>
    </Popover>
  )
}
