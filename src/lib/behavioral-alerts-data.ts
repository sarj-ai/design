/**
 * Post-call behavioural alerts — the data the two halves of this mockup read.
 *
 * The shapes mirror what the PRD describes the pipeline writing: alerts
 * configured per scenario, and one detection row per alert the post-call
 * analyst found, each carrying the transcript quote it was found in.
 *
 * Two three-step scales live here and they are not the same scale:
 *
 *   priority   Low / Medium / High      set by the admin, per alert, once
 *   severity   Mild / Moderate / Severe  set by the analyst, per detection
 *
 * A High-priority alert can be detected at Mild severity — "how much I care
 * about this pattern" and "how bad it was on this call" are separate readings.
 */

/* ------------------------------------------------------------ configuration */

export type AlertPriority = "high" | "low" | "medium"

export const PRIORITY_LABELS: Record<AlertPriority, string> = {
  high: "High",
  low: "Low",
  medium: "Medium",
}

/** Ordered loudest first, which is the order the priority select offers. */
export const PRIORITY_ORDER: AlertPriority[] = ["high", "medium", "low"]

export type ConfiguredAlert = {
  /** Plain-language brief for the analyst — what to look for in a transcript. */
  description: string
  /** Paused rather than deleted: the definition survives, detection stops. */
  enabled: boolean
  id: string
  name: string
  priority: AlertPriority
}

/**
 * What the sales scenario watches for.
 *
 * Five is the realistic number: enough that the list has to be scannable, few
 * enough that an admin still knows every one of them by name.
 */
export const CONFIGURED_ALERTS: ConfiguredAlert[] = [
  {
    id: "escalation",
    name: "Escalation request",
    description:
      "The caller asks to speak to a manager, a supervisor, or a human agent, or says they want this handled by someone else.",
    priority: "high",
    enabled: true,
  },
  {
    id: "pricing",
    name: "Pricing frustration",
    description:
      "The caller pushes back on price — calls it expensive, says it went up, or compares it against another dealer.",
    priority: "high",
    enabled: true,
  },
  {
    id: "walk-away",
    name: "Threatening to walk away",
    description:
      "The caller says they will buy elsewhere, cancel their interest, or end the conversation without a next step.",
    priority: "high",
    enabled: true,
  },
  {
    id: "confusion",
    name: "Confusion about next steps",
    description:
      "The caller says they do not understand what happens next, or asks the same question a second time.",
    priority: "medium",
    enabled: true,
  },
  {
    id: "repeat-contact",
    name: "Repeat contact",
    description:
      "The caller mentions they have already called or messaged about this and nobody came back to them.",
    priority: "low",
    enabled: false,
  },
]

/* ---------------------------------------------------------------- detection */

export type AlertSeverity = "mild" | "moderate" | "severe"

export const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  mild: "Mild",
  moderate: "Moderate",
  severe: "Severe",
}

/** Worst first — the order the detections list sorts into. */
export const SEVERITY_ORDER: AlertSeverity[] = ["severe", "moderate", "mild"]

export type Detection = {
  /** The alert this detection is against, so the row can name it. */
  alertId: string
  /**
   * Seconds into the recording where the evidence was said. It is what puts
   * the detection on the waveform and what a click on it seeks to — a quote
   * nobody can find in the call is a quote nobody can check.
   */
  at: number
  /** Why the analyst assigned this severity rather than the one below it. */
  explanation: string
  /**
   * A direct quote from the transcript. The PRD makes this required precisely
   * so a detection cannot be asserted without something to check it against.
   */
  evidence: string
  id: string
  severity: AlertSeverity
}

export type Sentiment = "angry" | "frustrated" | "neutral" | "positive"

export const SENTIMENT_LABELS: Record<Sentiment, string> = {
  angry: "Angry",
  frustrated: "Frustrated",
  neutral: "Neutral",
  positive: "Positive",
}

export type UserJourney = {
  /** Keywords the analyst pulled from the transcript, in the caller's words. */
  keywords: string[]
  /** What the caller rang for, in one line. */
  purpose: string
  purposeAchieved: boolean
  /** 1–5. */
  rating: number
  /** Why that rating and not the one above it. Read from the (i). */
  ratingRationale: string
  sentiment: Sentiment
}

/**
 * What the tab has to show, which is four different things and not one thing
 * with holes in it.
 *
 *   detected        journey, and at least one alert fired
 *   clear           journey, alerts configured, none of them fired
 *   unconfigured    journey, and no alerts configured on this scenario at all
 *   pending         the background task has not written its result yet
 *   unavailable     no transcript, so the analyst skipped the call entirely
 */
export type AnalysisState =
  "clear" | "detected" | "pending" | "unavailable" | "unconfigured"

