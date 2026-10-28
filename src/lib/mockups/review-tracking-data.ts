import type {
  CallRow,
  CallStatus,
  OutcomeStatus,
} from "@/lib/mockups/conversations-revamp-list-data"

const RAN: [string, string, string, CallStatus, OutcomeStatus, string][] = [
  [
    "2:05 PM",
    "+966 55 812 4477",
    "Collections Follow Up",
    "completed",
    "met",
    "3:24",
  ],
  [
    "2:03 PM",
    "+966 50 661 3307",
    "Instalment Plan Offer",
    "completed",
    "not_met",
    "2:51",
  ],
  [
    "2:02 PM",
    "+966 54 390 1182",
    "Collections Follow Up",
    "voicemail",
    "unavailable",
    "0:38",
  ],
  [
    "1:57 PM",
    "+966 56 204 7719",
    "Billing Enquiry",
    "transferred",
    "met",
    "4:12",
  ],
  [
    "1:34 PM",
    "+966 55 917 0264",
    "Payment Confirmation",
    "completed",
    "met",
    "1:46",
  ],
  [
    "1:33 PM",
    "+966 53 128 5540",
    "Instalment Plan Offer",
    "user_rejected",
    "not_met",
    "0:22",
  ],
  [
    "1:32 PM",
    "+966 50 774 9031",
    "Collections Follow Up",
    "completed",
    "not_met",
    "5:03",
  ],
  [
    "1:30 PM",
    "+966 55 402 6618",
    "Billing Enquiry",
    "completed",
    "met",
    "2:17",
  ],
  [
    "1:28 PM",
    "+966 54 663 2095",
    "Collections Follow Up",
    "failed",
    "unavailable",
    "0:09",
  ],
  [
    "1:27 PM",
    "+966 56 851 3370",
    "Instalment Plan Offer",
    "completed",
    "met",
    "3:40",
  ],
  [
    "1:27 PM",
    "+966 50 239 4486",
    "Payment Confirmation",
    "timeout",
    "not_met",
    "6:00",
  ],
  [
    "1:26 PM",
    "+966 55 310 7752",
    "Collections Follow Up",
    "completed",
    "met",
    "2:58",
  ],
  [
    "1:25 PM",
    "+966 53 946 0127",
    "Billing Enquiry",
    "completed",
    "not_met",
    "1:31",
  ],
  [
    "1:24 PM",
    "+966 54 587 3394",
    "Instalment Plan Offer",
    "transferred",
    "met",
    "4:45",
  ],
]

const USERS = ["talzamel@sarj.ai", "malmasoudi@sarj.ai", "fjanahi@sarj.ai"]

export const REVIEW_CALLS: CallRow[] = RAN.map(
  ([time, phoneNumber, scenario, status, outcome, duration], index) => ({
    id: `call_review_${index + 1}`,
    createdAt: `Oct 27, 2026, ${time}`,
    user: USERS[index % USERS.length],
    interactionType: "call",
    direction: index % 4 === 3 ? "inbound" : "outbound",
    phoneNumber,
    scenario,
    status,
    outcome,
    outcomeReason: null,
    agentOutcome: outcome === "met" ? "helpful" : "unavailable",
    duration,
  }),
)

export const TOTAL_CALLS = 214

export const IDEAS = [
  { id: "row-numbers", label: "Row numbers", from: "Mohammed" },
  {
    id: "last-opened",
    label: "Highlight the last call opened",
    from: "Maryam, Hasan",
  },
  {
    id: "unread",
    label: "Unread dot and mark all as read",
    from: "Vansh, Maryam",
  },
  { id: "reviewed", label: "Reviewed checkbox", from: "Vansh" },
  { id: "saved", label: "Save for later", from: "Kidus, Abdulrahman" },
  { id: "history", label: "Watch history", from: "Abdulrahman" },
  { id: "review-mode", label: "Review mode", from: "Vansh" },
  { id: "session", label: "Review session", from: "Mohammed" },
] as const

export type IdeaId = (typeof IDEAS)[number]["id"]

export const LAST_OPENED = REVIEW_CALLS[4].id

export const OPENED = REVIEW_CALLS.filter(
  (_, index) => index >= 3 && index !== 7,
).map((call) => call.id)

export const REVIEWED = REVIEW_CALLS.filter((_, index) => index >= 6).map(
  (call) => call.id,
)

export const SAVED = [REVIEW_CALLS[2].id, REVIEW_CALLS[8].id]

export const HISTORY: { id: string; at: string }[] = [
  { id: REVIEW_CALLS[4].id, at: "2 min ago" },
  { id: REVIEW_CALLS[5].id, at: "6 min ago" },
  { id: REVIEW_CALLS[9].id, at: "14 min ago" },
  { id: REVIEW_CALLS[6].id, at: "Yesterday, 17:20" },
  { id: REVIEW_CALLS[10].id, at: "Yesterday, 16:58" },
]
