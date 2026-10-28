export type SampleLanguage = "ar" | "en"

/** First strong character wins, which is the rule `dir="auto"` itself uses. */
const STRONG_RTL =
  /[\u0590-\u05ff\u0600-\u06ff\u0700-\u08ff\ufb1d-\ufdff\ufe70-\ufeff]/
const STRONG_LTR = /[a-z\u00c0-\u024f]/i

/** Resolved here, not via `dir="auto"`: Tailwind's `rtl:` variant matches the literal `[dir=rtl]` attribute, which `auto` never is. */
export function textDirection(...values: string[]): "ltr" | "rtl" {
  for (const value of values) {
    for (const character of value) {
      if (STRONG_RTL.test(character)) return "rtl"
      if (STRONG_LTR.test(character)) return "ltr"
    }
  }
  return "ltr"
}

export type Mapping = {
  id: string
  triggers: string[]
  response: string
}

export type FillerConfig = {
  fillers: string[]
  fillersEnabled: boolean
  /** How often a generic filler plays, 0–1. Mapped responses ignore it. */
  frequency: number
  mappings: Mapping[]
  mappingsEnabled: boolean
}

export const MAX_MAPPINGS = 50
export const MAX_TRIGGERS = 10
export const TRIGGER_MAX_CHARS = 100
export const RESPONSE_MAX_CHARS = 80

/** Applied to triggers only — never to responses, whose diacritics drive pronunciation. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ً-ْٰ]/g, "") /* diacritics */
    .replace(/ـ/g, "") /* tatweel */
    .replace(/[آأإٱ]/g, "ا") /* alef forms */
    .replace(/ى/g, "ي") /* alif maqsura */
    .replace(/[^\p{L}\p{N}\s]/gu, "") /* punctuation */
    .replace(/\s+/g, " ")
    .trim()
}

export type Conflict = {
  phrase: string
  mappingIds: string[]
}

export function findConflicts(mappings: Mapping[]): Conflict[] {
  const claims = new Map<string, string[]>()

  for (const mapping of mappings) {
    for (const trigger of mapping.triggers) {
      const phrase = normalize(trigger)
      if (!phrase) continue

      const owners = claims.get(phrase) ?? []
      if (!owners.includes(mapping.id)) owners.push(mapping.id)
      claims.set(phrase, owners)
    }
  }

  return [...claims.entries()]
    .filter(([, mappingIds]) => mappingIds.length > 1)
    .map(([phrase, mappingIds]) => ({ phrase, mappingIds }))
}

export function isContested(trigger: string, conflicts: Conflict[]): boolean {
  const phrase = normalize(trigger)
  return conflicts.some((conflict) => conflict.phrase === phrase)
}

export function problems(config: FillerConfig): string[] {
  const found: string[] = []

  if (!config.mappingsEnabled) return found

  const emptyResponse = config.mappings.filter(
    (mapping) => !mapping.response.trim(),
  ).length
  if (emptyResponse) {
    found.push(
      emptyResponse === 1
        ? "One mapping has no response"
        : `${emptyResponse} mappings have no response`,
    )
  }

  const noTriggers = config.mappings.filter(
    (mapping) => !mapping.triggers.length,
  ).length
  if (noTriggers) {
    found.push(
      noTriggers === 1
        ? "One mapping has no caller phrase"
        : `${noTriggers} mappings have no caller phrase`,
    )
  }

  const longResponse = config.mappings.filter(
    (mapping) => mapping.response.length > RESPONSE_MAX_CHARS,
  ).length
  if (longResponse) {
    found.push(
      longResponse === 1
        ? "One response is over the character limit"
        : `${longResponse} responses are over the character limit`,
    )
  }

  const conflicts = findConflicts(config.mappings)
  if (conflicts.length) {
    found.push(
      conflicts.length === 1
        ? "Two mappings claim the same phrase"
        : `${conflicts.length} phrases are claimed by two mappings`,
    )
  }

  return found
}

export type PreviewVoice = {
  name: string
}

export const PERSONA = {
  name: "Aisha",
  description: "Emkan customer support",
  voice: { name: "Salma" } satisfies PreviewVoice,
}

export const GLOBAL_VOICE: PreviewVoice = { name: "Nourah" }

export const SAMPLE_CONFIG: Record<SampleLanguage, FillerConfig> = {
  ar: {
    fillers: ["حاضر", "طيب", "تمام"],
    fillersEnabled: true,
    frequency: 0.6,
    mappingsEnabled: true,
    mappings: [
      {
        id: "m-salam",
        triggers: ["السلام عليكم", "سلام عليكم", "سلام"],
        response: "وَعَلَيْكُمُ السَّلَام",
      },
      {
        id: "m-ack",
        triggers: ["تمام", "طيب", "حاضر"],
        response: "حاضر، تم",
      },
      {
        id: "m-thanks",
        triggers: ["شكرا", "شكراً"],
        response: "العفو",
      },
    ],
  },
  en: {
    fillers: ["sure", "right", "okay"],
    fillersEnabled: true,
    frequency: 0.6,
    mappingsEnabled: true,
    mappings: [
      {
        id: "m-salam",
        triggers: ["good morning", "morning", "hello"],
        response: "Good morning to you",
      },
      {
        id: "m-ack",
        triggers: ["okay", "right", "sure"],
        response: "Got it, one moment",
      },
      {
        id: "m-thanks",
        triggers: ["thank you", "thanks"],
        response: "You're very welcome",
      },
    ],
  },
}

let created = 0

export function newMapping(): Mapping {
  created += 1
  return { id: `m-new-${created}`, triggers: [], response: "" }
}

/** A full copy of the globals, never a merge. */
export function personaOverride(globals: FillerConfig): FillerConfig {
  return {
    fillers: [...globals.fillers],
    fillersEnabled: globals.fillersEnabled,
    frequency: globals.frequency,
    mappings: globals.mappings.map((mapping) => ({
      ...mapping,
      triggers: [...mapping.triggers],
    })),
    mappingsEnabled: globals.mappingsEnabled,
  }
}
