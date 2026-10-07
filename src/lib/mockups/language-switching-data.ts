/**
 * Mock data for DES-199 — the scenario's "Switch voice on language change"
 * setting from the DIS-53 PRD.
 *
 * Languages are the platform's three (EN, AR, UR — `LANGUAGES` in
 * precedent-iso). Personas are agent profiles: one language each, which is the
 * premise of the PRD — a voice is strong in one language, not both.
 */

export type LanguageCode = "ar" | "en" | "ur"

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  ar: "Arabic",
  en: "English",
  ur: "Urdu",
}

/** Arabic and Urdu are typed right to left. */
export const RTL: Record<LanguageCode, boolean> = {
  ar: true,
  en: false,
  ur: true,
}

export type Persona = {
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

/** One configured language, with the persona a call that starts in it uses. */
export type ScenarioLanguage = {
  code: LanguageCode
  personaId: string | null
}

/** Per language switched to. Phrases are optional; a handoff target is not. */
export type SwitchConfig = {
  /** OFF — continuity. ON — handoff. */
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
  /** What is saved. */
  config: SwitchConfig
  /** An edit already in progress when the preset opens. */
  draft?: SwitchConfig
}

/** What every existing multi-language scenario migrates to: continuity, no phrase. */
export const MIGRATED: SwitchConfig = {
  handoffPhrase: {},
  switchVoice: false,
  target: {},
  transferSound: {},
  transitionPhrase: {},
}

/**
 * The reviewer's three scenarios. Each is a different shape of the same
 * screen, not a different screen: two languages, three languages with no
 * Urdu persona yet, and one language, where the setting has nothing to act on.
 */
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
    /* The owner has just turned handoff on and picked English, and has no
       Urdu persona to pick — so Save is one click from being blocked. */
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

/** Examples of the shape, shown as placeholders — gone on the first keystroke. */
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
