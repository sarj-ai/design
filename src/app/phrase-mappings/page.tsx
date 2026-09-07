"use client"

import * as React from "react"

import { AppShell } from "@/components/app-shell"
import { MockupShell } from "@/components/mockup-shell"
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
} from "@/lib/phrase-mappings-data"
import { BackchannelSettings } from "@/components/phrase-mappings/backchannel-settings"
import { FillerWordsDrawer } from "@/components/phrase-mappings/filler-words-drawer"

type Scope = "global" | "persona"

/**
 * Configurable phrase-response mappings — DIS-21 / DES-171.
 *
 * Global Settings and a persona are two destinations in the product's own
 * sidebar, so they are two views of this one route rather than two mockups:
 * the scope changes whose values are on screen and which save action commits
 * them, never what there is to configure.
 */
export default function PhraseMappingsPage() {
  /* The persona, because the persona-specific case is what this ticket is
     about — the global set is one click away in the toolbar. */
  const [scope, setScope] = React.useState<Scope>("persona")

  /* Arabic is the case this design is for. English is here so a reviewer who
     does not read Arabic can still judge the layout — same rules, same match
     modes, same third rule off, different words. */
  const [language, setLanguage] = React.useState<SampleLanguage>("ar")

  const [globals, setGlobals] = React.useState<FillerConfig>(
    SAMPLE_CONFIG[language],
  )

  /* `null` while the persona inherits. The PRD's override is a full-set
     replacement, so it is one copy of the whole configuration rather than a
     patch over the globals. */
  const [override, setOverride] = React.useState<FillerConfig | null>(() =>
    personaOverride(SAMPLE_CONFIG[language]),
  )

  const [fillerWords, setFillerWords] = React.useState(true)

  /* Open on the panel this ticket is about; closing it reveals the row it was
     opened from. */
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

            {/* The PRD's publish points: nothing staged in the drawer reaches a
                call until one of these is pressed. */}
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
