/**
 * Configurable phrase-response mappings for the Post-Turn Bridge — DIS-21 /
 * DES-171.
 *
 * The PRD's limits are kept: up to 50 mappings per scope, 10 trigger phrases
 * each at 100 characters, one response at 80, and identical normalised
 * triggers barred from two rules in the same scope.
 *
 * Three of the PRD's fields are deliberately NOT here — within-utterance
 * matching, manual priority, and a per-rule enabled flag. All three were cut
 * in review (Fatma, Aug 2026) and each one is argued where it used to live.
 */

/**
 * Matching is whole-utterance only.
 *
 * Review, Fatma, Aug 2026: within-utterance was dropped. With whole-utterance
 * the only mode, an utterance matches at most one rule — which is what makes
 * everything below simpler. See the priority note on `Mapping`.
 */

/**
 * Which language the sample data is written in.
 *
 * A reviewer control, not a product setting — the feature is language-agnostic
 * and the screen has no language switch. Arabic is the real case the PRD is
 * written for: tashkeel is why a response is stored verbatim, and RTL is why
 * the collapsed row has to resolve its own direction. English exists so a
 * reviewer who does not read Arabic can still judge the layout.
 */
export type SampleLanguage = "ar" | "en"

/* ------------------------------------------------------------------------- *
 * Direction
 * ------------------------------------------------------------------------- */

/** First strong character wins, which is the rule `dir="auto"` itself uses. */
const STRONG_RTL =
  /[\u0590-\u05ff\u0600-\u06ff\u0700-\u08ff\ufb1d-\ufdff\ufe70-\ufeff]/
const STRONG_LTR = /[a-z\u00c0-\u024f]/i

/**
 * The paragraph direction of a run of text, resolved here rather than left to
 * `dir="auto"`.
 *
 * `dir="auto"` gets the text laid out correctly on its own — but the attribute
 * it leaves in the DOM is the literal string `auto`, and Tailwind's `rtl:`
 * variant compiles to `:lang(ar, he, …), [dir=rtl], [dir=rtl] *`. No `:dir()`,
 * so an attribute selector is matching the written value and `auto` is not
 * `rtl`. Anything that has to *mirror* with the text — an arrow between a
 * caller phrase and its response — therefore needs the resolved direction
 * written out.
 *
 * Values are checked in order, so a mapping with no phrase yet still takes its
 * direction from the response.
 */
export function textDirection(...values: string[]): "ltr" | "rtl" {
  for (const value of values) {
    for (const character of value) {
      if (STRONG_RTL.test(character)) return "rtl"
      if (STRONG_LTR.test(character)) return "ltr"
    }
  }
  return "ltr"
}

/**
 * One rule: some caller phrases, and the one thing the agent says back.
 *
 * **No priority.** It was a number the reader had to set and could not
 * interpret — and once matching is whole-utterance only it decides nothing,
 * because a trigger belongs to exactly one rule (`findConflicts` bars the
 * overlap) and an utterance therefore matches at most one rule. Ordering a set
 * of rules that cannot collide is asking for a decision with no consequence.
 *
 * **No enabled flag.** Delete is the only way out. Pausing a rule was a second
 * state to design, to explain and to read at a glance, in exchange for saving
 * the reader from retyping two phrases.
 */
export type Mapping = {
  id: string
  /** Caller phrases that select this mapping. Normalised before matching. */
  triggers: string[]
  /** What the agent plays back, passed to speech rendering exactly as typed. */
  response: string
}

/**
 * One scope's acknowledgment configuration — the drawer edits exactly this.
 *
 * The two halves switch independently. They are two different behaviours that
 * happen to fire at the same moment: a client may want exact answers to a
 * handful of greetings and no random filler at all, or the reverse. One switch
 * over both of them made those the same choice.
 */
export type FillerConfig = {
  /** The generic filler words that already exist today. */
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

/* ------------------------------------------------------------------------- *
 * Matching
 * ------------------------------------------------------------------------- */

/**
 * The PRD's trigger normalisation, and only ever applied to triggers.
 *
 * Two people typing the same greeting will not type the same characters —
 * diacritics, tatweel, a hamza on the alef, a final ya or alif maqsura, a
 * stray question mark. Matching folds all of that away so a caller is not
 * missed over an orthography choice.
 *
 * The response is deliberately never passed through here. Its diacritics are
 * the reason this feature exists: they are what makes the voice pronounce the
 * acknowledgment the way it was written.
 */
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
  /** The normalised phrase more than one rule claims. */
  phrase: string
  /** The rules that claim it, in the order they are listed. */
  mappingIds: string[]
}

/**
 * Triggers claimed by more than one rule.
 *
 * This is the rule that makes priority unnecessary: a phrase belongs to one
 * mapping or the design blocks publishing, so nothing has to decide which of
 * two rules wins.
 */
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

/** Whether this mapping's trigger is one of the contested phrases. */
export function isContested(trigger: string, conflicts: Conflict[]): boolean {
  const phrase = normalize(trigger)
  return conflicts.some((conflict) => conflict.phrase === phrase)
}

/* ------------------------------------------------------------------------- *
 * Validation
 *
 * The PRD blocks publishing on empty or over-limit required fields and keeps
 * the input on screen — so these are reasons the footer's Done is unavailable,
 * never a cue to discard what was typed.
 * ------------------------------------------------------------------------- */

export function problems(config: FillerConfig): string[] {
  const found: string[] = []

  /* A half that is switched off cannot block publishing. An unfinished mapping
     under a switch that is off is a draft, not an error — and blocking Done on
     it would leave the reader unable to save the very change that made it
     harmless. */
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

/* ------------------------------------------------------------------------- *
 * Mock data
 * ------------------------------------------------------------------------- */

/**
 * The voice a scope's responses are heard in.
 *
 * Tashkeel is a hint to a speech engine, not a guarantee: the same vowelled
 * word does not come out the same on every voice. So the preview names the
 * voice it just used, on the play button rather than in a line of help.
 *
 * The voice, and not the engine behind it. Review, Fatma, Aug 2026: the
 * platform does not put a vendor's name on a product surface, and the reader
 * is choosing between voices anyway, never between providers.
 */
export type PreviewVoice = {
  name: string
}

/** The persona the override journey is shown on. */
export const PERSONA = {
  name: "Aisha",
  description: "Emkan customer support",
  /* What Aisha actually speaks with, so her preview is the real thing. */
  voice: { name: "Salma" } satisfies PreviewVoice,
}

/**
 * Global settings has no one voice — every persona inherits these mappings and
 * speaks them in whatever voice it is set to. The preview picks the default new
 * personas start on, and names it so the reader knows what they just heard.
 */
export const GLOBAL_VOICE: PreviewVoice = { name: "Nourah" }

/**
 * The global defaults every persona inherits until it saves an override, one
 * set per sample language.
 *
 * The Arabic greeting carries its diacritics, because that is the case the PRD
 * is written for. In both languages the acknowledgment words appear as generic
 * fillers *and* as triggers on mapping 2 on purpose: a mapped response beats
 * the generic frequency roll, so those two rows are the two halves of that
 * rule. The English set mirrors the Arabic one row for row — same match modes,
 * same priorities, same third rule turned off — so switching language changes
 * what the words say and nothing about what the screen is showing.
 */
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

/** A new, deliberately incomplete mapping — the reader fills it in. */
export function newMapping(): Mapping {
  created += 1
  return { id: `m-new-${created}`, triggers: [], response: "" }
}

/** A persona's own set, once it stops inheriting. A full copy, never a merge. */
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
