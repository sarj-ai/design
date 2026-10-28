type CallStatus =
  | "cancelled"
  | "completed"
  | "dialing"
  | "expired"
  | "failed"
  | "in_progress"
  | "max_duration_reached"
  | "queued"
  | "ringing"
  | "scheduled"
  | "timeout"
  | "transferred"
  | "transferring"
  | "user_rejected"
  | "voicemail"

type OutcomeStatus = "met" | "not_met"

export const OUTCOME_LABELS: Record<OutcomeStatus, string> = {
  met: "met",
  not_met: "not met",
}

type CallDirection = "inbound" | "outbound"

type TranscriptTurn = {
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
  language: "English",
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
      preferred_language: "en",
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

export type TurnKind = "backchannel" | "speech" | "tool"

export type RevampTurn = {
  role: "agent" | "caller" | "human agent"
  kind: TurnKind
  content: string
  /** Seconds into the recording. */
  at: number
  corrections?: { from: string; to: string }[]
  tool?: { name: string; args: string; ms: number; response: string }
}

export const RECORDING_SECONDS = 204

type Outcome = {
  title: string
  status: OutcomeStatus
  reason: string
  generatedAt: string
  criteria: { achieved: boolean; isPrimary: boolean; text: string }[]
}

export const CALL_VERDICTS: { label: string; ok: boolean; value: string }[] = [
  { label: "Call status", ok: true, value: "Connected" },
  { label: "Outcome", ok: true, value: "Met" },
  { label: "Agent outcome", ok: true, value: "Helpful" },
]

export const OUTCOMES: Outcome[] = [
  {
    title: "Call outcome",
    status: "met",
    reason:
      "Customer confirmed the outstanding balance of SAR 4,820 and promised payment by Aug 18. The reference number was read back correctly.",
    generatedAt: "Aug 11, 2026, 2:45 PM",
    criteria: [
      {
        achieved: true,
        isPrimary: true,
        text: "Identity verified",
      },
      {
        achieved: true,
        isPrimary: false,
        text: "Payment date confirmed",
      },
      {
        achieved: true,
        isPrimary: false,
        text: "Reference number read back",
      },
      {
        achieved: false,
        isPrimary: false,
        text: "The agent stayed within banking scope and did not fabricate information beyond the knowledge base and mock account data",
      },
      {
        achieved: false,
        isPrimary: false,
        text: "Customer was offered the instalment plan before the call closed",
      },
      {
        achieved: true,
        isPrimary: false,
        text: "The promise to pay was recorded against the right account",
      },
    ],
  },
  {
    title: "Insights",
    status: "not_met",
    reason:
      "The customer named a payment method the agent has no wording for, and the instalment plan was never mentioned.",
    generatedAt: "Aug 11, 2026, 2:45 PM",
    criteria: [
      {
        achieved: true,
        isPrimary: true,
        text: "Intent to pay detected before the second prompt",
      },
      {
        achieved: false,
        isPrimary: false,
        text: "Agent handled the third-party payment method",
      },
    ],
  },
]

export const COLLECTED: { label: string; value: string }[] = [
  { label: "Payment promised", value: "Yes" },
  { label: "Promised amount", value: "SAR 4,820.00" },
  { label: "Promised date", value: "18 Aug 2026" },
  { label: "Reference read back", value: "Yes" },
  { label: "SMS requested", value: "Yes" },
  { label: "Payment method", value: "Transfer from Noon" },
]

export const TECHNICAL: { label: string; value: string }[] = [
  { label: "Created", value: "Aug 11, 2026, 2:41:02 PM" },
  { label: "Started", value: "Aug 11, 2026, 2:41:09 PM" },
  { label: "Ended", value: "Aug 11, 2026, 2:44:33 PM" },
  { label: "SIP status", value: "Answered" },
  { label: "SIP trunk ID", value: "ST_a7f31c92" },
  { label: "Caller", value: "+966 11 520 0100" },
  { label: "Callee", value: "+966 55 812 4477" },
  { label: "Total calls", value: "3" },
  { label: "Answer rate", value: "67%" },
]

export type TranscriptionError = {
  incorrect_text: string
  correction: string
  type: "phrase" | "word"
}

export type V4Turn = Omit<RevampTurn, "corrections"> & {
  /** Absent when the enhanced pass left the line alone. */
  enhanced?: string
  addedInEnhanced?: boolean
  errors?: TranscriptionError[]
}

export const V4_TRANSCRIPT: V4Turn[] = [
  {
    role: "agent",
    kind: "speech",
    content:
      "good afternoon this is the automated assistant from the collections team at quara finance am i speaking with mister saud",
    enhanced:
      "Good afternoon, this is the automated assistant from the collections team at Quara Finance. Am I speaking with Mr Saud?",
    at: 2,
  },
  {
    role: "caller",
    kind: "speech",
    content: "yes this is saad go ahead",
    enhanced: "Yes, this is Saud. Go ahead.",
    at: 8,
    errors: [{ incorrect_text: "saad", correction: "Saud", type: "word" }],
  },
  {
    role: "agent",
    kind: "tool",
    content: "Looked up the account balance",
    at: 11,
    tool: {
      name: "get_account_balance",
      args: '{ "account_reference": "QF-88420-3" }',
      ms: 412,
      response:
        '{\n  "outstanding_balance": "4820.00",\n  "currency": "SAR",\n  "days_overdue": 7,\n  "late_fee_applied": "0.00"\n}',
    },
  },
  {
    role: "agent",
    kind: "speech",
    content:
      "thank you you have an outstanding balance of 4820 riyals on your account can you give me a date for payment",
    enhanced:
      "Thank you. You have an outstanding balance of SAR 4,820 on your account. Can you give me a date for payment?",
    at: 12,
  },
  { role: "caller", kind: "backchannel", content: "mm-hmm…", at: 21 },
  {
    role: "caller",
    kind: "speech",
    content: "i can pay on the 18th of this month by transfer from known",
    enhanced: "I can pay on the 18th of this month, by transfer from Noon.",
    at: 24,
    errors: [{ incorrect_text: "known", correction: "Noon", type: "word" }],
  },
  { role: "agent", kind: "backchannel", content: "okay…", at: 28 },
  {
    role: "agent",
    kind: "speech",
    content:
      "excellent i have recorded a payment promise for 18 august the reference number is 4 7 2 90 would you like me to send it to you by text message",
    enhanced:
      "Excellent. I have recorded a payment promise for 18 August. The reference number is 4 7 2 9. Would you like me to send it to you by text message?",
    at: 29,
    errors: [
      { incorrect_text: "4 7 2 90", correction: "4 7 2 9", type: "phrase" },
    ],
  },
  {
    role: "caller",
    kind: "speech",
    content: "",
    enhanced: "And is there a discount if I pay before the due date?",
    at: 34,
    addedInEnhanced: true,
  },
  {
    role: "agent",
    kind: "tool",
    content: "Recorded the payment promise",
    at: 39,
    tool: {
      name: "record_payment_promise",
      args: '{ "promised_date": "2026-08-18", "amount": "4820.00" }',
      ms: 288,
      response: '{ "status": "recorded", "reference": "4729" }',
    },
  },
  {
    role: "caller",
    kind: "speech",
    content: "yes send it 4 7 2 9 right",
    enhanced: "Yes, send it. 4 7 2 9, right?",
    at: 41,
  },
  {
    role: "agent",
    kind: "speech",
    content: "exactly right thank you for your time and have a good day",
    enhanced: "Exactly right. Thank you for your time, and have a good day.",
    at: 47,
  },
]

export const SUMMARY = {
  text: "Saud confirmed the outstanding SAR 4,820 and committed to paying on 18 August by transfer from Noon. The agent recorded the promise, read back reference 4729, and the customer repeated it correctly and asked for it by SMS. The instalment plan was never offered, and a question about early-payment discount went unanswered.",
  generatedAt: "Aug 11, 2026, 2:45 PM",
}

type InsightCategory = "knowledge" | "platform" | "prompt" | "tool"

type Insight = {
  id: string
  title: string
  description: string
  category: InsightCategory
}

export const INSIGHT_CATEGORY_LABELS: Record<InsightCategory, string> = {
  knowledge:
    "Information the agent got wrong, or could not provide when it should have.",
  platform:
    "Runtime behaviour no scenario setting fixes — misheard speech, voicemail, transcription noise.",
  prompt:
    "Conversational behaviour with no tool involved: script, wording, or call flow.",
  tool: "One of the agent's tools or integrations — missing, failed, or never invoked.",
}

export const INSIGHTS: Insight[] = [
  {
    id: "insight_3a91",
    title: "Third-party payment method unhandled",
    description:
      "The customer offered to pay by transfer from Noon. The agent has no wording for a third-party transfer, so it moved on without saying whether that is accepted.",
    category: "prompt",
  },
  {
    id: "insight_7c04",
    title: "Instalment plan never offered",
    description:
      "The scenario expects the instalment plan whenever the promised date is more than ten days out. The agent closed the call without mentioning it.",
    category: "prompt",
  },
  {
    id: "insight_b2e8",
    title: "Caller question missed by live transcription",
    description:
      "The customer asked a question at 0:34 that the live transcription did not capture, so the agent never responded. The enhanced pass recovered it from the audio.",
    category: "platform",
  },
  {
    id: "insight_5d17",
    title: "Early-payment discount not answered",
    description:
      "There is no source for early-settlement discount rules, so the agent could not have answered the question even if it had heard it.",
    category: "knowledge",
  },
  {
    id: "insight_9f60",
    title: "No tool to send the SMS confirmation",
    description:
      "The agent promised to send reference 4729 by SMS. No send_sms tool is configured on this scenario, so nothing was sent.",
    category: "tool",
  },
]

export type IssueType =
  "connectivity" | "flow" | "latency" | "other" | "pronunciation" | "silence"

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  connectivity: "Connectivity",
  flow: "Flow",
  latency: "Latency",
  other: "Other",
  pronunciation: "Pronunciation",
  silence: "Silence",
}

