"use client"

import { Separator } from "@/components/ui/separator"
import {
  MODEL_SETTINGS,
  type CallCase,
  type TurnTimingRecord,
} from "@/lib/call-turn-timing-data"

import { LanguageModelIcon, SpeechToTextIcon, TextToSpeechIcon } from "./icons"
import { TurnDetectionSection } from "./turn-detection-section"

/**
 * The Model Settings tab of the call detail, with the new turn detection
 * section in place.
 *
 * The three sections below it are unchanged and are here only so the placement
 * reads: turn detection goes first because it is the only one that reports what
 * happened rather than echoing what was configured, and it is what someone
 * opens this tab to find when a client says the agent was slow.
 */
export function ModelSettingsTab({
  timing,
  voice,
}: {
  timing: null | TurnTimingRecord
  voice: CallCase["voice"]
}) {
  return (
    <div className="flex flex-col gap-6">
      <TurnDetectionSection timing={timing} />

      <Separator />

      <ConfigSection
        icon={<LanguageModelIcon />}
        title="Language Model"
        rows={[
          { label: "Provider", value: MODEL_SETTINGS.llm.provider },
          { label: "Model", value: MODEL_SETTINGS.llm.model },
        ]}
      />

      <Separator />

      <ConfigSection
        icon={<SpeechToTextIcon />}
        title="Speech-to-Text"
        rows={[
          { label: "Provider", value: MODEL_SETTINGS.stt.provider },
          { label: "Model", value: MODEL_SETTINGS.stt.model },
        ]}
      />

      <Separator />

      <ConfigSection
        icon={<TextToSpeechIcon />}
        title="Text-to-Speech"
        rows={[
          { label: "Provider", value: MODEL_SETTINGS.tts.provider },
          { label: "Model", value: MODEL_SETTINGS.tts.model },
          { label: "Voice", value: voice.name },
          { label: "Language", value: voice.language },
          { label: "Gender", value: voice.gender },
        ]}
      />
    </div>
  )
}

/** The label-and-value shape the tab already uses for every model section. */
function ConfigSection({
  icon,
  title,
  rows,
}: {
  icon: React.ReactNode
  title: string
  rows: { label: string; value: string }[]
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 text-base font-medium">
        {icon}
        {title}
      </h3>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 text-sm"
          >
            <span>{row.label}</span>
            <span className="text-end">{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
