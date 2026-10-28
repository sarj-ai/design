"use client"

import * as React from "react"
import { toast } from "sonner"

import { PersonaCard } from "@/components/mockups/language-switching/persona-card"
import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  LANGUAGE_NAMES,
  PRESETS,
  type LanguageCode,
  type Preset,
} from "@/lib/mockups/language-switching-data"

export default function LanguageSwitchingPage() {
  const [presetId, setPresetId] = React.useState(PRESETS[0].id)
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]

  return (
    <MockupShell
      title="Mid-call language switching"
      actions={
        <ToggleGroup
          onValueChange={(next) => {
            if (next) setPresetId(next)
          }}
          size="sm"
          type="single"
          value={presetId}
          variant="outline"
        >
          {PRESETS.map((p) => (
            <ToggleGroupItem key={p.id} value={p.id}>
              {p.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      }
    >
      <AppShell
        active="Scenarios"
        breadcrumb={`Scenarios · ${preset.scenario}`}
      >
        {/* Keyed so switching scenario starts from that scenario's saved state. */}
        <ScenarioPersona key={preset.id} preset={preset} />
      </AppShell>
    </MockupShell>
  )
}

function ScenarioPersona({ preset }: { preset: Preset }) {
  const [config, setConfig] = React.useState(preset.draft ?? preset.config)
  const [languages, setLanguages] = React.useState(preset.languages)
  /* Empty until a save fails; from then on the check runs on every change. */
  const [checked, setChecked] = React.useState(false)

  const missing = config.switchVoice
    ? languages
        .map((l) => l.code)
        .filter((code) => code !== preset.start && !config.target[code])
    : []
  const invalid = new Set<LanguageCode>(checked ? missing : [])

  const save = () => {
    if (missing.length > 0) {
      setChecked(true)
      toast.error(
        `Choose a persona for ${missing.map((c) => LANGUAGE_NAMES[c]).join(" and ")} to save`,
      )
      return
    }
    setChecked(false)
    toast.success(`${preset.scenario} saved`)
  }

  return (
    <div className="flex flex-1 flex-col p-3 lg:p-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <PersonaCard
          config={config}
          invalid={invalid}
          languages={languages}
          onConfigChange={setConfig}
          onLanguagesChange={setLanguages}
          start={preset.start}
          footer={<Button onClick={save}>Save</Button>}
        />
      </div>
    </div>
  )
}
