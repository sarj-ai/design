"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  LANGUAGE_LABEL,
  LANGUAGE_SHORT,
  LANGUAGES,
  SCENARIO,
  TEXTS,
  type LanguageCode,
  type PromptText,
  type Variable,
} from "@/lib/mockups/variable-mentions-data"

import type { ChipTreatment } from "@/components/mockups/variable-mentions/chip-treatment"
import { MentionEditor } from "@/components/mockups/variable-mentions/mention-editor"

/**
 * The two places a scenario author writes prose the agent will say: the
 * first message and the prompt. They are the surfaces PROD-80 gives the `@`
 * flow, and the only part of the scenario editor on this page — the rest
 * of the editor is unchanged by this ticket.
 *
 * Each language keeps its own text, as it does in the product. Switching
 * remounts both editors so the Arabic text is painted fresh, chips and all.
 */
export function ScenarioPrompt({
  treatment,
  variables,
  variablesLoading,
  viewOnly,
}: {
  treatment: ChipTreatment
  variables: Variable[]
  variablesLoading: boolean
  viewOnly: boolean
}) {
  const [language, setLanguage] = React.useState<LanguageCode>("en")
  const [texts, setTexts] = React.useState(TEXTS)

  const current = texts[language]
  const dir = language === "ar" ? "rtl" : "ltr"

  const update = (patch: Partial<PromptText>) =>
    setTexts((previous) => ({
      ...previous,
      [language]: { ...previous[language], ...patch },
    }))

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
      <header className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">{SCENARIO.name}</h1>

        <ToggleGroup
          aria-label="Language"
          onValueChange={(value) => {
            if (value) setLanguage(value as LanguageCode)
          }}
          size="sm"
          type="single"
          value={language}
          variant="outline"
        >
          {LANGUAGES.map((code) => (
            <ToggleGroupItem
              aria-label={LANGUAGE_LABEL[code]}
              key={code}
              value={code}
            >
              {LANGUAGE_SHORT[code]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>First message</CardTitle>
          <CardDescription>
            What the agent says when the call connects. Type @ to insert a
            variable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MentionEditor
            ariaLabel="First message"
            dir={dir}
            disabled={viewOnly}
            key={`first-message-${language}`}
            onChange={(firstMessage) => update({ firstMessage })}
            placeholder="Type @ to insert a variable"
            treatment={treatment}
            value={current.firstMessage}
            variables={variables}
            variablesLoading={variablesLoading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prompt</CardTitle>
          <CardDescription>
            The instructions the agent follows for the whole call. Type @ to
            insert a variable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MentionEditor
            ariaLabel="Prompt"
            dir={dir}
            disabled={viewOnly}
            key={`prompt-${language}`}
            multiline
            onChange={(prompt) => update({ prompt })}
            placeholder="Type @ to insert a variable"
            treatment={treatment}
            value={current.prompt}
            variables={variables}
            variablesLoading={variablesLoading}
          />
        </CardContent>
      </Card>
    </main>
  )
}
