export type Language = "ar" | "en"

const LANGUAGES: { id: Language; label: string }[] = [
  { id: "ar", label: "Arabic" },
  { id: "en", label: "English" },
]

export type Clip = {
  id: string
  label: string
}

export type Cue = Clip & {
  /** Share of playback. Every cue's weight in a config sums to 100. */
  weight: number
}

const APPROVED_CLIPS: Record<Language, Clip[]> = {
  ar: [
    { id: "ar-mmm", label: "ممم" },
    { id: "ar-aha", label: "أها" },
    { id: "ar-eh", label: "إيه" },
    { id: "ar-hmm", label: "همم" },
  ],
  en: [
    { id: "en-mmhmm", label: "mm-hmm" },
    { id: "en-uhhuh", label: "uh-huh" },
    { id: "en-mm", label: "mm" },
  ],
}

export type CueConfig = {
  cues: Cue[]
  /** Chance of playing a cue at each eligible moment, as a percentage. */
  frequency: number
  /** Seconds of continuous caller speech before the first cue is eligible. */
  startAfterSec: number
  /** Seconds between cues in the same turn. A failed roll does not consume it. */
  cooldownSec: number
  maxPerTurn: number
}

export const FREQUENCY_MIN = 5
export const FREQUENCY_STEP = 5
export const RECOMMENDED = { min: 20, max: 50 }

export const START_AFTER_OPTIONS = [5, 6, 7, 8, 10, 12]
export const COOLDOWN_OPTIONS = [5, 6, 7, 8, 10, 12]
export const MAX_PER_TURN_OPTIONS = [1, 2, 3, 4]

const DEFAULTS = {
  frequency: 35,
  startAfterSec: 7,
  cooldownSec: 8,
  maxPerTurn: 2,
}

export const GLOBAL_CONFIGS: Record<Language, CueConfig> = {
  ar: {
    ...DEFAULTS,
    cues: [
      { id: "ar-mmm", label: "ممم", weight: 50 },
      { id: "ar-aha", label: "أها", weight: 30 },
      { id: "ar-eh", label: "إيه", weight: 20 },
    ],
  },
  en: {
    ...DEFAULTS,
    cues: [
      { id: "en-mmhmm", label: "mm-hmm", weight: 60 },
      { id: "en-uhhuh", label: "uh-huh", weight: 40 },
    ],
  },
}

export const PERSONA = {
  name: "Aisha",
  language: "ar" as Language,
  description: "Emkan customer support",
}

export function personaOverride(
  globals: Record<Language, CueConfig>,
): Record<Language, CueConfig> {
  return {
    ar: { ...globals.ar, cues: [...globals.ar.cues] },
    en: { ...globals.en, cues: [...globals.en.cues] },
  }
}

/* Weights always total 100. They stay exact and are rounded only for display, so repeated edits do not drift. */

function rescale(cues: Cue[], total: number): Cue[] {
  const current = cues.reduce((sum, cue) => sum + cue.weight, 0)

  if (current === 0) {
    return cues.map((cue) => ({ ...cue, weight: total / cues.length }))
  }

  return cues.map((cue) => ({ ...cue, weight: (cue.weight / current) * total }))
}

export function setWeight(cues: Cue[], id: string, next: number): Cue[] {
  if (cues.length === 1) return cues.map((cue) => ({ ...cue, weight: 100 }))

  const weight = Math.min(100, Math.max(0, next))
  const others = rescale(
    cues.filter((cue) => cue.id !== id),
    100 - weight,
  )

  return cues.map((cue) =>
    cue.id === id
      ? { ...cue, weight }
      : (others.find((other) => other.id === cue.id) ?? cue),
  )
}

export function addCue(cues: Cue[], clip: Clip): Cue[] {
  const share = 100 / (cues.length + 1)
  return [...rescale(cues, 100 - share), { ...clip, weight: share }]
}

export function removeCue(cues: Cue[], id: string): Cue[] {
  return rescale(
    cues.filter((cue) => cue.id !== id),
    100,
  )
}

/** Largest-remainder rounding, so the displayed whole percentages still sum to 100. */
export function displayWeights(cues: Cue[]): number[] {
  const floors = cues.map((cue) => Math.floor(cue.weight))
  const spare = 100 - floors.reduce((sum, value) => sum + value, 0)

  const order = cues
    .map((cue, index) => ({ index, remainder: cue.weight - floors[index] }))
    .sort((a, b) => b.remainder - a.remainder)
    .slice(0, Math.max(0, spare))
    .map((entry) => entry.index)

  return floors.map((value, index) => value + (order.includes(index) ? 1 : 0))
}

/** The whole approved set, flagged by membership — not just the clips left over. */
export function approvedClips(
  language: Language,
  cues: Cue[],
): { clip: Clip; inMix: boolean }[] {
  const taken = new Set(cues.map((cue) => cue.id))
  return APPROVED_CLIPS[language].map((clip) => ({
    clip,
    inMix: taken.has(clip.id),
  }))
}

export function languageLabel(language: Language): string {
  return LANGUAGES.find((entry) => entry.id === language)?.label ?? language
}
