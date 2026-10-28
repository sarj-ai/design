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

export type ScheduleOrigin = "follow_up" | "requested"

export const SCHEDULE_ORIGIN_LABELS: Record<ScheduleOrigin, string> = {
  follow_up: "follow up",
  requested: "requested",
}

export type OutcomeStatus = "met" | "not_met" | "unavailable"

export type AgentOutcomeStatus = "helpful" | "not_helpful" | "unavailable"

export type CallDirection = "inbound" | "outbound"

export type CallRow = {
  id: string
  createdAt: string
  user: string
  interactionType: "call" | "chat"
  direction: CallDirection | null
  phoneNumber: null | string
  scenario: string
  status: CallStatus
  scheduleOrigin?: ScheduleOrigin
  outcome: OutcomeStatus
  outcomeReason: null | string
  agentOutcome: AgentOutcomeStatus
  /** m:ss, the way formatDuration prints it. */
  duration: string
}

export type ColumnId =
  | "agentOutcome"
  | "direction"
  | "duration"
  | "outcome"
  | "phoneNumber"
  | "scenario"
  | "status"
  | "time"

export const COLUMN_HELP: Partial<Record<ColumnId, string>> = {
  status: "What each state in this column means.",
}

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

export const DEFAULT_COLUMNS: ColumnSetting[] = [
  { id: "time", visible: true },
  { id: "direction", visible: true },
  { id: "phoneNumber", visible: true },
  { id: "scenario", visible: true },
  { id: "status", visible: true },
  { id: "outcome", visible: true },
  { id: "agentOutcome", visible: true },
  { id: "duration", visible: true },
]

export type StatusGroupId =
  "completed" | "failed" | "in_progress" | "queued" | "scheduled"

export const STATUS_GROUPS: {
  id: StatusGroupId
  label: string
  /** Every CallStatus must appear in exactly one group. */
  statuses: CallStatus[]
}[] = [
  {
    id: "queued",
    label: "Queued",
    statuses: ["queued", "ringing", "dialing"],
  },
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
