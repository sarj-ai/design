export type Field = { id: string; label: string; multiline: boolean }

export type Version = {
  n: number
  author: string
  mine: boolean
  at: string
  editedFrom: number | null
  note: string | null
  body: Record<string, string>
}

export type InUseEntry = {
  n: number
  by: string
  at: string
  how: "saved" | "published" | "applied"
}

export type Subject = {
  name: string
  fields: Field[]
  /** Newest first. */
  versions: Version[]
  live: boolean
  inUse: number
  /** Newest first, so the first entry is the version in use now. */
  log: InUseEntry[]
  toggled: { by: string; at: string } | null
}

const SCENARIO_FIELDS: Field[] = [
  { id: "first-message", label: "First message", multiline: false },
  { id: "prompt", label: "Instruction prompt", multiline: true },
]

const GREETING_0 =
  "Hello, this is Sara from the branch team. Do you have two minutes for a short survey?"
const GREETING_A =
  "Hello {{name}}, this is Sara from the branch team. Do you have two minutes for a short survey?"
const GREETING_B =
  "Hello {{name}}, this is Sara from the branch team. Do you have a minute for a quick survey?"

const lines = (...rows: string[]) => rows.join("\n")

const INTRO =
  "You are a friendly voice assistant calling about a recent branch visit."
const CLOSE = "Thank the customer and end the call."
const RECORDING = "This call may be recorded for quality purposes."
const RETRY =
  "If the customer does not answer, ask once more, then thank them and end the call."

const PROMPT_5 = lines(INTRO, "Ask how the visit went.", CLOSE)
const PROMPT_6 = lines(INTRO, "Ask how the visit went.", RECORDING, CLOSE)
const PROMPT_7 = lines(
  INTRO,
  "Ask how the visit went and what could be better.",
  RECORDING,
  CLOSE,
)
const PROMPT_A = lines(
  INTRO,
  "Ask how the visit went and what could be better.",
  "Ask for a rating from 1 to 10.",
  RECORDING,
  CLOSE,
)
const PROMPT_B = lines(
  INTRO,
  "Ask how the visit went and what could be better.",
  "Ask for a rating from 1 to 10.",
  CLOSE,
)
const PROMPT_C = lines(
  INTRO,
  "Ask how the visit went and what could be better.",
  "Ask for a rating from 1 to 10.",
  RETRY,
  CLOSE,
)
const PROMPT_D = lines(
  INTRO,
  "Ask how the visit went and what could be better.",
  "Ask for a rating from 1 to 5, where 5 is excellent.",
  RETRY,
  CLOSE,
)
const PROMPT_E = lines(
  INTRO,
  "Ask how the visit went and what could be better.",
  "Ask for a rating from 1 to 5, where 5 is excellent.",
  "If the rating is 2 or lower, ask what went wrong and offer a callback from the branch manager.",
  RETRY,
  CLOSE,
)

