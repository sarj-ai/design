/**
 * Conversations, as the page ships today.
 *
 * The shapes here mirror `Call` and `CallDetail` in the app, so the mockup shows
 * the same columns, the same badges and the same metadata rows the real screen
 * renders. Nothing is designed here — it is a copy for handoff.
 */

export type CallStatus =
  | "cancelled"
  | "completed"
  | "dialing"
  | "expired"
  | "failed"
  | "in_progress"
  | "max_duration_reached"
  | "queued"
  | "ringing"
  /** Not one of the app's statuses today — added for the two rows asked for. */
  | "scheduled"
  | "timeout"
  | "transferred"
  | "transferring"
  | "user_rejected"
  | "voicemail"

/**
 * Where a scheduled call came from.
 *
 * A field on the call and not a pair of statuses, because origin is not a
 * place in the lifecycle — it stays true after the call runs. Modelled as two
 * statuses it would evaporate the moment the call completes, and the completed
 * call is exactly where a reader asks "why did we ring this person?"
 *
 * The two differ in how much they can be trusted. `follow_up` is the post-call
 * analyst's reading of a call, which is a guess and carries a confidence.
 * `requested` is the customer asking for a callback in words, which is not.
 */
export type ScheduleOrigin = "follow_up" | "requested"

/** What the Status chip prints after the dash, and the drawer's origin badge. */
export const SCHEDULE_ORIGIN_LABELS: Record<ScheduleOrigin, string> = {
  follow_up: "follow up",
  requested: "requested",
}

/**
 * The two verdicts a finished call carries, and they are different questions.
 *
 *   Outcome        did the scenario's goal get met
 *   Agent outcome  was the agent helpful to the person on the line, which an
 *                  agent can be on a call whose goal was never reachable, and
 *                  fail to be on a call that got there anyway
 *
 * Both share `unavailable` — one word for "no reading", so a queued call and a
 * call nobody answered do not report their emptiness two different ways.
 */
export type OutcomeStatus = "met" | "not_met" | "unavailable"

export type AgentOutcomeStatus = "helpful" | "not_helpful" | "unavailable"

export type CallDirection = "inbound" | "outbound"

export type CallRow = {
  id: string
  /** Rendered by the Time column. */
  createdAt: string
  user: string
  interactionType: "call" | "chat"
  direction: CallDirection | null
  phoneNumber: null | string
  scenario: string
  status: CallStatus
  /**
   * Set on a call that was booked rather than placed directly — while it is
   * still scheduled, and afterwards on the call that ran from it.
   */
  scheduleOrigin?: ScheduleOrigin
  outcome: OutcomeStatus
  /** Why the outcome reads the way it does — the Outcome cell's tooltip. */
  outcomeReason: null | string
  agentOutcome: AgentOutcomeStatus
  /** m:ss, the way formatDuration prints it. */
  duration: string
}

/* Every status now reaches the table through `STATUS_DISPLAY` in
   status-badges.tsx, which pairs it with the state it belongs to and the cause
   printed after the dash — so there is no flat label map any more. */

/* ------------------------------------------------------------------ columns */

export type ColumnId =
  | "agentOutcome"
  | "direction"
  | "duration"
  | "outcome"
  | "phoneNumber"
  | "scenario"
  | "status"
  | "time"

/**
 * `Call status` rather than `Status`, because the table now carries all three
 * verdicts the drawer names — call status, outcome, agent outcome — and a
 * column called just `Status` does not say which of the three it is.
 */
/**
 * What a column's header tooltip explains, for the columns whose values are not
 * self-evident to someone who has not read the PRD.
 *
 * Call status is the one that gets asked about: Queued and Scheduled both mean
 * "has not happened yet", and nothing in the two words says which one the
 * platform is about to act on. Only columns listed here get a help icon.
 */
export const COLUMN_HELP: Partial<Record<ColumnId, string>> = {
  status: "What each state in this column means.",
}

/**
 * The Call status legend, one row per state.
 *
 * It used to be a single paragraph inside a tooltip: five definitions run
 * together on a black surface, which is a hard read for the one column that
 * most needs explaining. Split into rows it can carry each state's own chip,
 * so the reader matches what they are looking at rather than translating a
 * description back into a colour.
 */
export const STATUS_LEGEND: { detail: string; status: CallStatus }[] = [
  {
    detail: "Booked for a later time. Nothing happens until then.",
    status: "scheduled",
  },
  {
    detail: "Waiting its turn. The platform has not dialled yet.",
    status: "queued",
  },
  {
    detail: "On the call right now, so there is nothing final to read.",
    status: "in_progress",
  },
  {
    detail: "Connected and ran to the end.",
    status: "completed",
  },
  {
    detail: "Never connected, or ended early. The cause follows the dash.",
    status: "failed",
  },
]

