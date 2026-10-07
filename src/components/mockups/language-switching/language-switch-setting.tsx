"use client"

import * as React from "react"

import { PersonaPicker } from "@/components/mockups/language-switching/persona-picker"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  HANDOFF_EXAMPLE,
  LANGUAGE_NAMES,
  RTL,
  TRANSITION_EXAMPLE,
  type LanguageCode,
  type ScenarioLanguage,
  type SwitchConfig,
} from "@/lib/mockups/language-switching-data"
import { cn } from "@/lib/utils"

/**
 * "Switch voice on language change" — one setting per scenario (DIS-53).
 *
 * Off: an optional transition phrase per language. On: per language other
 * than the start one, a persona (required), a handoff phrase and a transfer
 * sound (on by default). Both sets are always on screen; the switch decides
 * which one is live, and the other is greyed out and disabled.
 */
export function LanguageSwitchSetting({
  config,
  invalid,
  languages,
  onChange,
  start,
}: {
  config: SwitchConfig
  /** Languages whose target failed the last save. Live after that. */
  invalid: Set<LanguageCode>
  languages: ScenarioLanguage[]
  onChange: (next: SwitchConfig) => void
  start: LanguageCode
}) {
  const patch = <K extends keyof SwitchConfig>(
    key: K,
    value: SwitchConfig[K],
  ) => onChange({ ...config, [key]: value })

  const switchedTo = languages.filter((l) => l.code !== start)
  const handoffOff = !config.switchVoice
  const continuityOff = config.switchVoice

  return (
    <FieldGroup className="gap-6">
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="switch-voice">
            Switch voice on language change
          </FieldLabel>
          <FieldDescription>
            Off keeps the current voice. On hands the call to a persona for the
            new language.
          </FieldDescription>
        </FieldContent>
        <Switch
          checked={config.switchVoice}
          id="switch-voice"
          onCheckedChange={(switchVoice) => patch("switchVoice", switchVoice)}
        />
      </Field>

      {/* Both sets stay on screen. The one the switch is not on is greyed
          out and disabled — one read-only language, no caption. */}
      <FieldSet disabled={continuityOff}>
        <FieldLegend
          className={cn(continuityOff && "opacity-50")}
          variant="label"
        >
          Transition phrase{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </FieldLegend>
        <div className="grid gap-6 md:grid-cols-2">
          {languages.map(({ code }) => (
            <Field data-disabled={continuityOff} key={code}>
              <FieldLabel htmlFor={`transition-${code}`}>
                Switching to {LANGUAGE_NAMES[code]}
              </FieldLabel>
              <Input
                dir={RTL[code] ? "rtl" : "ltr"}
                disabled={continuityOff}
                id={`transition-${code}`}
                onChange={(event) =>
                  patch("transitionPhrase", {
                    ...config.transitionPhrase,
                    [code]: event.target.value,
                  })
                }
                placeholder={TRANSITION_EXAMPLE[code]}
                value={config.transitionPhrase[code] ?? ""}
              />
            </Field>
          ))}
        </div>
      </FieldSet>

      {switchedTo.map(({ code }) => {
        const failed = invalid.has(code) && !config.target[code]

        return (
          <React.Fragment key={code}>
            {/* Outside the fieldset: a browser always draws <legend> first. */}
            <FieldSeparator />
            <FieldSet disabled={handoffOff}>
              <FieldLegend
                className={cn("font-semibold", handoffOff && "opacity-50")}
                variant="label"
              >
                Switching to {LANGUAGE_NAMES[code]}
              </FieldLegend>
              <div className="grid gap-6 md:grid-cols-2">
                {/* No data-invalid: the label does not turn red. */}
                <Field data-disabled={handoffOff}>
                  <FieldLabel htmlFor={`target-${code}`}>Persona</FieldLabel>
                  {failed ? (
                    <FieldError>
                      Choose a persona for {LANGUAGE_NAMES[code]}.
                    </FieldError>
                  ) : null}
                  <PersonaPicker
                    disabled={handoffOff}
                    id={`target-${code}`}
                    invalid={failed}
                    language={code}
                    onChange={(personaId) =>
                      patch("target", { ...config.target, [code]: personaId })
                    }
                    value={config.target[code] ?? null}
                  />
                </Field>
                <Field data-disabled={handoffOff}>
                  <FieldLabel htmlFor={`handoff-${code}`}>
                    Handoff phrase{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FieldLabel>
                  <Input
                    dir={RTL[code] ? "rtl" : "ltr"}
                    disabled={handoffOff}
                    id={`handoff-${code}`}
                    onChange={(event) =>
                      patch("handoffPhrase", {
                        ...config.handoffPhrase,
                        [code]: event.target.value,
                      })
                    }
                    placeholder={HANDOFF_EXAMPLE[code]}
                    value={config.handoffPhrase[code] ?? ""}
                  />
                </Field>
              </div>
              <Field data-disabled={handoffOff} orientation="horizontal">
                <FieldLabel htmlFor={`sound-${code}`}>
                  Transfer sound
                </FieldLabel>
                <Switch
                  checked={config.transferSound[code] ?? true}
                  disabled={handoffOff}
                  id={`sound-${code}`}
                  onCheckedChange={(on) =>
                    patch("transferSound", {
                      ...config.transferSound,
                      [code]: on,
                    })
                  }
                />
              </Field>
            </FieldSet>
          </React.Fragment>
        )
      })}
    </FieldGroup>
  )
}
