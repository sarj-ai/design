/**
 * Mock data for DES-198, voice cloning. The limits are the PRD's ("Voice
 * cloning on the platform", Taynam Alzamel), not the TTS contract's: the
 * contract accepts 25 MB and recommends 8–12 seconds, and the product caps
 * tighter on purpose — past 20 seconds latency and memory rise while quality
 * drops.
 */

export const SAMPLE_LIMITS = {
  minSeconds: 6,
  maxSeconds: 20,
  maxMegabytes: 10,
  formats: ["wav", "mp3", "flac", "ogg"],
} as const

/** What the reader reads aloud. The clone is built from the audio and a
 *  transcript of what was actually said, so this is a prompt, not the
 *  reference text. */
export const SCRIPT =
  "مرحباً بك في سرج. نحن هنا لمساعدتك في كل خطوة على الطريق. يسعدنا أن نستمع إليك، فتحدث بصوتك الطبيعي وبالسرعة التي تناسبك."

/** What transcription returns for a take: close to the script, not equal to
 *  it — the reader skipped a word, which is why the transcript is editable. */
export const TRANSCRIPT =
  "مرحباً بك في سرج. نحن هنا لمساعدتك في كل خطوة. يسعدنا أن نستمع إليك، فتحدث بصوتك الطبيعي وبالسرعة التي تناسبك."

/** The line the clone speaks on the preview step — new words, so the reader
 *  hears the voice say something they did not record. */
export const PREVIEW_LINE = "أهلاً وسهلاً، كيف أقدر أخدمك اليوم؟"

export type LanguageCode = "ar" | "en"
export type Gender = "female" | "male"

export const LANGUAGE_OPTIONS: { value: LanguageCode; label: string }[] = [
  { value: "ar", label: "Arabic" },
  { value: "en", label: "English" },
]

export const DIALECTS: Record<LanguageCode, string[]> = {
  ar: ["Saudi", "Gulf", "Egyptian", "Levantine", "Modern Standard"],
  en: ["American", "British"],
}

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
]

export type VoiceStatus = "active" | "inactive" | "pending"

export type Voice = {
  id: string
  name: string
  vibe: string | null
  provider: string
  language: LanguageCode
  gender: Gender
  status: VoiceStatus
  /** Cloned voices can be deleted by their owner; native ones never. */
  cloned: boolean
  /** Whose library it sits in. `sarj` and published is the catalog every
   *  organization sees; `org` is the viewer's own. */
  scope: "catalog" | "org"
  /** Personas speaking with it — a voice in use cannot be deleted. */
  usedBy: string[]
}

/** The catalog: Sarj's published voices, seen by every organization. */
const CATALOG: Voice[] = [
  {
    id: "nourah",
    name: "Nourah",
    vibe: null,
    provider: "Sarj Omni",
    language: "ar",
    gender: "female",
    status: "active",
    cloned: false,
    scope: "catalog",
    usedBy: [],
  },
  {
    id: "ibrahim",
    name: "Ibrahim",
    vibe: null,
    provider: "Sarj Omni",
    language: "ar",
    gender: "male",
    status: "active",
    cloned: false,
    scope: "catalog",
    usedBy: [],
  },
  {
    id: "hala",
    name: "Hala",
    vibe: "Warm, unhurried",
    provider: "ElevenLabs",
    language: "ar",
    gender: "female",
    status: "active",
    cloned: false,
    scope: "catalog",
    usedBy: [],
  },
  {
    id: "lama",
    name: "Lama",
    vibe: "Bright, quick",
    provider: "Hamsa",
    language: "ar",
    gender: "female",
    status: "active",
    cloned: false,
    scope: "catalog",
    usedBy: [],
  },
  {
    id: "nour",
    name: "Nour",
    vibe: null,
    provider: "Sarj Omni",
    language: "ar",
    gender: "male",
    status: "inactive",
    cloned: false,
    scope: "catalog",
    usedBy: [],
  },
  {
    id: "emma",
    name: "Emma",
    vibe: "Calm support",
    provider: "Cartesia",
    language: "en",
    gender: "female",
    status: "active",
    cloned: false,
    scope: "catalog",
    usedBy: [],
  },
]

/** A client organization's own clones. */
const CLIENT_OWN: Voice[] = [
  {
    id: "khalid",
    name: "Khalid",
    vibe: "Collections, firm",
    provider: "Sarj Omni",
    language: "ar",
    gender: "male",
    status: "active",
    cloned: true,
    scope: "org",
    usedBy: ["Collections reminder", "Late payment follow-up"],
  },
  {
    id: "reem",
    name: "Reem",
    vibe: "Front desk",
    provider: "Sarj Omni",
    language: "ar",
    gender: "female",
    status: "active",
    cloned: true,
    scope: "org",
    usedBy: [],
  },
]

/** Sarj's own clones — private to Sarj, one waiting on publish approval. */
const SARJ_OWN: Voice[] = [
  {
    id: "salem",
    name: "Salem",
    vibe: "Collections",
    provider: "Sarj Omni",
    language: "ar",
    gender: "male",
    status: "pending",
    cloned: true,
    scope: "org",
    usedBy: [],
  },
  {
    id: "reem",
    name: "Reem",
    vibe: "Front desk",
    provider: "Sarj Omni",
    language: "ar",
    gender: "female",
    status: "active",
    cloned: true,
    scope: "org",
    usedBy: ["Sales demo"],
  },
]

export type Viewer = "client" | "sarj"

export function voicesFor(viewer: Viewer): Voice[] {
  return [...(viewer === "sarj" ? SARJ_OWN : CLIENT_OWN), ...CATALOG]
}

/** The persona the picker is shown on. Its language and gender filter the
 *  voice cards, as `VoiceSelector` does on the platform. */
export const PERSONA = {
  name: "Noura",
  language: "ar" as LanguageCode,
  gender: "female" as Gender,
  voiceId: "nourah",
}

/** Outcomes a reviewer can force, so every state is reachable. */
export type SampleOutcome = "clean" | "noisy" | "fails"

export const OUTCOMES: { id: SampleOutcome; label: string }[] = [
  { id: "clean", label: "Clean sample" },
  { id: "noisy", label: "Noisy sample" },
  { id: "fails", label: "Cloning fails once" },
]