export type AlertAnalysis = {
  detections: Detection[]
  /** Absent on `pending` and `unavailable`; present on every other state. */
  journey: null | UserJourney
  state: AnalysisState
}

/* --------------------------------------------------------------- the calls */

export type TranscriptLine = {
  /** Seconds into the recording, so a turn and the waveform agree. */
  at: number
  speaker: "agent" | "caller"
  text: string
}

export type CallRow = {
  callId: string
  /** Collected data the Details tab prints, as the scenario defined it. */
  collected: { label: string; value: string }[]
  createdAt: string
  direction: "inbound" | "outbound"
  /** Seconds — the player's total, and the connection duration in the rail. */
  duration: number
  endedAt: string
  id: string
  language: string
  /** The alert analysis this call carries. One state per row, on purpose. */
  analysis: AlertAnalysis
  outcome: {
    reason: string
    status: "failure" | "success"
    criteria: { achieved: boolean; primary: boolean; text: string }[]
  }
  phoneNumber: string
  scenario: string
  startedAt: string
  status: "completed" | "voicemail"
  transcript: TranscriptLine[]
}

const SALES_TRANSCRIPT: TranscriptLine[] = [
  {
    at: 2,
    speaker: "agent",
    text: "Good afternoon, this is Reem from Al Futtaim Performance. How can I help you today?",
  },
  {
    at: 7,
    speaker: "caller",
    text: "Hi. I filled the form on your site about the GR Yaris and nobody called me back, so I'm calling.",
  },
  {
    at: 14,
    speaker: "agent",
    text: "I'm sorry about that. I can go through the GR Yaris with you now. Are you looking at the standard or the Circuit pack?",
  },
  {
    at: 21,
    speaker: "caller",
    text: "Circuit pack. What's the on-road price now?",
  },
  {
    at: 26,
    speaker: "agent",
    text: "The Circuit pack is 189,900 dirhams on the road for the 2026 model year.",
  },
  {
    at: 33,
    speaker: "caller",
    text: "That's twelve thousand more than what your own website said last month. That's ridiculous, honestly.",
  },
  {
    at: 41,
    speaker: "agent",
    text: "The 2026 model year came with a price revision. I can send you the current breakdown by email.",
  },
  {
    at: 48,
    speaker: "caller",
    text: "Look, can you put me through to a manager? I don't think you can do anything about the price.",
  },
  {
    at: 55,
    speaker: "agent",
    text: "I can note your request and have the sales manager call you back within one working day.",
  },
  {
    at: 61,
    speaker: "caller",
    text: "Fine. But if it stays at that number I'll just go to the Sharjah dealer, they were closer anyway.",
  },
  {
    at: 69,
    speaker: "agent",
    text: "Understood. I've logged a callback from the sales manager and I'll email you the breakdown now. Anything else I can help with?",
  },
  { at: 75, speaker: "caller", text: "No, that's it." },
]

const SERVICE_TRANSCRIPT: TranscriptLine[] = [
  {
    at: 2,
    speaker: "agent",
    text: "Hello, this is a service reminder from Al Futtaim Performance. Am I speaking with Noura?",
  },
  { at: 7, speaker: "caller", text: "Yes, speaking." },
  {
    at: 9,
    speaker: "agent",
    text: "Your Supra is due for its 20,000 kilometre service. Would Thursday morning work?",
  },
  {
    at: 16,
    speaker: "caller",
    text: "Thursday is good. Around nine if you have it.",
  },
  {
    at: 20,
    speaker: "agent",
    text: "Nine o'clock Thursday is booked. You'll get a confirmation by SMS in a moment.",
  },
  {
    at: 27,
    speaker: "caller",
    text: "Perfect, thank you. That was quick.",
  },
]

const ARABIC_TRANSCRIPT: TranscriptLine[] = [
  {
    at: 2,
    speaker: "agent",
    text: "أهلاً وسهلاً، معك ريم من الفطيم بيرفورمانس. كيف أقدر أساعدك؟",
  },
  {
    at: 8,
    speaker: "caller",
    text: "أبغى أعرف دوام المعرض يوم الجمعة.",
  },
  {
    at: 13,
    speaker: "agent",
    text: "المعرض يفتح الجمعة من الساعة اثنين ظهراً إلى عشر مساءً.",
  },
  {
    at: 20,
    speaker: "caller",
    text: "طيب أنا اتصلت أمس وقالوا لي وقت ثاني، ما فهمت وش الصحيح.",
  },
  {
    at: 28,
    speaker: "agent",
    text: "أعتذر عن اللبس. الدوام الحالي هو من اثنين ظهراً إلى عشر مساءً، وبرسل لك رسالة فيها المواعيد.",
  },
  { at: 36, speaker: "caller", text: "تمام، شكراً." },
]

