"use client"

import * as React from "react"

import { PrimaryTabs } from "@/components/design-system/tabs-preview"
import { LanguageSwitchSetting } from "@/components/mockups/language-switching/language-switch-setting"
import { PersonaPicker } from "@/components/mockups/language-switching/persona-picker"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { TabsContent } from "@/components/ui/tabs"
import {
  LANGUAGE_NAMES,
  type LanguageCode,
  type ScenarioLanguage,
  type SwitchConfig,
} from "@/lib/mockups/language-switching-data"

/**
 * The scenario's persona card — as the platform draws it, a header-less card
 * around the language tabs — with the setting under the tabs.
 *
 * The language tabs stay what they are — one start persona per language —
 * and the setting sits under them, outside the tabs, because it belongs to
 * the scenario rather than to any one language. Inside a tab it would read as
 * a per-language switch and appear once per tab.
 *
 * A one-language scenario has nothing to switch to, so the setting is absent
 * there, not disabled.
 */
export function PersonaCard({
  config,
  invalid,
  languages,
  onConfigChange,
  onLanguagesChange,
  start,
  footer,
}: {
  config: SwitchConfig
  invalid: Set<LanguageCode>
  languages: ScenarioLanguage[]
  onConfigChange: (next: SwitchConfig) => void
  onLanguagesChange: (next: ScenarioLanguage[]) => void
  start: LanguageCode
  /** The card's own actions — Save sits inside the card, as on the platform. */
  footer?: React.ReactNode
}) {
  const [tab, setTab] = React.useState<string>(start)

  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <PrimaryTabs
          items={languages.map(({ code }) => ({
            id: code,
            label: `${LANGUAGE_NAMES[code]} persona`,
          }))}
          onValueChange={setTab}
          value={tab}
        >
          {languages.map(({ code, personaId }) => (
            <TabsContent
              className="motion-safe:data-active:animate-pane-in motion-reduce:animate-none"
              key={code}
              value={code}
            >
              <Field className="max-w-md">
                <FieldLabel htmlFor={`persona-${code}`}>Persona</FieldLabel>
                <PersonaPicker
                  id={`persona-${code}`}
                  language={code}
                  onChange={(next) =>
                    onLanguagesChange(
                      languages.map((l) =>
                        l.code === code ? { ...l, personaId: next } : l,
                      ),
                    )
                  }
                  value={personaId}
                />
              </Field>
            </TabsContent>
          ))}
        </PrimaryTabs>

        {languages.length > 1 ? (
          <>
            <Separator />
            <LanguageSwitchSetting
              config={config}
              invalid={invalid}
              languages={languages}
              onChange={onConfigChange}
              start={start}
            />
          </>
        ) : null}
      </CardContent>
      {footer ? (
        <CardFooter className="justify-end">{footer}</CardFooter>
      ) : null}
    </Card>
  )
}
