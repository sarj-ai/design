/**
 * Mock data for DES-202, configuration versioning. The model is the
 * "Configuration versioning" requirements doc (Taynam Alzamel):
 *
 *  - One shared timeline per item; versions are immutable, never deleted.
 *  - A version is made only by a save, and records the version it was edited
 *    from — usually the one before, the earlier one after "Edit from here".
 *  - A live scenario and the global prompt carry a marker: the version
 *    callers hear. Saving does not move it; publishing does. Rollback is
 *    moving it back, and makes no version.
 *  - A not-live scenario has no marker: its newest version is what runs.
 *
 * Decided with Vansh on 12 Oct 2026, for the handoff: a scenario is versioned
 * as one item. One save is one version number for the whole scenario; the
 * summary says which parts changed.
 */

export type Field = { id: string; label: string; multiline: boolean }

export type Version = {
  n: number
  author: string
  /** The viewer's own, for the "Only mine" filter. */
  mine: boolean
  at: string
  editedFrom: number | null
  /** Null while it is still being written; "failed" if generation gave up. */
  summary: string | null | "failed"
  /** Has the marker ever pointed here. */
  everLive: boolean
  body: Record<string, string>
}

export type Subject = {
  kind: "scenario" | "global"
  name: string
  fields: Field[]
  versions: Version[]
  /** The version callers hear; null on a not-live scenario. */
  marker: number | null
  published: { by: string; at: string } | null
}

/* -------------------------------------------------------------- scenario */

const SCENARIO_FIELDS: Field[] = [
  { id: "first-message", label: "First message", multiline: false },
  { id: "prompt", label: "Instruction prompt", multiline: true },
]

const GREETING_A =
  "Hello {{name}}, this is Sara from the branch team. Do you have two minutes for a short survey?"
const GREETING_B =
  "Hello {{name}}, this is Sara from the branch team. Do you have a minute for a quick survey?"

const PROMPT_A = [
  "You are a friendly voice assistant calling about a recent branch visit.",
  "Ask how the visit went and what could be better.",
  "Ask for a rating from 1 to 10.",
  "This call may be recorded for quality purposes.",
  "Thank the customer and end the call.",
].join("\n")

const PROMPT_B = [
  "You are a friendly voice assistant calling about a recent branch visit.",
  "Ask how the visit went and what could be better.",
  "Ask for a rating from 1 to 10.",
  "Thank the customer and end the call.",
].join("\n")

const PROMPT_C = [
  "You are a friendly voice assistant calling about a recent branch visit.",
  "Ask how the visit went and what could be better.",
  "Ask for a rating from 1 to 10.",
  "If the customer does not answer, ask once more, then thank them and end the call.",
  "Thank the customer and end the call.",
].join("\n")

const PROMPT_D = [
  "You are a friendly voice assistant calling about a recent branch visit.",
  "Ask how the visit went and what could be better.",
  "Ask for a rating from 1 to 5, where 5 is excellent.",
  "If the customer does not answer, ask once more, then thank them and end the call.",
  "Thank the customer and end the call.",
].join("\n")

const PROMPT_E = [
  "You are a friendly voice assistant calling about a recent branch visit.",
  "Ask how the visit went and what could be better.",
  "Ask for a rating from 1 to 5, where 5 is excellent.",
  "If the rating is 2 or lower, ask what went wrong and offer a callback from the branch manager.",
  "If the customer does not answer, ask once more, then thank them and end the call.",
  "Thank the customer and end the call.",
].join("\n")

