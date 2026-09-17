/** The moment being flagged: how far into which call. */
export const CALL = {
  id: "A1B2C3",
  timestamp: "02:14",
}

/**
 * The flag taxonomy approved in DIS-50, as the shared front-end / back-end type.
 *
 * A flag is one parent category plus any number of that parent's
 * subcategories — single-select on the parent so a flag routes to one team,
 * multi-select beneath it so one moment does not need three flags. The wire
 * values are snake_case to match the platform's existing `issue_type` strings.
 *
 * Order is the order DIS-50 lists them, which is also the order the pop-up
 * draws them.
 */
export const FLAG_CATEGORIES = [
  "stt",
  "tts",
  "llm",
  "latency",
  "conversation_flow_logic",
  "turn_taking",
  "gender_mismatch",
  "connectivity",
  "voicemail",
  "other",
] as const

export type FlagCategory = (typeof FLAG_CATEGORIES)[number]

/**
 * Subcategories, scoped to their parent.
 *
 * `stopped` appears under three parents and `stt` / `tts` / `llm` reappear
 * under latency, so a subcategory id means nothing alone: identity is the
 * pair, and nothing should ever store a subcategory without its category.
 */
export const FLAG_SUBCATEGORIES = {
  stt: [
    "missed_words",
    "non_arab_dialect",
    "incorrect_names_entities",
    "numbers_structured_data",
    "transcription",
    "stopped",
  ],
  tts: [
    "pronunciation_tashkeel",
    "pace_pauses",
    "style",
    "saudization",
    "stopped",
  ],
  llm: ["stopped", "response_templates"],
  latency: ["stt", "tts", "llm"],
  conversation_flow_logic: [],
  turn_taking: ["turn_detector", "backchanneler"],
  gender_mismatch: ["customer", "voice_persona_tts"],
  connectivity: [],
  voicemail: [],
  other: [],
} as const satisfies Record<FlagCategory, readonly string[]>

export type FlagSubcategory<C extends FlagCategory = FlagCategory> =
  (typeof FLAG_SUBCATEGORIES)[C][number]

/**
 * Whether a category needs a subcategory before the flag is complete.
 *
 * `optional` is latency only: DIS-50 keeps its subcategories optional because
 * the person flagging often cannot tell which stage the delay came from.
 * `none` is a category with nothing beneath it, complete on its own.
 */
export type SubcategoryRule = "required" | "optional" | "none"

export const FLAG_SUBCATEGORY_RULES: Record<FlagCategory, SubcategoryRule> = {
  stt: "required",
  tts: "required",
  llm: "required",
  latency: "optional",
  conversation_flow_logic: "none",
  turn_taking: "required",
  gender_mismatch: "required",
  connectivity: "none",
  voicemail: "none",
  other: "none",
}

/** A flag as it is submitted: the category decides which subcategories are legal. */
export type CallFlagSelection = {
  [C in FlagCategory]: { category: C; subcategories: FlagSubcategory<C>[] }
}[FlagCategory]

export const FLAG_CATEGORY_LABELS: Record<FlagCategory, string> = {
  stt: "STT",
  tts: "TTS",
  llm: "LLM",
  latency: "Latency",
  conversation_flow_logic: "Conversation flow / logic",
  turn_taking: "Turn-taking",
  gender_mismatch: "Gender mismatch",
  connectivity: "Connectivity",
  voicemail: "Voicemail",
  other: "Other",
}

export const FLAG_SUBCATEGORY_LABELS: {
  [C in FlagCategory]: Record<FlagSubcategory<C>, string>
} = {
  stt: {
    missed_words: "Missed words",
    non_arab_dialect: "Non-Arab dialect",
    incorrect_names_entities: "Incorrect names & entities",
    numbers_structured_data: "Numbers & structured data",
    transcription: "Transcription",
    stopped: "Stopped",
  },
  tts: {
    pronunciation_tashkeel: "Pronunciation / tashkeel",
    pace_pauses: "Pace / pauses",
    style: "Style",
    saudization: "Saudization",
    stopped: "Stopped",
  },
  llm: {
    stopped: "Stopped",
    response_templates: "Response templates",
  },
  latency: { stt: "STT", tts: "TTS", llm: "LLM" },
  conversation_flow_logic: {},
  turn_taking: {
    turn_detector: "Turn detector",
    backchanneler: "Backchanneler",
  },
  gender_mismatch: {
    customer: "Customer (misgendered)",
    voice_persona_tts: "Voice / persona / TTS (misgendering itself)",
  },
  connectivity: {},
  voicemail: {},
  other: {},
}

/**
 * The row that flags an `optional` category with no subcategory.
 *
 * Not an enum value: it submits the category with an empty `subcategories`
 * list. It exists so latency can be flagged by someone who cannot tell which
 * stage was slow, without a parent-level control the rest of the list lacks.
 */
export const UNSPECIFIED_SUBCATEGORY_LABEL = "Not sure"

/** Label lookup for a pair, since a subcategory id is only unique under its parent. */
export function subcategoryLabel(category: FlagCategory, id: string): string {
  const labels: Record<string, string> = FLAG_SUBCATEGORY_LABELS[category]
  return labels[id] ?? id
}

/** The flag the dialog opens on, as drawn in the design. */
export const INITIAL_FLAG: CallFlagSelection = {
  category: "stt",
  subcategories: ["missed_words", "non_arab_dialect"],
}
