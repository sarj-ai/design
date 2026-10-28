"use client"

import * as React from "react"

import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  GLOBAL_VOICE,
  PERSONA,
  personaOverride,
  SAMPLE_CONFIG,
  type FillerConfig,
  type SampleLanguage,
} from "@/lib/mockups/phrase-mappings-data"
import { BackchannelSettings } from "@/components/mockups/phrase-mappings/backchannel-settings"
import { FillerWordsDrawer } from "@/components/mockups/phrase-mappings/filler-words-drawer"

type Scope = "global" | "persona"

export default function PhraseMappingsPage() {
  const [scope, setScope] = React.useState<Scope>("persona")

  const [language, setLanguage] = React.useState<SampleLanguage>("ar")

  const [globals, setGlobals] = React.useState<FillerConfig>(
    SAMPLE_CONFIG[language],
  )

  // `null` while the persona inherits; an override replaces the whole set.
  const [override, setOverride] = React.useState<FillerConfig | null>(() =>
    personaOverride(SAMPLE_CONFIG[language]),
  )

  const [fillerWords, setFillerWords] = React.useState(true)

  const [drawerOpen, setDrawerOpen] = React.useState(true)

  const isPersona = scope === "persona"
  const config = isPersona && override ? override : globals

  function switchLanguage(next: SampleLanguage) {
    setLanguage(next)
    setGlobals(SAMPLE_CONFIG[next])
    setOverride((current) =>
      current === null ? null : personaOverride(SAMPLE_CONFIG[next]),
    )
  }

  const setConfig = (next: FillerConfig) => {
    if (isPersona && override) {
      setOverride(next)
      return
    }
    setGlobals(next)
  }

  return (
    <MockupShell
      eyebrow="Backchannel settings"
      title="Design persona-specific backchannel phrase-response mappings"
      actions={
        <>
          <span className="text-xs text-muted-foreground">Scope</span>
          <ToggleGroup
            onValueChange={(value) => {
              if (value) setScope(value as Scope)
            }}
            size="sm"
            type="single"
            value={scope}
            variant="outline"
          >
            <ToggleGroupItem value="global">Global settings</ToggleGroupItem>
            <ToggleGroupItem value="persona">
              Persona · {PERSONA.name}
            </ToggleGroupItem>
          </ToggleGroup>

          <Separator className="h-5" orientation="vertical" />

          <span className="text-xs text-muted-foreground">Sample</span>
          <ToggleGroup
            onValueChange={(value) => {
              if (value) switchLanguage(value as SampleLanguage)
            }}
            size="sm"
            type="single"
            value={language}
            variant="outline"
          >
            <ToggleGroupItem value="ar">Arabic</ToggleGroupItem>
            <ToggleGroupItem value="en">English</ToggleGroupItem>
          </ToggleGroup>
        </>
      }
    >
      <AppShell
        active={isPersona ? "Personas" : "Global Settings"}
        onNavigate={(title) => {
          if (title === "Personas") setScope("persona")
          if (title === "Global Settings") setScope("global")
        }}
      >
        <main className="mx-auto flex w-full max-w-350 flex-col gap-6 p-3 lg:p-4">
          <header className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold">
                {isPersona
                  ? `Edit persona · ${PERSONA.name}`
                  : "Global settings"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isPersona
                  ? PERSONA.description
                  : "Defaults every persona inherits on new calls."}
              </p>
            </div>

            <Button>{isPersona ? "Update Profile" : "Save for All"}</Button>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Backchannel settings</CardTitle>
              <CardDescription>
                {isPersona
                  ? `How ${PERSONA.name} acknowledges the caller after each turn.`
                  : "How every persona acknowledges the caller after each turn."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BackchannelSettings
                fillerWords={fillerWords}
                onConfigure={() => setDrawerOpen(true)}
                onFillerWordsChange={(enabled) => {
                  setFillerWords(enabled)
                  if (!enabled) setDrawerOpen(false)
                }}
              />
            </CardContent>
          </Card>
        </main>
      </AppShell>

      <FillerWordsDrawer
        config={config}
        inherited={isPersona && override === null}
        onChange={setConfig}
        onCreateOverride={() => setOverride(personaOverride(globals))}
        onOpenChange={setDrawerOpen}
        onRemoveOverride={() => setOverride(null)}
        open={drawerOpen && fillerWords}
        persona={isPersona ? PERSONA.name : undefined}
        voice={isPersona ? PERSONA.voice : GLOBAL_VOICE}
      />
    </MockupShell>
  )
}