/**
 * Six calls, one per state the alerts tab has to be reviewed in — including
 * the two that look like nothing is there and are not the same nothing.
 *
 * Clicking a row opens that row's call, so the drawer's header, rail, outcome
 * and transcript all belong to the row that was pressed rather than to one
 * sample call standing in for six.
 */
export const CALLS: CallRow[] = [
  {
    id: "call-1",
    callId: "3399fc3d-ef83-4cfa-a1b2-22fec3548f13",
    scenario: "Performance car sales inquiry",
    phoneNumber: "+971 50 774 2210",
    direction: "inbound",
    status: "completed",
    language: "English",
    createdAt: "Apr 26, 2026 at 04:13:51 PM",
    startedAt: "Apr 26, 2026 at 04:13:58 PM",
    endedAt: "Apr 26, 2026 at 04:15:16 PM",
    duration: 78,
    transcript: SALES_TRANSCRIPT,
    collected: [
      { label: "model_of_interest", value: "GR Yaris Circuit pack" },
      { label: "budget_stated", value: "Not given" },
      { label: "callback_requested", value: "true" },
    ],
    outcome: {
      status: "failure",
      reason:
        "The agent identified the car of interest and answered the pricing question, but the call failed its primary criterion — no test drive or brochure was offered before the caller ended the conversation.",
      criteria: [
        {
          text: "Offer a test drive or send a brochure",
          achieved: false,
          primary: true,
        },
        {
          text: "Identify the model of interest",
          achieved: true,
          primary: false,
        },
        {
          text: "Capture a callback preference",
          achieved: true,
          primary: false,
        },
      ],
    },
    analysis: {
      state: "detected",
      journey: {
        sentiment: "frustrated",
        rating: 2,
        ratingRationale:
          "The caller got a clear answer on price but left without the callback they asked for being confirmed to a time.",
        purpose:
          "Get an on-road price for the GR Yaris Circuit pack after a web form went unanswered",
        purposeAchieved: true,
        keywords: ["impatient", "price-sensitive", "comparing", "direct"],
      },
      detections: [
        {
          id: "detection-1",
          at: 33,
          alertId: "pricing",
          severity: "severe",
          evidence:
            "That's twelve thousand more than what your own website said last month. That's ridiculous, honestly.",
          explanation:
            "Severe rather than moderate: the caller is not asking about the price, they are disputing it against a figure the company published, and the objection carries into every turn after it.",
        },
        {
          id: "detection-2",
          at: 48,
          alertId: "escalation",
          severity: "severe",
          evidence:
            "Look, can you put me through to a manager? I don't think you can do anything about the price.",
          explanation:
            "An explicit, unprompted request for a manager mid-call. The agent could only offer a callback, so the request was never met on the line.",
        },
        {
          id: "detection-3",
          at: 61,
          alertId: "walk-away",
          severity: "moderate",
          evidence:
            "But if it stays at that number I'll just go to the Sharjah dealer, they were closer anyway.",
          explanation:
            "Moderate rather than severe: the caller names a competing dealer but makes it conditional on the price holding, so the intent to leave is stated rather than acted on.",
        },
      ],
    },
  },
  {
    id: "call-2",
    callId: "a7f2109c-4b6e-4d21-9f88-1c30de77b402",
    scenario: "Service booking reminder",
    phoneNumber: "+971 55 318 9047",
    direction: "outbound",
    status: "completed",
    language: "English",
    createdAt: "Apr 26, 2026 at 11:02:14 AM",
    startedAt: "Apr 26, 2026 at 11:02:31 AM",
    endedAt: "Apr 26, 2026 at 11:03:09 AM",
    duration: 38,
    transcript: SERVICE_TRANSCRIPT,
    collected: [
      { label: "service_slot", value: "Thursday 09:00" },
      { label: "vehicle", value: "GR Supra 2024" },
    ],
    outcome: {
      status: "success",
      reason:
        "The caller accepted the first slot offered and the booking was confirmed on the call.",
      criteria: [
        { text: "Book a service slot", achieved: true, primary: true },
        { text: "Confirm the vehicle on file", achieved: true, primary: false },
      ],
    },
    analysis: {
      state: "clear",
      journey: {
        sentiment: "positive",
        rating: 5,
        ratingRationale:
          "One slot offered, one slot accepted, confirmation sent on the call — nothing was left for the caller to chase.",
        purpose: "Book the 20,000 km service for a GR Supra",
        purposeAchieved: true,
        keywords: ["cooperative", "brief", "satisfied"],
      },
      detections: [],
    },
  },
  {
    id: "call-3",
    callId: "c04b7e51-9a13-4f70-8e2d-6b81aa4c9d55",
    scenario: "Showroom hours inquiry",
    phoneNumber: "+966 53 220 8814",
    direction: "inbound",
    status: "completed",
    language: "Arabic",
    createdAt: "Apr 26, 2026 at 09:41:03 AM",
    startedAt: "Apr 26, 2026 at 09:41:11 AM",
    endedAt: "Apr 26, 2026 at 09:41:54 AM",
    duration: 43,
    transcript: ARABIC_TRANSCRIPT,
    collected: [{ label: "question_topic", value: "Opening hours" }],
    outcome: {
      status: "success",
      reason:
        "The caller asked for Friday opening hours and was given them, with a follow-up message offered.",
      criteria: [
        { text: "Answer the caller's question", achieved: true, primary: true },
      ],
    },
    analysis: {
      state: "detected",
      journey: {
        sentiment: "neutral",
        rating: 4,
        ratingRationale:
          "The caller got the answer they rang for, but only after being given a different answer the day before.",
        purpose: "Confirm the showroom's Friday opening hours",
        purposeAchieved: true,
        keywords: ["uncertain", "polite", "brief"],
      },
      detections: [
        {
          id: "detection-4",
          at: 20,
          alertId: "confusion",
          severity: "mild",
          evidence: "طيب أنا اتصلت أمس وقالوا لي وقت ثاني، ما فهمت وش الصحيح.",
          explanation:
            "Mild: the caller reports being told different hours yesterday, but accepts the correction immediately and does not raise it again.",
        },
      ],
    },
  },
  {
    id: "call-4",
    callId: "5e18c2a0-77bd-4c39-b6f1-90ac2e5b7133",
    scenario: "Trade-in valuation follow up",
    phoneNumber: "+971 52 604 1178",
    direction: "outbound",
    status: "completed",
    language: "English",
    createdAt: "Apr 26, 2026 at 04:22:40 PM",
    startedAt: "Apr 26, 2026 at 04:22:55 PM",
    endedAt: "Apr 26, 2026 at 04:24:31 PM",
    duration: 96,
    transcript: SERVICE_TRANSCRIPT,
    collected: [{ label: "valuation_band", value: "AED 62,000 – 68,000" }],
    outcome: {
      status: "success",
      reason:
        "The caller accepted the valuation band and agreed to bring the car in for inspection.",
      criteria: [
        {
          text: "Agree an inspection appointment",
          achieved: true,
          primary: true,
        },
      ],
    },
    analysis: { state: "pending", journey: null, detections: [] },
  },
  {
    id: "call-5",
    callId: "b93df407-2c5a-41e8-a0c7-4de6f1928ab0",
    scenario: "Finance pre-approval check",
    phoneNumber: "+971 56 449 3302",
    direction: "outbound",
    status: "completed",
    language: "English",
    createdAt: "Apr 25, 2026 at 02:10:07 PM",
    startedAt: "Apr 25, 2026 at 02:10:19 PM",
    endedAt: "Apr 25, 2026 at 02:11:48 PM",
    duration: 89,
    transcript: SERVICE_TRANSCRIPT,
    collected: [{ label: "pre_approval", value: "Approved in principle" }],
    outcome: {
      status: "success",
      reason:
        "Pre-approval was confirmed and the documents to bring were read back to the caller.",
      criteria: [
        { text: "Confirm pre-approval status", achieved: true, primary: true },
      ],
    },
    analysis: {
      state: "unconfigured",
      journey: {
        sentiment: "neutral",
        rating: 4,
        ratingRationale:
          "The caller got their approval status but had to ask twice which documents to bring.",
        purpose: "Check whether a finance pre-approval had come through",
        purposeAchieved: true,
        keywords: ["businesslike", "thorough", "brief"],
      },
      detections: [],
    },
  },
  {
    id: "call-6",
    callId: "1d7ac6f9-b0e2-4a55-9c31-77e0b3aa4165",
    scenario: "Test drive confirmation",
    phoneNumber: "+971 50 118 7726",
    direction: "outbound",
    status: "voicemail",
    language: "English",
    createdAt: "Apr 25, 2026 at 10:05:52 AM",
    startedAt: "Apr 25, 2026 at 10:06:04 AM",
    endedAt: "Apr 25, 2026 at 10:06:10 AM",
    duration: 6,
    transcript: [],
    collected: [],
    outcome: {
      status: "failure",
      reason: "The call reached voicemail and ended before anyone spoke.",
      criteria: [
        { text: "Confirm the test drive slot", achieved: false, primary: true },
      ],
    },
    analysis: { state: "unavailable", journey: null, detections: [] },
  },
]

/** The scenario the drawer's alerts are configured against. */
export const SCENARIO_NAME = "Performance car sales inquiry"

/** Who is signed in, for the metadata rail. */
export const OWNER = {
  email: "talzamel@sarj.ai",
  organization: "Sarj.ai",
  organizationId: "cd9ebc10-4e18-4a92-b7d1-2f5c88e70a75",
  userId: "17f2454d-8a11-4d6c-b0e9-3f61ca4e4241",
}
