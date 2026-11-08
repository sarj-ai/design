"use client";

import * as React from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EditPersonaDialog } from "@/components/mockups/voice-ownership/edit-persona-dialog";
import { PersonaList } from "@/components/mockups/voice-ownership/persona-list";
import { AppShell } from "@/components/shell/app-shell";
import { MockupShell } from "@/components/shell/mockup-shell";
import {
  EDITING_ID,
  PERSONAS,
  type Persona,
} from "@/lib/mockups/voice-ownership-data";

const ORG_VOICES = [
  { id: "some", label: "Has own voices" },
  { id: "none", label: "No own voices" },
] as const;

type OrgVoices = (typeof ORG_VOICES)[number]["id"];

export default function VoiceOwnershipPage() {
  const [orgVoices, setOrgVoices] = React.useState<OrgVoices>("some");
  const [editing, setEditing] = React.useState<Persona | null>(
    () => PERSONAS.find((persona) => persona.id === EDITING_ID) ?? null,
  );

  return (
    <MockupShell
      actions={
        <ToggleGroup
          aria-label="Organization voices"
          onValueChange={(next) => {
            if (next) setOrgVoices(next as OrgVoices);
          }}
          size="sm"
          type="single"
          value={orgVoices}
          variant="outline"
        >
          {ORG_VOICES.map((entry) => (
            <ToggleGroupItem key={entry.id} value={entry.id}>
              {entry.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      }
      title="Global vs organization voices"
    >
      <AppShell active="Personas">
        <PersonaList onEdit={setEditing} />
      </AppShell>
      <EditPersonaDialog
        hasOrgVoices={orgVoices === "some"}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        persona={editing}
      />
    </MockupShell>
  );
}