function scenarioVersions(): Version[] {
  return [
    {
      n: 14,
      author: "You",
      mine: true,
      at: "Today, 14:02",
      editedFrom: 13,
      note: "Callback offer for low ratings",
      body: { "first-message": GREETING_B, prompt: PROMPT_E },
    },
    {
      n: 13,
      author: "Ahmad Khalil",
      mine: false,
      at: "Today, 11:40",
      editedFrom: 12,
      note: null,
      body: { "first-message": GREETING_B, prompt: PROMPT_D },
    },
    {
      n: 12,
      author: "Sami Rahman",
      mine: false,
      at: "Yesterday, 16:25",
      editedFrom: 11,
      note: "Ask again when there's no answer",
      body: { "first-message": GREETING_B, prompt: PROMPT_C },
    },
    {
      n: 11,
      author: "Nouf Al-Harbi",
      mine: false,
      at: "8 Oct, 10:12",
      editedFrom: 9,
      note: "Shorter greeting, recording notice removed",
      body: { "first-message": GREETING_B, prompt: PROMPT_B },
    },
    {
      n: 10,
      author: "You",
      mine: true,
      at: "2 Oct, 09:30",
      editedFrom: 9,
      note: null,
      body: { "first-message": GREETING_A, prompt: PROMPT_A },
    },
    {
      n: 9,
      author: "Nouf Al-Harbi",
      mine: false,
      at: "28 Sep, 15:04",
      editedFrom: 8,
      note: "Greet by name",
      body: { "first-message": GREETING_A, prompt: PROMPT_A },
    },
    {
      n: 8,
      author: "Sami Rahman",
      mine: false,
      at: "24 Sep, 11:18",
      editedFrom: 7,
      note: "Ask for a rating",
      body: { "first-message": GREETING_0, prompt: PROMPT_A },
    },
    {
      n: 7,
      author: "Sami Rahman",
      mine: false,
      at: "24 Sep, 10:55",
      editedFrom: 6,
      note: null,
      body: { "first-message": GREETING_0, prompt: PROMPT_7 },
    },
    {
      n: 6,
      author: "Nouf Al-Harbi",
      mine: false,
      at: "21 Sep, 09:40",
      editedFrom: 5,
      note: "Recording notice",
      body: { "first-message": GREETING_0, prompt: PROMPT_6 },
    },
    {
      n: 5,
      author: "Nouf Al-Harbi",
      mine: false,
      at: "20 Sep, 16:02",
      editedFrom: null,
      note: "First version",
      body: { "first-message": GREETING_0, prompt: PROMPT_5 },
    },
  ]
}

export const LIVE_SCENARIO: Subject = {
  name: "Branch visit survey",
  fields: SCENARIO_FIELDS,
  versions: scenarioVersions(),
  live: true,
  inUse: 12,
  log: [
    { n: 12, by: "Sami Rahman", at: "yesterday 16:40", how: "published" },
    { n: 11, by: "Nouf Al-Harbi", at: "8 Oct, 10:30", how: "published" },
    { n: 9, by: "Nouf Al-Harbi", at: "3 Oct, 08:15", how: "applied" },
    { n: 10, by: "You", at: "2 Oct, 09:45", how: "published" },
    { n: 9, by: "Nouf Al-Harbi", at: "28 Sep, 15:10", how: "published" },
  ],
  toggled: { by: "Nouf Al-Harbi", at: "28 Sep" },
}

export const TEST_SCENARIO: Subject = {
  name: "Branch visit survey (test)",
  fields: SCENARIO_FIELDS,
  versions: scenarioVersions(),
  live: false,
  inUse: 14,
  log: [{ n: 14, by: "You", at: "today 14:02", how: "saved" }],
  toggled: null,
}

export type CaseId =
  | "normal"
  | "conflict"
  | "save-fails"
  | "history-fails"
  | "view-only"
  | "no-live-permission"
  | "publish-fails"
  | "apply-blocked"
  | "apply-skips"

export const CASES: { id: CaseId; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "conflict", label: "Someone saves while you edit" },
  { id: "save-fails", label: "Save fails" },
  { id: "history-fails", label: "History fails to load" },
  { id: "view-only", label: "View only" },
  { id: "no-live-permission", label: "Can edit, can't turn live on or off" },
  { id: "publish-fails", label: "Publish fails" },
  { id: "apply-blocked", label: "Version uses something deleted" },
  { id: "apply-skips", label: "Version has a removed block" },
]

export const RIVAL: Omit<Version, "n" | "editedFrom" | "body"> = {
  author: "Ahmad Khalil",
  mine: false,
  at: "Today, 14:20",
  note: "Branch name in the greeting",
}

export const DELETED_REFERENCE = "the tool “Book callback”"
export const REMOVED_BLOCK = "Sentiment tags"

export const CONVERSATION = {
  scenario: LIVE_SCENARIO.name,
  version: 12,
  phoneNumber: "+966 55 012 4471",
  startedAt: "Today, 13:48",
}