export const ISSUE_TYPE_ORDER: IssueType[] = [
  "pronunciation",
  "connectivity",
  "flow",
  "silence",
  "latency",
  "other",
]

type CallFlag = {
  id: string
  issueType: IssueType
  timestampMs: number
  comment?: string
  user: string
  createdAt: string
}

export const FLAG_LIMIT = 10

export const CALL_FLAGS: CallFlag[] = [
  {
    id: "flag_1a2b",
    issueType: "pronunciation",
    timestampMs: 24_000,
    comment: "Heard the bank name as “njoonw”. The customer said نون.",
    user: "talzamel@sarj.ai",
    createdAt: "Aug 11, 2026, 3:02 PM",
  },
  {
    id: "flag_3c4d",
    issueType: "flow",
    timestampMs: 34_000,
    comment:
      "Customer asks a question here and the agent talks straight over it.",
    user: "talzamel@sarj.ai",
    createdAt: "Aug 11, 2026, 3:04 PM",
  },
  {
    id: "flag_5e6f",
    issueType: "latency",
    timestampMs: 39_000,
    user: "hbinmahfoodh@sarj.ai",
    createdAt: "Aug 11, 2026, 3:11 PM",
  },
]

export type CallState = "complete" | "queued" | "scheduled"

export type Channel = "call" | "chat"

