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
 *  - Persona, where a client organization clones: the voice picker, own
 *    voices above Sarj's, Clone a voice at its foot, delete on each own
 *    voice. The new voice comes back selected. The page opens here.
 *  - Voice library, super admin only as on the platform: Clone voice beside
 *    Add voice, the new Pending status, and delete on cloned voices (blocked
 *    while a persona uses one).
 *
 * The bar holds what a reviewer needs to reach every state: the surface, who
 * is looking on a persona (only a super admin gets the publish request; the
 * library has no client view, so the toggle is locked there), and how the
 * sample turns out — clean, noisy, or a clone that fails once.
 */

const SURFACES = [
  { id: "library", label: "Voice library" },
  { id: "persona", label: "Persona" },
] as const

type Surface = (typeof SURFACES)[number]["id"]

const VIEWERS: { id: Viewer; label: string }[] = [
  { id: "client", label: "Client org" },
  { id: "sarj", label: "Super admin" },
]

export default function VoiceCloningPage() {
  const [surface, setSurface] = React.useState<Surface>("persona")
  const [viewer, setViewer] = React.useState<Viewer>("client")
  const [outcome, setOutcome] = React.useState<SampleOutcome>("clean")
  const [voices, setVoices] = React.useState<Record<Viewer, Voice[]>>(() => ({
    client: voicesFor("client"),
    sarj: voicesFor("sarj"),
  }))
  const [voiceId, setVoiceId] = React.useState(PERSONA.voiceId)
  const [cloning, setCloning] = React.useState(false)

  /* The library is super admin only, whoever was picked for the persona. */
  const looking: Viewer = surface === "library" ? "sarj" : viewer

  const changeViewer = (next: Viewer) => {
    setViewer(next)
    setVoiceId(PERSONA.voiceId)
  }

  const deleted = (voice: Voice) => {
    setVoices((current) => ({
      ...current,
      [looking]: current[looking].filter((entry) => entry.id !== voice.id),
    }))
    if (voice.id === voiceId) setVoiceId(PERSONA.voiceId)
  }

  const created = (voice: Voice) => {
    setVoices((current) => ({
      ...current,
      [looking]: [voice, ...current[looking]],
    }))
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
            disabled={surface === "library"}
            onValueChange={(next) => {
              if (next) changeViewer(next as Viewer)
            }}
            size="sm"
            type="single"
            value={looking}
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
              onDelete={deleted}
              voices={voices.sarj}
            />
          </AppShell>
        ) : (
          <AppShell
            active="Personas"
            breadcrumb={["Personas", PERSONA.name]}
            /* The voice library is super admin only, so a client's nav
               doesn't list it. */
            hiddenItems={viewer === "client" ? ["Voice Library"] : undefined}
          >
            <PersonaVoice
              onClone={() => setCloning(true)}
              onDelete={deleted}
              onVoiceChange={setVoiceId}
              voiceId={voiceId}
              voices={voices[viewer]}
            />
          </AppShell>
        )}

        {/* From a persona the flow starts on its language and gender, so the
            clone lands in that persona's cards. Keyed so switching surface or
            viewer opens a fresh flow. */}
        <CloneVoiceFlow
          canPublish={looking === "sarj"}
          defaults={{ language: PERSONA.language, gender: PERSONA.gender }}
          key={`${surface}-${looking}`}
          onCreated={created}
          onOpenChange={setCloning}
          open={cloning}
          outcome={outcome}
        />
      </TooltipProvider>
    </MockupShell>
  )
}
