/**
 * Mock data for DES-204, publish approval. The model is the "Publish
 * approval" requirements doc (Taynam Alzamel), on top of DES-202's versions:
 *
 *  - Every publish needs an approval, and publishing exists only on live
 *    scenarios and the global prompt, so those are the only things gated.
 *  - A live scenario is approved by its client; the global prompt, which
 *    has no owning organization, by a super admin.
 *  - A request is pinned to one version, carries the requester's note (the
 *    why) and a summary of the effect on callers (the what), and waits
 *    until someone acts. It never expires and never publishes on its own.
 *  - Approving publishes. There is no override and no bypass.
 *
 * Assumed, because the access model (INT-93, INT-32) has no approval concept
 * yet: a client approver is a member of the client organization who holds
 * an "Approve changes" permission, and any one of them can decide.
 */

import {
  GLOBAL_PROMPT,
  LIVE_SCENARIO,
  type Subject,
} from "@/lib/mockups/config-versioning-data"

/* --------------------------------------------------------------- viewers */

export type ViewerId = "requester" | "approver" | "admin"

export type Viewer = {
  id: ViewerId
  name: string
  label: string
  /** Sarj staff see every organization they can access; a client sees one. */
  sarj: boolean
  /** The organization whose changes this person approves. */
  approves: string | null
  superAdmin: boolean
}

export const VIEWERS: Viewer[] = [
  {
    id: "requester",
    name: "Ahmad Khalil",
    label: "Ahmad Khalil, requester (Sarj)",
    sarj: true,
    approves: null,
    superAdmin: false,
  },
  {
    id: "approver",
    name: "Yusuf Al-Amri",
    label: "Yusuf Al-Amri, approver (Riyad Bank)",
    sarj: false,
    approves: "Riyad Bank",
    superAdmin: false,
  },
  {
    id: "admin",
    name: "Nasr Maswood",
    label: "Nasr Maswood, super admin (Sarj)",
    sarj: true,
    approves: null,
    superAdmin: true,
  },
]

/** "You" when it is the person looking; "you" inside a sentence. */
export function who(name: string, viewer: Viewer, inSentence = false) {
  if (name !== viewer.name) return name
  return inSentence ? "you" : "You"
}

/* -------------------------------------------------------------- requests */

export type Status = "pending" | "approved" | "rejected" | "withdrawn"

export type Change = { label: string; before: string; after: string }

export type ApprovalRequest = {
  id: string
  kind: "scenario" | "global"
  item: string
  /** The client organization; null for the global prompt. */
  org: string | null
  version: number
  /** What callers heard when the request was raised. */
  live: number
  by: string
  raised: string
  waiting: string
  note: string
  summary: string
  changes: Change[]
  status: Status
  decision: { by: string; at: string; reason?: string } | null
}

/** Who decides, in words: the client, or a super admin. */
export function decider(request: ApprovalRequest) {
  return request.org ?? "A super admin"
}

export function canDecide(request: ApprovalRequest, viewer: Viewer) {
  return request.kind === "global"
    ? viewer.superAdmin
    : viewer.approves === request.org
}

export function canSee(request: ApprovalRequest, viewer: Viewer) {
  return viewer.sarj || request.org === viewer.approves
}

/* The live scenario from DES-202, owned by Riyad Bank. Its newest save is
   Ahmad's, so DES-202's "You" becomes his name here. Authors are stored as
   names and turned into "You" for whoever is looking (forViewer), so the
   same state reads right as the reviewer switches between people. */
export const SCENARIO_ORG = "Riyad Bank"

export const SCENARIO: Subject = {
  ...LIVE_SCENARIO,
  versions: LIVE_SCENARIO.versions.map((version) => ({
    ...version,
    author: version.author === "You" ? "Ahmad Khalil" : version.author,
    mine: false,
  })),
}

export function forViewer(subject: Subject, viewer: Viewer): Subject {
  return {
    ...subject,
    versions: subject.versions.map((version) => ({
      ...version,
      author: who(version.author, viewer),
      mine: version.author === viewer.name,
    })),
    published: subject.published
      ? { ...subject.published, by: who(subject.published.by, viewer) }
      : null,
  }
}