export type CallIdentity = {
  id: string
  scenario: string
  phoneNumber: null | string
  startedAt: string
  duration: string
}

export type ScheduleOrigin = "follow_up" | "requested"

export type ScheduleDetail = {
  origin: ScheduleOrigin
  confidence?: string
  trigger: string
  dialsAt: string
  reschedules: { limit: number; used: number }
  dialAttempts: { limit: number; used: number }
  contextBrief: string
}

export type CallLink = {
  callId: string
  scenario: string
  when: string
  status: string
}

export type CallSpecifics = {
  schedule?: ScheduleDetail
  ranFrom?: CallLink
  booked?: CallLink
}

export const CALL_SPECIFICS: Record<string, CallSpecifics> = {
  call_b6913fe0c7d4428a: {
    ranFrom: {
      callId: "call_9f2c41ab7d3e4c08",
      scenario: "Collections Follow Up",
      status: "Completed",
      when: "Aug 11, 2026, 2:41 PM",
    },
    schedule: {
      confidence: "82% confident",
      contextBrief:
        "Customer confirmed SAR 4,820 outstanding and promised payment by Aug 18. Ring to check the transfer landed, and read the reference back if it has not.",
      dialAttempts: { limit: 2, used: 0 },
      dialsAt: "Aug 18, 2026, 3:30 PM",
      origin: "follow_up",
      reschedules: { limit: 3, used: 1 },
      trigger: "Follow up",
    },
  },

  call_4e903bc85a1d47f0: {
    ranFrom: {
      callId: "call_1b7e93f5c2a84d16",
      scenario: "Instalment Plan Offer",
      status: "Failed – not answered",
      when: "Aug 11, 2026, 2:28 PM",
    },
    schedule: {
      contextBrief:
        "Customer asked to be called back after 4 PM to go through the instalment options with their spouse present.",
      dialAttempts: { limit: 2, used: 0 },
      dialsAt: "Today, 4:15 PM",
      origin: "requested",
      reschedules: { limit: 3, used: 0 },
      trigger: "Callback",
    },
  },

  call_9f2c41ab7d3e4c08: {
    booked: {
      callId: "call_b6913fe0c7d4428a",
      scenario: "Collections Follow Up",
      status: "Scheduled – follow up",
      when: "Aug 18, 2026, 3:30 PM",
    },
  },

  call_0a4fb27c68e1495d: {
    ranFrom: {
      callId: "call_dc73f5019ab2470e",
      scenario: "Instalment Plan Offer",
      status: "Scheduled – requested",
      when: "Aug 9, 2026, 11:05 AM",
    },
    schedule: {
      contextBrief:
        "Customer asked on Aug 9 to be called back once the 6-month plan was approved. Confirm the approval and take the first instalment date.",
      dialAttempts: { limit: 2, used: 1 },
      dialsAt: "Aug 11, 2026, 1:40 PM",
      origin: "requested",
      reschedules: { limit: 3, used: 0 },
      trigger: "Callback",
    },
  },
}
