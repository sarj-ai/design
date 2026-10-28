export const CALL = {
  id: "A1B2C3",
  timestamp: "02:14",
}

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

/** Subcategory ids repeat across parents: identity is the (category, id) pair, never the id alone. */
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

type FlagSubcategory<C extends FlagCategory = FlagCategory> =
  (typeof FLAG_SUBCATEGORIES)[C][number]

type SubcategoryRule = "required" | "optional" | "none"

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

type CallFlagSelection = {
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

const FLAG_SUBCATEGORY_LABELS: {
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

/** Not an enum value: submits the category with an empty `subcategories` list. */
export const UNSPECIFIED_SUBCATEGORY_LABEL = "Not sure"

export function subcategoryLabel(category: FlagCategory, id: string): string {
  const labels: Record<string, string> = FLAG_SUBCATEGORY_LABELS[category]
  return labels[id] ?? id
}

export const INITIAL_FLAG: CallFlagSelection = {
  category: "stt",
  subcategories: ["missed_words", "non_arab_dialect"],
}
