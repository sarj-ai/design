"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CloneVoiceIcon,
  CloseIcon,
  PreviewVoiceIcon,
  StopPreviewIcon,
} from "@/components/mockups/voice-ownership/icons";
import { OrbAvatar } from "@/components/shared/orb-avatar";
import {
  GENDERS,
  LANGUAGES,
  VOICES,
  type Gender,
  type Language,
  type Persona,
  type Voice,
} from "@/lib/mockups/voice-ownership-data";
import { cn } from "@/lib/utils";

/**
 * The platform's edit persona dialog (agents/components/agent-profile-form.tsx),
 * Identity and Voice sections. Behavior and pronunciation are unchanged by
 * DES-207 and left out.
 */
export function EditPersonaDialog({
  persona,
  hasOrgVoices,
  onOpenChange,
}: {
  persona: Persona | null;
  hasOrgVoices: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={persona !== null}>
      <DialogContent
        // eslint-disable-next-line sarj/surface-width -- the shipped persona dialog is 800px; DES-207 changes only its Voice section
        className="sm:max-w-200"
        onOpenAutoFocus={(event) => event.preventDefault()}
        showCloseButton={false}
      >
        {persona ? (
          <PersonaForm
            hasOrgVoices={hasOrgVoices}
            key={persona.id}
            onClose={() => onOpenChange(false)}
            persona={persona}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function PersonaForm({
  persona,
  hasOrgVoices,
  onClose,
}: {
  persona: Persona;
  hasOrgVoices: boolean;
  onClose: () => void;
}) {
  const [language, setLanguage] = React.useState<Language>(persona.language);
  const [gender, setGender] = React.useState<Gender>(persona.gender);
  const [prompt, setPrompt] = React.useState(persona.prompt);
  const [voiceId, setVoiceId] = React.useState(persona.voiceId);

  return (
    <>
      <DialogHeader className="-mx-4 -mt-4 flex-row items-center justify-between gap-4 border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <OrbAvatar name={persona.name} size="lg" />
          <div className="flex flex-col gap-0.5">
            <DialogTitle dir="auto">{persona.name}</DialogTitle>
            <DialogDescription>
              {language}
              {persona.isDefault ? " · Default" : null}
            </DialogDescription>
          </div>
        </div>
        <DialogClose asChild>
          <Button aria-label="Close" size="icon-sm" variant="ghost">
            <CloseIcon />
          </Button>
        </DialogClose>
      </DialogHeader>

      <ScrollArea className="-mx-4 -my-4 [&>[data-slot=scroll-area-viewport]]:max-h-150">
        <div className="flex flex-col gap-8 px-6 py-6">
          <section className="flex flex-col gap-4">
            <h3 className="text-base font-semibold">Identity</h3>
            <div className="grid grid-cols-2 gap-6">
              <Field>
                <FieldLabel htmlFor="persona-language">Language</FieldLabel>
                <Select
                  onValueChange={(value) => setLanguage(value as Language)}
                  value={language}
                >
                  <SelectTrigger className="w-full" id="persona-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
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
                  onValueChange={(value) => setGender(value as Gender)}
                  value={gender}
                >
                  <SelectTrigger className="w-full" id="persona-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
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
                onChange={(event) => setPrompt(event.target.value)}
                rows={4}
                value={prompt}
              />
            </Field>
          </section>

          <VoiceSection
            gender={gender}
            hasOrgVoices={hasOrgVoices}
            language={language}
            onChange={setVoiceId}
            value={voiceId}
          />
        </div>
      </ScrollArea>

      <DialogFooter className="px-6">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={onClose}>Save changes</Button>
      </DialogFooter>
    </>
  );
}

/** The organization's own voices first, then Sarj's short list — both filtered by the persona's language and gender. */
function VoiceSection({
  language,
  gender,
  hasOrgVoices,
  value,
  onChange,
}: {
  language: Language;
  gender: Gender;
  hasOrgVoices: boolean;
  value: string;
  onChange: (id: string) => void;
}) {
  const [playing, setPlaying] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setPlaying(null), 2400);
    return () => window.clearTimeout(timer);
  }, [playing]);

  const offered = VOICES.filter(
    (voice) => voice.language === language && voice.gender === gender,
  );
  const own = hasOrgVoices ? offered.filter((v) => v.owner === "org") : [];
  const sarj = offered.filter((v) => v.owner === "sarj");

  const card = (voice: Voice) => (
    <VoiceCard
      key={voice.id}
      onPreview={() => setPlaying(playing === voice.id ? null : voice.id)}
      playing={playing === voice.id}
      selected={voice.id === value}
      voice={voice}
    />
  );

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-base font-semibold">Voice</h3>
      <RadioGroup
        aria-label="Voice"
        className="flex flex-col gap-6"
        onValueChange={onChange}
        value={value}
      >
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            Your organization
          </span>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {own.map(card)}
            {own.length === 0 ? <CloneTile /> : null}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Sarj</span>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {sarj.map(card)}
          </div>
        </div>
      </RadioGroup>
    </section>
  );
}

/** The label stretches over the card; Preview sits above it so playing never selects. */
function VoiceCard({
  voice,
  selected,
  playing,
  onPreview,
}: {
  voice: Voice;
  selected: boolean;
  playing: boolean;
  onPreview: () => void;
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
        <RadioGroupItem id={`voice-${voice.id}`} value={voice.id} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          <Label
            className="cursor-pointer after:absolute after:inset-0"
            htmlFor={`voice-${voice.id}`}
          >
            {voice.name}
          </Label>
        </ItemTitle>
        <ItemDescription>{voice.provider}</ItemDescription>
      </ItemContent>
      <ItemActions className="relative z-raised">
        <Button
          aria-label={`${playing ? "Stop" : "Play"} ${voice.name}`}
          onClick={onPreview}
          size="icon-sm"
          variant="ghost"
        >
          {playing ? <StopPreviewIcon /> : <PreviewVoiceIcon />}
        </Button>
      </ItemActions>
    </Item>
  );
}

/** Sits where the organization's first voice would, the same size as one; opens the DES-198 clone flow. */
function CloneTile() {
  return (
    <Item
      asChild
      className="border-dashed text-start hover:bg-muted/50"
      variant="outline"
    >
      <button type="button">
        <ItemMedia variant="icon">
          <CloneVoiceIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Clone a voice</ItemTitle>
          <ItemDescription>Only your organization</ItemDescription>
        </ItemContent>
      </button>
    </Item>
  );
}