export const COLUMN_LABELS: Record<ColumnId, string> = {
  agentOutcome: "Agent outcome",
  direction: "Direction",
  duration: "Duration",
  outcome: "Outcome",
  phoneNumber: "Phone Number",
  scenario: "Scenario",
  status: "Call status",
  time: "Time",
}

export type ColumnSetting = { id: ColumnId; visible: boolean }

/**
 * The order and visibility the table starts in, and what Reset goes back to.
 *
 * This replaces the Default View / Detailed View picker. Two fixed views could
 * not answer "I only care about failures and how long they ran", and adding a
 * third view for every such question is how a view picker becomes a menu
 * nobody reads. Choosing the columns directly covers both views and everything
 * between them.
 */
export const DEFAULT_COLUMNS: ColumnSetting[] = [
  { id: "time", visible: true },
  { id: "direction", visible: true },
  { id: "phoneNumber", visible: true },
  { id: "scenario", visible: true },
  { id: "status", visible: true },
  /* Outcome sits directly after Call status, and Agent outcome after it: the
     three verdicts read left to right in the order a reader asks them — did it
     connect, did it reach the goal, was the agent any use. */
  { id: "outcome", visible: true },
  { id: "agentOutcome", visible: true },
  { id: "duration", visible: true },
]

/* ------------------------------------------------------------------ filters */

export type StatusGroupId =
  "completed" | "failed" | "in_progress" | "queued" | "scheduled"

/**
 * What the Status filter lists.
 *
 * The app's status enum is fifteen values long because it is a state machine —
 * `ringing`, `dialing` and `transferring` are moments the platform passes
 * through, not things anyone sets out to look for. Filtering by them one at a
 * time meant ticking four boxes to ask "which calls never connected".
 *
 * So the filter offers the questions people actually ask, and each one covers
 * the raw statuses that answer it. Every status belongs to exactly one group,
 * so nothing in the table is unreachable from here.
 *
 * These are the same states the Status column prints, deliberately — a
 * filter whose options do not appear in the column it filters is a guessing
 * game. The column adds the specific cause after a dash; the filter does not
 * need it, because the causes inside a group are the same question.
 */
export const STATUS_GROUPS: {
  id: StatusGroupId
  label: string
  /** Every raw status this group matches. The union of them all is complete. */
  statuses: CallStatus[]
}[] = [
  {
    id: "queued",
    label: "Queued",
    statuses: ["queued", "ringing", "dialing"],
  },
  /* Split out of Queued. The PRD's own status list names In Progress
     alongside Completed, Failed and the rest, and a call that is being spoken
     on is not a call waiting to be dialled — reading it as "Queued – on the
     call" put a live call in the queue and invented a cause for it. */
  {
    id: "in_progress",
    label: "In progress",
    statuses: ["in_progress", "transferring"],
  },
  {
    id: "scheduled",
    label: "Scheduled",
    statuses: ["scheduled"],
  },
  {
    id: "completed",
    label: "Completed",
    statuses: ["completed", "transferred"],
  },
  {
    id: "failed",
    label: "Failed",
    statuses: [
      "timeout",
      "voicemail",
      "user_rejected",
      "max_duration_reached",
      "failed",
      "cancelled",
      "expired",
    ],
  },
]

