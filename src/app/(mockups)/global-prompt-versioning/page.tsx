"use client";

import * as React from "react";
import { toast } from "sonner";

import { ConversationVersion } from "@/components/mockups/global-prompt-versioning/conversation-version";
import { GlobalPromptEditor } from "@/components/mockups/global-prompt-versioning/global-prompt-editor";
import { AppShell } from "@/components/shell/app-shell";
import { MockupShell } from "@/components/shell/mockup-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  CASES,
  type CaseId,
  type Mode,
  MODES,
  PEOPLE,
  type PersonId,
} from "@/lib/mockups/global-prompt-versioning-data";

const SURFACES = [
  { id: "prompt", label: "Global prompts" },
  { id: "conversation", label: "Conversation details" },
] as const;

type Surface = (typeof SURFACES)[number]["id"];

export default function GlobalPromptVersioningPage() {
  const [surface, setSurface] = React.useState<Surface>("prompt");
  const [mode, setMode] = React.useState<Mode>("direct");
  const [personId, setPersonId] = React.useState<PersonId>("publisher");
  const [caseId, setCaseId] = React.useState<CaseId>("normal");
  const [openAt, setOpenAt] = React.useState<number | undefined>();

  React.useEffect(() => {
    toast.dismiss();
  }, [surface, mode, personId, caseId]);

  const people = PEOPLE[mode];
  const person =
    people.find((entry) => entry.personId === personId) ?? people[0];

  function pickMode(next: Mode) {
    setMode(next);
    setPersonId(PEOPLE[next][0].personId);
    setCaseId("normal");
    setOpenAt(undefined);
  }

  function pickCase(next: CaseId) {
    setCaseId(next);
    setOpenAt(undefined);
    if (next === "approve-fails") setPersonId("approver");
    if (next === "send-fails") setPersonId("editor");
  }

  return (
    <MockupShell
      actions={
        <div className="flex items-center gap-1.5 max-sm:max-w-56 max-sm:overflow-x-auto">
          <Select
            onValueChange={(value) => {
              const picked = MODES.find((entry) => entry.id === value);
              if (picked) pickMode(picked.id);
            }}
            value={mode}
          >
            <SelectTrigger aria-label="Publishing" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" position="popper">
              {MODES.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => {
              const picked = people.find((entry) => entry.personId === value);
              if (picked) setPersonId(picked.personId);
            }}
            value={person.personId}
          >
            <SelectTrigger aria-label="Viewing as" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" position="popper">
              {people.map((entry) => (
                <SelectItem key={entry.personId} value={entry.personId}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => {
              const picked = CASES[mode].find((entry) => entry.id === value);
              if (picked) pickCase(picked.id);
            }}
            value={caseId}
          >
            <SelectTrigger aria-label="State" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" position="popper">
              {CASES[mode].map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToggleGroup
            aria-label="Surface"
            onValueChange={(next) => {
              const picked = SURFACES.find((entry) => entry.id === next);
              if (!picked) return;
              setSurface(picked.id);
              setOpenAt(undefined);
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
        </div>
      }
      title="Versioning for the global prompt"
    >
      <TooltipProvider>
        <AppShell
          active={
            surface === "conversation" ? "Conversations" : "Global Prompts"
          }
          breadcrumb={
            surface === "conversation" ? "Conversations" : "Global prompts"
          }
        >
          {surface === "conversation" ? (
            <ConversationVersion
              onOpenVersion={(n) => {
                setSurface("prompt");
                setOpenAt(n);
              }}
            />
          ) : (
            <GlobalPromptEditor
              caseId={caseId}
              key={`${mode}-${person.personId}-${caseId}-${String(openAt ?? "")}`}
              mode={mode}
              openAt={openAt}
              person={person}
            />
          )}
        </AppShell>
      </TooltipProvider>
    </MockupShell>
  );
}