function scenarioVersions(): Version[] {
  return [
    {
      n: 14,
      author: "You",
      mine: true,
      at: "Today, 14:02",
      editedFrom: 13,
      summary:
        "Instruction prompt: offers a callback from the branch manager when the rating is 2 or lower.",
      everLive: false,
      body: { "first-message": GREETING_B, prompt: PROMPT_E },
    },
    {
      n: 13,
      author: "Ahmad Khalil",
      mine: false,
      at: "Today, 11:40",
      editedFrom: 12,
      summary:
        "Instruction prompt: the rating is now 1 to 5 instead of 1 to 10.",
      everLive: false,
      body: { "first-message": GREETING_B, prompt: PROMPT_D },
    },
    {
      n: 12,
      author: "Sami Rahman",
      mine: false,
      at: "Yesterday, 16:25",
      editedFrom: 11,
      summary:
        "Instruction prompt: asks once more when the customer does not answer.",
      everLive: true,
      body: { "first-message": GREETING_B, prompt: PROMPT_C },
    },
    {
      n: 11,
      author: "Nouf Al-Harbi",
      mine: false,
      at: "8 Oct, 10:12",
      editedFrom: 10,
      summary:
        "First message: asks for a minute instead of two. Instruction prompt: drops the recording notice.",
      everLive: true,
      body: { "first-message": GREETING_B, prompt: PROMPT_B },
    },
    {
      n: 10,
      author: "You",
      mine: true,
      at: "2 Oct, 09:30",
      editedFrom: 9,
      summary: "Instruction prompt: fixed a typo in the closing line.",
      everLive: false,
      body: { "first-message": GREETING_A, prompt: PROMPT_A },
    },
    {
      n: 9,
      author: "Nouf Al-Harbi",
      mine: false,
      at: "28 Sep, 15:04",
      editedFrom: 8,
      summary: "First message: greets the customer by name.",
      everLive: true,
      body: { "first-message": GREETING_A, prompt: PROMPT_A },
    },
  ]
}

export const LIVE_SCENARIO: Subject = {
  kind: "scenario",
  name: "Branch visit survey",
  fields: SCENARIO_FIELDS,
  versions: scenarioVersions(),
  marker: 12,
  published: { by: "Sami Rahman", at: "Yesterday, 16:40" },
}

export const TEST_SCENARIO: Subject = {
  kind: "scenario",
  name: "Branch visit survey (test)",
  fields: SCENARIO_FIELDS,
  versions: scenarioVersions().map((version) => ({
    ...version,
    everLive: false,
  })),
  marker: null,
  published: null,
}

/* --------------------------------------------------------- global prompt */

const GLOBAL_FIELDS: Field[] = [
  { id: "safety", label: "Safety", multiline: true },
  { id: "identity", label: "Identity", multiline: true },
]

const SAFETY_A = [
  "Never ask for a card number, PIN or password.",
  "If the caller is distressed, offer to transfer them to a person.",
].join("\n")

const SAFETY_B = [
  "Never ask for a card number, PIN, password or one-time code.",
  "If the caller is distressed, offer to transfer them to a person.",
].join("\n")

const IDENTITY_A =
  "You are an assistant calling on behalf of {{organization_name}}."
const IDENTITY_B =
  "You are an assistant calling on behalf of {{organization_name}}. Say so in your first sentence."

export const GLOBAL_PROMPT: Subject = {
  kind: "global",
  name: "Global prompt",
  fields: GLOBAL_FIELDS,
  versions: [
    {
      n: 31,
      author: "You",
      mine: true,
      at: "Today, 13:15",
      editedFrom: 30,
      summary:
        "Identity: the agent names the organization in its first sentence.",
      everLive: false,
      body: { safety: SAFETY_B, identity: IDENTITY_B },
    },
    {
      n: 30,
      author: "Nasr Maswood",
      mine: false,
      at: "9 Oct, 12:00",
      editedFrom: 29,
      summary: "Safety: one-time codes join the things never to ask for.",
      everLive: true,
      body: { safety: SAFETY_B, identity: IDENTITY_A },
    },
    {
      n: 29,
      author: "Nouf Al-Harbi",
      mine: false,
      at: "21 Sep, 08:45",
      editedFrom: 28,
      summary: "Safety: offers a transfer when the caller is distressed.",
      everLive: true,
      body: { safety: SAFETY_A, identity: IDENTITY_A },
    },
  ],
  marker: 30,
  published: { by: "Nasr Maswood", at: "9 Oct, 12:05" },
}

/* ----------------------------------------------------------------- cases */

/** What a reviewer can force, so every state the ticket names is reachable. */
export type CaseId =
  | "normal"
  | "conflict"
  | "summary-pending"
  | "history-fails"
  | "view-only"
  | "publish-fails"

export const CASES: { id: CaseId; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "conflict", label: "Someone saves while you edit" },
  { id: "summary-pending", label: "Summary still writing" },
  { id: "history-fails", label: "History fails to load" },
  { id: "view-only", label: "View only" },
  { id: "publish-fails", label: "Publish fails" },
]

/** The version someone else saves while you are editing, in the conflict case. */
export const RIVAL: Omit<Version, "n" | "editedFrom" | "body"> = {
  author: "Ahmad Khalil",
  mine: false,
  at: "Today, 14:20",
  summary: "First message: adds the branch name.",
  everLive: false,
}
