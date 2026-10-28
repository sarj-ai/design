import {
  LIVE_SCENARIO,
  type Subject,
} from "@/lib/mockups/config-versioning-data"

export type ViewerId = "requester" | "approver"

export type Viewer = {
  id: ViewerId
  name: string
  label: string
  sarj: boolean
  approves: string | null
}

export const VIEWERS: Viewer[] = [
  {
    id: "requester",
    name: "Ahmad Khalil",
    label: "Ahmad Khalil, requester (Sarj)",
    sarj: true,
    approves: null,
  },
  {
    id: "approver",
    name: "Yusuf Al-Amri",
    label: "Yusuf Al-Amri, approver (Riyad Bank)",
    sarj: false,
    approves: "Riyad Bank",
  },
]

export function who(name: string, viewer: Viewer, inSentence = false) {
  if (name !== viewer.name) return name
  return inSentence ? "you" : "You"
}

export type Status = "pending" | "approved" | "rejected" | "withdrawn"

export type Change = { label: string; before: string; after: string }

export type ApprovalRequest = {
  id: string
  item: string
  org: string
  version: number
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

export function canDecide(request: ApprovalRequest, viewer: Viewer) {
  return viewer.approves === request.org
}

export function canSee(request: ApprovalRequest, viewer: Viewer) {
  return viewer.sarj || request.org === viewer.approves
}

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
    log: subject.log.map((entry) => ({
      ...entry,
      by: who(entry.by, viewer),
    })),
  }
}

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

const V15_GREETING =
  "Hello {{name}}, this is Sara from Riyad Bank's branch team. Do you have a minute for a quick survey?"

const MAIN_NOTE =
  "Riyad Bank's branch reports moved to a 5-point scale this month, and they asked for low scores to reach the branch manager the same day."

export function mainRequest(
  status: Status,
  version = 14,
  decision: ApprovalRequest["decision"] = null,
): ApprovalRequest {
  return {
    id: `bvs-${version}`,
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

export const OTHER_REQUESTS: ApprovalRequest[] = [
  {
    id: "qfc-41",
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
        note: "Bank name in the greeting",
        body: { ...v14.body, "first-message": V15_GREETING },
      },
      ...subject.versions,
    ],
  }
}
