export type PersonaLanguage = "Arabic" | "English"
export type PersonaGender = "Male" | "Female"

export const LANGUAGES: PersonaLanguage[] = ["Arabic", "English"]
export const GENDERS: PersonaGender[] = ["Male", "Female"]

export type Voice = {
  id: string
  /** Display name, in the voice's own language. */
  name: string
  /** The three-word vibe line under the name. */
  vibe: string
}

/** The voices this persona's language and gender resolve to, in library order. */
export const VOICES: Voice[] = [
  {
    id: "khalid-base",
    name: "خالد الأساسي",
    vibe: "warm, confident, measured",
  },
  { id: "sara", name: "سارة", vibe: "friendly, articulate" },
  {
    id: "faisal-fast",
    name: "فيصل السريع",
    vibe: "quick, efficient, low-latency",
  },
]

/** The persona the dialog opens on. */
export const PERSONA = {
  name: "Support Agent — خالد",
  initial: "خ",
  language: "Arabic" as PersonaLanguage,
  gender: "Male" as PersonaGender,
  isDefault: true,
  voiceId: "khalid-base",
  prompt:
    "أنت خالد، موظف دعم من شركة سرج. أسلوبك هادئ ومباشر، وتستخدم لهجة نجدية بسيطة. ترحب بالعميل بحرارة وتدخل بالموضوع بسرعة.",
  fillerWords: true,
  backgroundNoise: false,
  endCallOnSilence: true,
  silenceSeconds: "15",
  maxRetries: "",
}

export type PronunciationTerm = {
  id: string
  /** The word as it appears in the prompt or the caller's speech. */
  word: string
  /** The fully vowelled spelling the TTS reads instead. */
  replacement: string
}

/** Ten support-desk terms, each with the tashkeel the TTS needs. */
export const PRONUNCIATION_TERMS: PronunciationTerm[] = [
  { id: "t1", word: "المبالغ", replacement: "الْمَبَالِغ" },
  { id: "t2", word: "سرج", replacement: "سَرْج" },
  { id: "t3", word: "الفاتورة", replacement: "الْفَاتُورَة" },
  { id: "t4", word: "التأمين", replacement: "التَّأْمِين" },
  { id: "t5", word: "الاشتراك", replacement: "الِاشْتِرَاك" },
  { id: "t6", word: "الرصيد", replacement: "الرَّصِيد" },
  { id: "t7", word: "الحجز", replacement: "الْحَجْز" },
  { id: "t8", word: "استرداد", replacement: "اِسْتِرْدَاد" },
  { id: "t9", word: "المستحقات", replacement: "الْمُسْتَحَقَّات" },
  { id: "t10", word: "التفعيل", replacement: "التَّفْعِيل" },
]
