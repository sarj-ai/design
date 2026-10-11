"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CloneVoiceFlow } from "@/components/mockups/voice-cloning/clone-voice-flow"
import { PersonaVoice } from "@/components/mockups/voice-cloning/persona-voice"
import { VoiceLibrary } from "@/components/mockups/voice-cloning/voice-library"
import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
import {
  OUTCOMES,
  PERSONA,
  type SampleOutcome,
  type Viewer,
  type Voice,
  voicesFor,
} from "@/lib/mockups/voice-cloning-data"

/**
 * Voice cloning — DES-198, under INT-191, for PLT-4472. The spec is the PRD
 * "Voice cloning on the platform" (DIS-71).
 *
 * Two places the flow starts from, one flow:
 *  - Voice library: Clone voice beside Add voice, the new Pending status, and
 *    delete on cloned voices (blocked while a persona uses one).
 *  - Persona: the voice picker, own voices above Sarj's, Clone a voice at its
 *    foot; the new voice comes back selected.
 *
 * The bar holds what a reviewer needs to reach every state: the surface, who
 * is looking (only Sarj users get the publish request, and Add voice), and
 * how the sample turns out — clean, noisy, or a clone that fails once.
 */

const SURFACES = [
  { id: "library", label: "Voice library" },
  { id: "persona", label: "Persona" },
] as const

type Surface = (typeof SURFACES)[number]["id"]

const VIEWERS: { id: Viewer; label: string }[] = [
  { id: "client", label: "Client org" },
  { id: "sarj", label: "Sarj" },
]

export default function VoiceCloningPage() {
  const [surface, setSurface] = React.useState<Surface>("library")
  const [viewer, setViewer] = React.useState<Viewer>("client")
  const [outcome, setOutcome] = React.useState<SampleOutcome>("clean")
  const [voices, setVoices] = React.useState<Voice[]>(() => voicesFor("client"))
  const [voiceId, setVoiceId] = React.useState(PERSONA.voiceId)
  const [cloning, setCloning] = React.useState(false)

  const changeViewer = (next: Viewer) => {
    setViewer(next)
    setVoices(voicesFor(next))
    setVoiceId(PERSONA.voiceId)
  }

  const created = (voice: Voice) => {
    setVoices((current) => [voice, ...current])
    if (surface === "persona") {
      if (
        voice.language === PERSONA.language &&
        voice.gender === PERSONA.gender
      ) {
        setVoiceId(voice.id)
      }
      return
    }
    toast(
      voice.status === "pending"
        ? `${voice.name} created. Publishing is pending approval.`
        : `${voice.name} created`,
    )
  }

  return (
    <MockupShell
      actions={
        <>
          <Select
            onValueChange={(value) => setOutcome(value as SampleOutcome)}
            value={outcome}
          >
            <SelectTrigger aria-label="Sample outcome" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" position="popper">
              {OUTCOMES.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToggleGroup
            aria-label="Viewer"
            onValueChange={(next) => {
              if (next) changeViewer(next as Viewer)
            }}
            size="sm"
            type="single"
            value={viewer}
            variant="outline"
          >
            {VIEWERS.map((entry) => (
              <ToggleGroupItem key={entry.id} value={entry.id}>
                {entry.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup
            aria-label="Surface"
            onValueChange={(next) => {
              if (next) setSurface(next as Surface)
            }}
            size="sm"
            type="single"
            value={surface}
            variant="outline"
          >
            {SURFACES.map((entry) => (
              <ToggleGroupItem key={entry.id} value={entry.id}>
                {entry.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </>
      }
      title="Voice cloning on the platform"
    >
      <TooltipProvider>
        {surface === "library" ? (
          <AppShell active="Voice Library">
            <VoiceLibrary
              onClone={() => setCloning(true)}
              onDelete={(voice) =>
                setVoices((current) =>
                  current.filter((entry) => entry.id !== voice.id),
                )
              }
              viewer={viewer}
              voices={voices}
            />
          </AppShell>
        ) : (
          <AppShell active="Personas" breadcrumb={["Personas", PERSONA.name]}>
            <PersonaVoice
              onClone={() => setCloning(true)}
              onVoiceChange={setVoiceId}
              voiceId={voiceId}
              voices={voices}
            />
          </AppShell>
        )}

        {/* From a persona the flow starts on its language and gender, so the
            clone lands in that persona's cards. Keyed so switching surface or
            viewer opens a fresh flow. */}
        <CloneVoiceFlow
          canPublish={viewer === "sarj"}
          defaults={{ language: PERSONA.language, gender: PERSONA.gender }}
          key={`${surface}-${viewer}`}
          onCreated={created}
          onOpenChange={setCloning}
          open={cloning}
          outcome={outcome}
        />
      </TooltipProvider>
    </MockupShell>
  )
}
