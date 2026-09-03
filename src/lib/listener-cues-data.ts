/**
 * Mid-turn listener cues — DIS-63 / DES-172.
 *
 * Every default here is the PRD's: 35% response frequency adjustable 5–100 in
 * 5-point steps with 20–50% recommended, 7 seconds of continuous caller speech
 * before the first cue, an 8-second cooldown, and at most 2 cues per turn.
 * Cue weights always total 100% and rebalance proportionally.
 */

export type Language = "ar" | "en"

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: "ar", label: "Arabic" },
  { id: "en", label: "English" },
]

/** A saved clip approved for one language. Cues are never generated in V1. */
export type Clip = {
  id: string
  label: string
}

/** An approved clip that is in the mix, with its share of playback. */
export type Cue = Clip & {
  /** Share of playback. Every cue's weight in a config sums to 100. */
  weight: number
}

/**
 * Approved cues are configured per language, so a language with none cannot
 * run listener cues at all — the mix is not a global list filtered by language.
 */
export const APPROVED_CLIPS: Record<Language, Clip[]> = {
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

/** The global defaults every persona inherits until it saves an override. */
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

/**
 * The persona the override journey is shown on.
 *
 * `language` is the approved set the panel opens on, not a language the persona
 * is locked to: cues are approved per language everywhere, so a persona
 * overrides them per language too.
 */
export const PERSONA = {
  name: "Aisha",
  language: "ar" as Language,
  description: "Emkan customer support",
}

/** A persona's own values, per language, once it stops inheriting. */
export function personaOverride(
  globals: Record<Language, CueConfig>,
): Record<Language, CueConfig> {
  return {
    ar: { ...globals.ar, cues: [...globals.ar.cues] },
    en: { ...globals.en, cues: [...globals.en.cues] },
  }
}

/** The voices this persona picks between — the row listener cues sits under. */
export const VOICES = [
  { id: "v-nourah", name: "Nourah" },
  { id: "v-aisha", name: "Aisha" },
  { id: "v-salma", name: "Salma" },
]

/* ------------------------------------------------------------------------- *
 * Weights
 *
 * The percentages are the contract: they always total 100, and moving one
 * rebalances the rest in proportion to the shares they already had. Kept as
 * exact numbers here and rounded only for display, so repeated edits do not
 * accumulate error.
 * ------------------------------------------------------------------------- */

function rescale(cues: Cue[], total: number): Cue[] {
  const current = cues.reduce((sum, cue) => sum + cue.weight, 0)

  /* Nothing to be proportional to — split what is left evenly instead. */
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

/**
 * Whole percentages that still add up to 100.
 *
 * Rounding each weight on its own gives 33/33/33, and a mix that reads as 99%
 * makes the "Total 100%" badge look like a lie. The largest remainders take the
 * spare points instead.
 */
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

/**
 * The whole approved set for this language, each clip flagged with whether it
 * is already in the mix.
 *
 * Deliberately not "the clips you have left". Filtering the taken ones out left
 * the picker holding one stray word once most of the set was in the mix, which
 * read as a text field's suggestion rather than as a closed list of approved
 * clips. The set is the point, so the set is what gets returned.
 */
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
