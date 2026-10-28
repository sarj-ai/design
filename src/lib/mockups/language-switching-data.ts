export type LanguageCode = "ar" | "en" | "ur"

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  ar: "Arabic",
  en: "English",
  ur: "Urdu",
}

export const RTL: Record<LanguageCode, boolean> = {
  ar: true,
  en: false,
  ur: true,
}

type Persona = {
  id: string
  name: string
  language: LanguageCode
}

export const PERSONAS: Persona[] = [
  {
    id: "abdullah",
    language: "ar",
    name: "عبدالله",
  },
  {
    id: "layla",
    language: "ar",
    name: "ليلى",
  },
  {
    id: "joseph",
    language: "en",
    name: "Joseph",
  },
  {
    id: "sarah",
    language: "en",
    name: "Sarah",
  },
]

export type ScenarioLanguage = {
  code: LanguageCode
  personaId: string | null
}

export type SwitchConfig = {
  switchVoice: boolean
  transitionPhrase: Partial<Record<LanguageCode, string>>
  target: Partial<Record<LanguageCode, string>>
  handoffPhrase: Partial<Record<LanguageCode, string>>
  transferSound: Partial<Record<LanguageCode, boolean>>
}

export type Preset = {
  id: string
  label: string
  scenario: string
  start: LanguageCode
  languages: ScenarioLanguage[]
  config: SwitchConfig
  draft?: SwitchConfig
}

const MIGRATED: SwitchConfig = {
  handoffPhrase: {},
  switchVoice: false,
  target: {},
  transferSound: {},
  transitionPhrase: {},
}

export const PRESETS: Preset[] = [
  {
    config: MIGRATED,
    id: "two",
    label: "Arabic and English",
    languages: [
      { code: "ar", personaId: "abdullah" },
      { code: "en", personaId: "joseph" },
    ],
    scenario: "Card dispute intake",
    start: "ar",
  },
  {
    config: MIGRATED,
    draft: {
      handoffPhrase: {
        en: "One moment, my colleague will continue with you in English.",
      },
      switchVoice: true,
      target: { en: "joseph" },
      transferSound: {},
      transitionPhrase: {},
    },
    id: "three",
    label: "Three languages",
    languages: [
      { code: "ar", personaId: "layla" },
      { code: "en", personaId: "sarah" },
      { code: "ur", personaId: null },
    ],
    scenario: "Delivery confirmation",
    start: "ar",
  },
  {
    config: MIGRATED,
    id: "one",
    label: "One language",
    languages: [{ code: "en", personaId: "sarah" }],
    scenario: "Order status",
    start: "en",
  },
]

export const TRANSITION_EXAMPLE: Record<LanguageCode, string> = {
  ar: "تمام، نكمل بالعربي.",
  en: "Sure, let's continue in English.",
  ur: "ٹھیک ہے، اردو میں بات کرتے ہیں۔",
}

export const HANDOFF_EXAMPLE: Record<LanguageCode, string> = {
  ar: "لحظة من فضلك، بحوّلك لزميلي يكمل معك بالعربي.",
  en: "One moment, my colleague will continue with you in English.",
  ur: "ایک لمحہ، میرا ساتھی اردو میں آپ کے ساتھ بات جاری رکھے گا۔",
}