/** The changes between what callers hear and the version requested. */
export function changesBetween(
  subject: Subject,
  live: number,
  version: number,
): Change[] {
  const before = subject.versions.find((item) => item.n === live)
  const after = subject.versions.find((item) => item.n === version)
  if (!before || !after) return []
  return subject.fields
    .filter((field) => before.body[field.id] !== after.body[field.id])
    .map((field) => ({
      label: field.label,
      before: before.body[field.id],
      after: after.body[field.id],
    }))
}

/**
 * A stand-in for the generated summary. The PRD wants it written for a
 * non-technical reader, about the effect on callers rather than the fields,
 * and against what callers hear now — not against the version it was edited
 * from, which the client never heard.
 */
export function summaryFor(version: number, live: number) {
  if (version === 14 && live === 12) return SUMMARY_V14
  if (version === 15 && live === 12) return SUMMARY_V15
  if (version < live)
    return `Callers go back to how the survey ran in v${version}, before the changes made since.`
  return `Callers hear the survey as saved in v${version}.`
}

const SUMMARY_V14 =
  "Callers rate their visit from 1 to 5 instead of 1 to 10. Anyone who gives 2 or lower is asked what went wrong and offered a callback from the branch manager."

const SUMMARY_V15 = `${SUMMARY_V14} The greeting now names Riyad Bank.`

/** v15, saved while v14 waits — the "version changes while pending" case. */
export const V15_GREETING =
  "Hello {{name}}, this is Sara from Riyad Bank's branch team. Do you have a minute for a quick survey?"

export const MAIN_NOTE =
  "Riyad Bank's branch reports moved to a 5-point scale this month, and they asked for low scores to reach the branch manager the same day."

/** The request on the live scenario, in whatever state a case opens it. */
export function mainRequest(
  status: Status,
  version = 14,
  decision: ApprovalRequest["decision"] = null,
): ApprovalRequest {
  return {
    id: `bvs-${version}`,
    kind: "scenario",
    item: LIVE_SCENARIO.name,
    org: SCENARIO_ORG,
    version,
    live: 12,
    by: "Ahmad Khalil",
    raised: "Today, 09:10",
    waiting: "5 hours",
    note: MAIN_NOTE,
    summary: summaryFor(version, 12),
    changes: changesBetween(LIVE_SCENARIO, 12, version),
    status,
    decision,
  }
}

const IDENTITY = GLOBAL_PROMPT.fields[1]

