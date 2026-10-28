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
  GLOBAL_CONFIGS,
  PERSONA,
  personaOverride,
  type CueConfig,
  type Language,
} from "@/lib/mockups/listener-cues-data"
import { BackchannelSettings } from "@/components/mockups/listener-cues/backchannel-settings"
import { ListenerCuesDrawer } from "@/components/mockups/listener-cues/listener-cues-drawer"

type Scope = "global" | "persona"

export default function ListenerCuesPage() {
  const [scope, setScope] = React.useState<Scope>("persona")

  const [globals, setGlobals] =
    React.useState<Record<Language, CueConfig>>(GLOBAL_CONFIGS)

  const [language, setLanguage] = React.useState<Language>(PERSONA.language)

  // `null` while the persona inherits.
  const [override, setOverride] = React.useState<Record<
    Language,
    CueConfig
  > | null>(() => personaOverride(GLOBAL_CONFIGS))

  const [fillerWords, setFillerWords] = React.useState(true)
  const [listenerCues, setListenerCues] = React.useState(true)

  const [drawerOpen, setDrawerOpen] = React.useState(true)

  const isPersona = scope === "persona"
  const config = isPersona && override ? override[language] : globals[language]

  const setConfig = (next: CueConfig) => {
    if (isPersona && override) {
      setOverride({ ...override, [language]: next })
      return
    }
    setGlobals({ ...globals, [language]: next })
  }

  return (
    <MockupShell
      eyebrow="Backchannel settings"
      title="Design backchanneling without mid-conversation interruption"
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

          <span className="text-xs text-muted-foreground">Approved set</span>
          <ToggleGroup
            onValueChange={(value) => {
              if (value) setLanguage(value as Language)
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
                  ? `How ${PERSONA.name} acknowledges the caller during calls.`
                  : "How every persona acknowledges the caller during calls."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BackchannelSettings
                fillerWords={fillerWords}
                listenerCues={listenerCues}
                onConfigure={() => setDrawerOpen(true)}
                onFillerWordsChange={setFillerWords}
                onListenerCuesChange={(enabled) => {
                  setListenerCues(enabled)
                  if (!enabled) setDrawerOpen(false)
                }}
              />
            </CardContent>
          </Card>
        </main>
      </AppShell>

      <ListenerCuesDrawer
        config={config}
        inherited={isPersona && override === null}
        language={language}
        onChange={setConfig}
        onCreateOverride={() => setOverride(personaOverride(globals))}
        onOpenChange={setDrawerOpen}
        onRemoveOverride={() => setOverride(null)}
        open={drawerOpen && listenerCues}
        persona={isPersona ? PERSONA.name : undefined}
      />
    </MockupShell>
  )
}