export const CALLS: CallRow[] = [
  /* The two Call Status rows asked for: one waiting to be dialled, one booked
     for later. Neither has run, so neither has an outcome or a duration. */
  {
    id: "call_2ad7f6019be34c72",
    createdAt: "Aug 11, 2026, 2:46 PM",
    user: "talzamel@sarj.ai",
    interactionType: "call",
    direction: "outbound",
    phoneNumber: "+966 55 208 4419",
    scenario: "Collections Follow Up",
    status: "queued",
    outcome: "unavailable",
    outcomeReason: null,
    agentOutcome: "unavailable",
    duration: "-",
  },
  {
    id: "call_4e903bc85a1d47f0",
    createdAt: "Aug 11, 2026, 2:44 PM",
    user: "malmasoudi@sarj.ai",
    interactionType: "call",
    direction: "outbound",
    phoneNumber: "+966 50 661 3307",
    scenario: "Instalment Plan Offer",
    status: "scheduled",
    scheduleOrigin: "requested",
    outcome: "unavailable",
    outcomeReason: null,
    agentOutcome: "unavailable",
    duration: "-",
  },
  /* The callback the 2:41 PM Collections Follow Up created when the customer
     promised to pay — the other half of the link that call carries. */
  {
    id: "call_b6913fe0c7d4428a",
    createdAt: "Aug 11, 2026, 2:42 PM",
    user: "talzamel@sarj.ai",
    interactionType: "call",
    direction: "outbound",
    phoneNumber: "+966 55 812 4477",
    scenario: "Collections Follow Up",
    status: "scheduled",
    scheduleOrigin: "follow_up",
    outcome: "unavailable",
    outcomeReason: null,
    agentOutcome: "unavailable",
    duration: "-",
  },
  {
    id: "call_9f2c41ab7d3e4c08",
    createdAt: "Aug 11, 2026, 2:41 PM",
    user: "talzamel@sarj.ai",
    interactionType: "call",
    direction: "outbound",
    phoneNumber: "+966 55 812 4477",
    scenario: "Collections Follow Up",
    status: "completed",
    outcome: "met",
    outcomeReason:
      "Customer confirmed the outstanding balance and promised payment by Aug 18.",
    agentOutcome: "helpful",
    duration: "3:24",
  },
  {
    id: "call_5d81c0e4a9b7412f",
    createdAt: "Aug 11, 2026, 2:33 PM",
    user: "talzamel@sarj.ai",
    interactionType: "call",
    direction: "inbound",
    phoneNumber: "+966 50 337 9021",
    scenario: "Billing Enquiry",
    status: "transferred",
    outcome: "met",
    outcomeReason:
      "Caller asked about a late fee the agent is not allowed to waive, so the call went to a human.",
    agentOutcome: "helpful",
    duration: "2:07",
  },
  {
    id: "call_1b7e93f5c2a84d16",
    createdAt: "Aug 11, 2026, 2:28 PM",
    user: "malmasoudi@sarj.ai",
    interactionType: "call",
    direction: "outbound",
    phoneNumber: "+966 53 220 6188",
    scenario: "Instalment Plan Offer",
    status: "timeout",
    outcome: "unavailable",
    outcomeReason: null,
    agentOutcome: "unavailable",
    duration: "0:31",
  },
  {
    id: "call_c40a86d1f7be4903",
    createdAt: "Aug 11, 2026, 2:19 PM",
    user: "malmasoudi@sarj.ai",
    interactionType: "chat",
    direction: null,
    phoneNumber: null,
    scenario: "Custom Scenario",
    status: "completed",
    outcome: "met",
    outcomeReason: "The customer got the fee schedule they asked for.",
    agentOutcome: "helpful",
    duration: "1:52",
  },
  {
    id: "call_a71f5c93e08b426d",
    createdAt: "Aug 11, 2026, 2:04 PM",
    user: "fjanahi@sarj.ai",
    interactionType: "call",
    direction: "outbound",
    phoneNumber: "+966 56 904 3312",
    scenario: "Collections Follow Up",
    status: "voicemail",
    outcome: "not_met",
    outcomeReason: "Reached voicemail, so nothing was confirmed.",
    /* Nobody picked up, so there was no one for the agent to help. */
    agentOutcome: "unavailable",
    duration: "0:48",
  },
  {
    id: "call_38b2ed6740fa4c15",
    createdAt: "Aug 11, 2026, 1:58 PM",
    user: "fjanahi@sarj.ai",
    interactionType: "call",
    direction: "inbound",
    phoneNumber: "+966 59 118 7740",
    scenario: "Payment Confirmation",
    status: "in_progress",
    outcome: "unavailable",
    outcomeReason: null,
    agentOutcome: "unavailable",
    duration: "1:12",
  },
  {
    id: "call_6e0d47a2bb1e49c8",
    createdAt: "Aug 11, 2026, 1:44 PM",
    user: "talzamel@sarj.ai",
    interactionType: "call",
    direction: "outbound",
    phoneNumber: "+966 55 462 0093",
    scenario: "Instalment Plan Offer",
    status: "user_rejected",
    outcome: "not_met",
    outcomeReason: "The customer hung up before the offer was read out.",
    agentOutcome: "not_helpful",
    duration: "0:09",
  },
  /* Booked on Aug 9 and dialled today, so the drawer can show how the
     scheduled settings read once the call has actually run. */
  {
    id: "call_0a4fb27c68e1495d",
    createdAt: "Aug 11, 2026, 1:41 PM",
    user: "malmasoudi@sarj.ai",
    interactionType: "call",
    direction: "outbound",
    phoneNumber: "+966 55 330 8815",
    scenario: "Instalment Plan Offer",
    status: "completed",
    scheduleOrigin: "requested",
    outcome: "met",
    outcomeReason:
      "The customer took the 6-month plan and the first instalment was confirmed for Aug 20.",
    agentOutcome: "helpful",
    duration: "5:02",
  },
  {
    id: "call_7c95a1082fd34eb6",
    createdAt: "Aug 11, 2026, 1:37 PM",
    user: "galhabib@sarj.ai",
    interactionType: "call",
    direction: "inbound",
    phoneNumber: "+966 54 771 2265",
    scenario: "Billing Enquiry",
    status: "completed",
    outcome: "met",
    outcomeReason: "The balance was read back and the caller was satisfied.",
    agentOutcome: "helpful",
    duration: "4:16",
  },
]

