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

type Reference = { app: string; how: string; url: string }

export const PATTERN: Record<IdeaId, string> = {
  "row-numbers":
    "Only data and spreadsheet tools number rows. No inbox or review tool does.",
  "last-opened":
    "Recording tools mark what you have watched on the row itself.",
  unread:
    "Bold with a dot while unread. Mark all as read sits with the Unread and Read filter.",
  reviewed:
    "Code review keeps viewed apart from opened, with a count of how many are done.",
  saved: "Saved items get a list of their own, not only a mark on the row.",
  history: "A dated list of what you opened, newest first.",
  "review-mode":
    "The open record steps to the next one without closing, and each verdict has one key.",
  session:
    "AI review tools run a queue: Needs review and Completed, one at a time, with Done.",
}

const MOBBIN = "https://mobbin.com/screens/"

export const SEEN_IN: Record<IdeaId, Reference[]> = {
  "row-numbers": [
    {
      app: "Braintrust",
      how: "Numbers every log and dataset row, and the open record steps with ↑ ↓.",
      url: `${MOBBIN}ec143dfb-d4b1-4c28-80fa-00917dcb220b`,
    },
    {
      app: "Airtable",
      how: "Row numbers in the grid's gutter, beside the checkbox.",
      url: `${MOBBIN}b582185d-6401-42a4-bcc7-f2f76d2639d0`,
    },
    {
      app: "Databricks",
      how: "Row numbers are a table setting, “Display row number”.",
      url: `${MOBBIN}a5f5a99a-7556-45da-97cf-4e30d3302394`,
    },
  ],
  "last-opened": [
    {
      app: "Mixpanel",
      how: "The open replay stays highlighted in the list, with “Recording 1/9” over the player.",
      url: `${MOBBIN}42f24b8f-81e9-4e80-9ba3-dddb39c55903`,
    },
    {
      app: "Hotjar",
      how: "A recording you have watched shows Replay instead of Play.",
      url: `${MOBBIN}9c057306-802c-410e-ada8-7cfec9518db7`,
    },
    {
      app: "Loom",
      how: "A watched video gets a Viewed tag on its thumbnail.",
      url: `${MOBBIN}a398621f-9714-4127-b3b4-e705f48905ed`,
    },
  ],
  unread: [
    {
      app: "Notion Mail",
      how: "Unread rows are bold with a dot; read rows drop to regular weight.",
      url: `${MOBBIN}9500dd6d-2569-425a-ad46-6e99c22f73ad`,
    },
    {
      app: "Sketch",
      how: "Unread and Read tabs with a count, and Mark all as read beside them.",
      url: `${MOBBIN}f16135f5-9086-4271-bb18-0b95b10db12c`,
    },
    {
      app: "Wrike",
      how: "Mark all as read sits in the inbox's more menu.",
      url: `${MOBBIN}a2b51485-af81-4c80-8f06-b357e0fe5bda`,
    },
    {
      app: "Superhuman",
      how: "A dot on unread threads, nothing on read ones.",
      url: `${MOBBIN}b0cecd33-9403-4c15-af1c-033d84826cf5`,
    },
  ],
  reviewed: [
    {
      app: "Devin",
      how: "A “Mark as viewed” checkbox on every file, and “4/4 All lines reviewed” above them.",
      url: `${MOBBIN}db4dc31e-376d-4bdd-907e-c99d56e8e964`,
    },
    {
      app: "Graphite",
      how: "A Viewed checkbox in each file's header.",
      url: `${MOBBIN}b16e3604-0116-4db7-8fbe-effb138c49d6`,
    },
  ],
  saved: [
    {
      app: "Slack",
      how: "Save for later, collected in a Later list split into In progress, Archived and Completed.",
      url: `${MOBBIN}10d2a785-1eb9-477d-8a0a-0ceaf7383c1b`,
    },
    {
      app: "Proton Mail",
      how: "A star on each row, and Starred as its own folder in the sidebar.",
      url: `${MOBBIN}83748c89-4e8e-4444-92fb-03b6863da27f`,
    },
  ],
  history: [
    {
      app: "Loom",
      how: "A History page of what you watched, grouped by day.",
      url: `${MOBBIN}a398621f-9714-4127-b3b4-e705f48905ed`,
    },
    {
      app: "Netflix",
      how: "Viewing activity as a dated list, newest first.",
      url: `${MOBBIN}77ed9bab-82c5-48a1-bd7d-4b4c0f415e59`,
    },
    {
      app: "Substack",
      how: "History is a tab beside Saved, on the same list.",
      url: `${MOBBIN}b9d8ba56-a6af-49a0-bb86-9f267ee5674c`,
    },
  ],
  "review-mode": [
    {
      app: "Braintrust",
      how: "The record panel steps to the next row with ↑ ↓ without closing, and a Review button sits in its header.",
      url: `${MOBBIN}b2e50d75-4499-46cb-8d61-db349117e9f2`,
    },
    {
      app: "Intercom",
      how: "Each answer is rated Good, Acceptable or Poor, one key each: G, A, P.",
      url: `${MOBBIN}3d1c5b08-8c6d-421a-bbff-1dcb6b4b7c31`,
    },
    {
      app: "Mixpanel",
      how: "Auto Play moves on to the next replay when one ends.",
      url: `${MOBBIN}42f24b8f-81e9-4e80-9ba3-dddb39c55903`,
    },
  ],
  session: [
    {
      app: "LangSmith",
      how: "An annotation queue split into Needs Review and Completed, “1 of 1”, Requeue at End, and Done ⌘↵.",
      url: `${MOBBIN}0472f73c-0bd0-4e93-94bb-52c5a9962b9d`,
    },
    {
      app: "Reddit",
      how: "The mod Queue has a Needs Review tab and steps through it “1–2 of 2”.",
      url: `${MOBBIN}14b41132-545c-4de3-94bf-dd58460ef7c3`,
    },
    {
      app: "Maze",
      how: "Each session is marked In review until the reviewer presses Done.",
      url: `${MOBBIN}d94deacc-6b73-4b7d-8c67-cdf515a9ddff`,
    },
  ],
}