/** Everything else on the Approvals page, newest first. */
export const OTHER_REQUESTS: ApprovalRequest[] = [
  {
    id: "global-31",
    kind: "global",
    item: "Global prompt",
    org: null,
    version: 31,
    live: 30,
    by: "Ahmad Khalil",
    raised: "Today, 13:20",
    waiting: "1 hour",
    note: "Two clients had callers ask who was calling before the agent said. This makes the agent say it first.",
    summary:
      "On every call in every organization, the agent names the organization it is calling for in its first sentence.",
    changes: [
      {
        label: IDENTITY.label,
        before: GLOBAL_PROMPT.versions[1].body[IDENTITY.id],
        after: GLOBAL_PROMPT.versions[0].body[IDENTITY.id],
      },
    ],
    status: "pending",
    decision: null,
  },
  {
    id: "qfc-41",
    kind: "scenario",
    item: "Customer care",
    org: "Quara Finance",
    version: 41,
    live: 39,
    by: "Sami Rahman",
    raised: "Today, 10:05",
    waiting: "4 hours",
    note: "Quara Finance's new card replacement fee starts on 15 October.",
    summary:
      "Callers asking to replace a card hear the new fee of 25 SAR before the agent orders it.",
    changes: [
      {
        label: "Instruction prompt",
        before:
          "If the customer asks to replace a card, confirm the address and order it.",
        after:
          "If the customer asks to replace a card, tell them the fee is 25 SAR.\nIf they agree, confirm the address and order it.",
      },
    ],
    status: "pending",
    decision: null,
  },
  {
    id: "inv-8",
    kind: "scenario",
    item: "Invoices awaiting payment (outbound)",
    org: SCENARIO_ORG,
    version: 8,
    live: 7,
    by: "Sami Rahman",
    raised: "10 Oct, 09:15",
    waiting: "2 days",
    note: "The collections team asked us to stop transferring customers who have already paid.",
    summary:
      "Callers who say they have already paid are asked for the payment date and told their record updates within two working days, instead of being transferred.",
    changes: [
      {
        label: "Instruction prompt",
        before:
          "Remind the customer of the amount due and the due date.\nIf they say they have paid, transfer them to the collections team.",
        after:
          "Remind the customer of the amount due and the due date.\nIf they say they have paid, ask for the payment date and tell them their record updates within two working days.",
      },
    ],
    status: "pending",
    decision: null,
  },
  {
    id: "inb-22",
    kind: "scenario",
    item: "Inbound agent",
    org: SCENARIO_ORG,
    version: 22,
    live: 21,
    by: "Nouf Al-Harbi",
    raised: "7 Oct, 11:30",
    waiting: "4 hours",
    note: "Branch hours changed for the winter timetable.",
    summary:
      "Callers asking about opening hours hear the winter hours, 8:00 to 15:00, Sunday to Thursday.",
    changes: [
      {
        label: "Instruction prompt",
        before: "Branches are open 9:00 to 16:00, Sunday to Thursday.",
        after: "Branches are open 8:00 to 15:00, Sunday to Thursday.",
      },
    ],
    status: "approved",
    decision: { by: "Yusuf Al-Amri", at: "7 Oct, 15:42" },
  },
  {
    id: "wel-5",
    kind: "scenario",
    item: "Welcome and onboarding (outbound)",
    org: SCENARIO_ORG,
    version: 5,
    live: 4,
    by: "Ahmad Khalil",
    raised: "6 Oct, 09:00",
    waiting: "2 hours",
    note: "Shorter greeting, as tested in the playground last week.",
    summary:
      "Callers are greeted in English first, and the greeting is one sentence instead of two.",
    changes: [
      {
        label: "First message",
        before:
          "مرحبًا {{name}}، معك سارة من بنك الرياض. Welcome to Riyad Bank, this is Sara.",
        after: "Hi {{name}}, it's Sara from Riyad Bank.",
      },
    ],
    status: "rejected",
    decision: {
      by: "Huda Al-Saud",
      at: "6 Oct, 11:20",
      reason:
        "Keep the Arabic greeting first. Most of these customers expect it.",
    },
  },
  {
    id: "debt-3",
    kind: "scenario",
    item: "Debt collection (standard posture)",
    org: SCENARIO_ORG,
    version: 3,
    live: 2,
    by: "Sami Rahman",
    raised: "3 Oct, 14:10",
    waiting: "1 day",
    note: "Firmer wording on the second reminder.",
    summary:
      "On a second reminder, callers are told the account may be passed to collections.",
    changes: [
      {
        label: "Instruction prompt",
        before: "On a second reminder, ask when they can pay.",
        after:
          "On a second reminder, say the account may be passed to collections, then ask when they can pay.",
      },
    ],
    status: "withdrawn",
    decision: { by: "Sami Rahman", at: "4 Oct, 10:02" },
  },
]

/* ----------------------------------------------------------------- cases */

/** What a reviewer can force, so every state the ticket names is reachable. */
export type CaseId =
  | "normal"
  | "pending"
  | "newer"
  | "rejected"
  | "summary-writing"
  | "summary-failed"
  | "send-fails"
  | "approve-fails"
  | "load-fails"
  | "empty"
  | "view-only"

export const CASES: { id: CaseId; label: string }[] = [
  { id: "normal", label: "Nothing requested yet" },
  { id: "pending", label: "Waiting for approval" },
  { id: "newer", label: "Saved again while waiting" },
  { id: "rejected", label: "Rejected" },
  { id: "summary-writing", label: "Summary still writing" },
  { id: "summary-failed", label: "Summary couldn't be written" },
  { id: "send-fails", label: "Request fails to send" },
  { id: "approve-fails", label: "Approve fails" },
  { id: "load-fails", label: "Approvals fail to load" },
  { id: "empty", label: "No requests" },
  { id: "view-only", label: "View only" },
]

/** v15 on top of v14: the greeting names the bank. */
export function withV15(subject: Subject): Subject {
  const v14 = subject.versions[0]
  return {
    ...subject,
    versions: [
      {
        n: 15,
        author: v14.author,
        mine: v14.mine,
        at: "Today, 14:12",
        editedFrom: 14,
        summary: "First message: names Riyad Bank.",
        everLive: false,
        body: { ...v14.body, "first-message": V15_GREETING },
      },
      ...subject.versions,
    ],
  }
}