export const TOTAL_RESULTS = 1284

/* -------------------------------------------------------------------------
   The drawer — one call, opened from a row.
------------------------------------------------------------------------- */

export type TranscriptTurn = {
  role: "agent" | "caller" | "human agent"
  content: string
  /** Seconds into the recording, printed under the bubble. */
  at: number
}

export const CALL_DETAIL = {
  id: "call_9f2c41ab7d3e4c08",
  scenario: "Collections Follow Up",
  direction: "outbound" as CallDirection,
  phoneNumber: "+966 55 812 4477",
  startedAt: "Aug 11, 2026, 2:41 PM",
  status: "completed" as CallStatus,
  language: "Arabic",
  createdAtFull: "Aug 11, 2026, 2:41:02 PM",
  startedAtFull: "Aug 11, 2026, 2:41:09 PM",
  endedAtFull: "Aug 11, 2026, 2:44:33 PM",
  connectionDuration: "3m 24s",
  user: "talzamel@sarj.ai",
  userId: "user_2f81ab93c7d0",
  organization: "Quara Finance",
  organizationId: "org_5c1d7fa2e930",
  callerNumber: "+966 11 520 0100",
  calleeNumber: "+966 55 812 4477",
  sipStatus: "Answered",
  sipTrunkId: "ST_a7f31c92",
  totalCalls: "3",
  answerRate: "67%",
  recordingDuration: "3:24",
  recordingSeconds: 204,
  outcome: {
    status: "met" as OutcomeStatus,
    reason:
      "Customer confirmed the outstanding balance of SAR 4,820 and promised payment by Aug 18. The agent read back the reference number and the customer repeated it correctly.",
    generatedAt: "Aug 11, 2026, 2:45 PM",
    successCriteria: [
      {
        achieved: true,
        isPrimary: true,
        text: "Customer acknowledged the outstanding balance",
      },
      {
        achieved: true,
        isPrimary: false,
        text: "A payment date was given and repeated back",
      },
      {
        achieved: false,
        isPrimary: false,
        text: "Customer was offered the instalment plan",
      },
    ],
  },
  transcript: [
    {
      role: "agent" as const,
      content:
        "مساء الخير، معك المساعد الآلي من قطاع التحصيل في قرى للتمويل. هل أتحدث مع الأستاذ سعود؟",
      at: 2,
    },
    {
      role: "caller" as const,
      content: "نعم، أنا سعود. تفضل.",
      at: 8,
    },
    {
      role: "agent" as const,
      content:
        "شكراً لك. لديك مبلغ مستحق قدره 4,820 ريال على حسابك. هل بإمكانك تحديد موعد للسداد؟",
      at: 12,
    },
    {
      role: "caller" as const,
      content: "أقدر أسدد يوم 18 من هذا الشهر.",
      at: 24,
    },
    {
      role: "agent" as const,
      content:
        "ممتاز. سجلت وعد بالسداد بتاريخ 18 أغسطس. الرقم المرجعي هو 4 7 2 9. هل تفضل أن أرسله لك برسالة نصية؟",
      at: 29,
    },
    {
      role: "caller" as const,
      content: "إي، أرسله رسالة. 4 7 2 9، صح؟",
      at: 41,
    },
    {
      role: "agent" as const,
      content: "صحيح تماماً. شكراً لوقتك، وطاب يومك.",
      at: 47,
    },
  ] satisfies TranscriptTurn[],
  scenarioData: {
    variables: {
      account_reference: "QF-88420-3",
      customer_name: "Saud Al Otaibi",
      due_date: "2026-08-04",
      outstanding_balance: "4820.00",
      preferred_language: "ar",
    },
  } as Record<string, Record<string, string>>,
  responseBody: {
    payment_promised: true,
    promised_amount: "4820.00",
    promised_date: "2026-08-18",
    reference_read_back: true,
    sms_requested: true,
  } as Record<string, boolean | string>,
}
