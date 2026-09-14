/**
 * The scenario the one-screen editor is showing.
 *
 * Every field here maps to something the scenario editor already stores today
 * — first message, prompt, template variables, data extraction, record sinks,
 * languages, timezone, knowledge bases, persona per language, success
 * criteria, tools, AI notes and the two Sarj-staff surfaces. Nothing is
 * invented; the mockup only changes where each one is read and edited.
 */

export type LanguageCode = "ar" | "en" | "ur"

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  ar: "Arabic",
  en: "English",
  ur: "Urdu",
}

/** Short form for the language switch, which sits in a narrow row. */
export const LANGUAGE_SHORT: Record<LanguageCode, string> = {
  ar: "AR",
  en: "EN",
  ur: "UR",
}

export const SCENARIO = {
  calls: 1624,
  createdAt: "12 Feb 2026",
  lastPublished: "2 days ago",
  name: "Reservation Assistant for Sizzler",
  status: "active" as const,
  successRate: 76,
}

/* ---------------------------------------------------------------- prompt -- */

export interface PerLanguage {
  firstMessage: string
  firstMessageEnabled: boolean
  language: LanguageCode
  /** Persona driving the voice for this language. */
  persona: string
  prompt: string
  removed?: boolean
}

const EN_PROMPT = `# Agent identity & purpose
You are {{agent_name}}, a professional and welcoming reservation assistant for Sizzler, a fine dining restaurant.

# Scope limitation
Your only function is to assist with restaurant reservations. If asked about anything else, say: "I'm sorry, I can only assist with restaurant reservations."

# Business context
Secure the table reservation while keeping the experience high-end. Collect the details, confirm the booking, escalate specific cases to a manager.

# Conversation flow
Greet the guest.
Collect party size, then date, then time.
Offer to note a special occasion or dietary needs.
Read the booking back for confirmation.
Give the confirmation number and close in your own words.

# Tone & style
Warm but efficient. Short sentences. Never rush the guest, never re-ask a detail already given.

# Escalation
Transfer to a manager for parties over 12, same-day cancellations inside 2 hours, and any complaint about a previous visit.`

const AR_PROMPT = `# هوية الوكيل والغرض منه
أنت {{agent_name}}، مساعد حجوزات محترف ومرحب لمطعم سيزلر، وهو مطعم راقٍ.

# حدود النطاق
مهمتك الوحيدة هي المساعدة في حجوزات المطعم. إذا سُئلت عن أي شيء آخر، قل: "عذرًا، يمكنني المساعدة في حجوزات المطعم فقط."

# سير المحادثة
رحّب بالضيف.
اجمع عدد الأشخاص، ثم التاريخ، ثم الوقت.
اعرض تسجيل مناسبة خاصة أو احتياجات غذائية.
أعد قراءة الحجز للتأكيد.
أعطِ رقم التأكيد وأنهِ المكالمة بأسلوبك.`

const UR_PROMPT = `# ایجنٹ کی شناخت اور مقصد
آپ {{agent_name}} ہیں، سِزلر کے لیے ایک پیشہ ور اور خوش آمدید کہنے والے ریزرویشن اسسٹنٹ۔

# دائرہ کار کی حد
آپ کا واحد کام ریسٹورنٹ کی بکنگ میں مدد کرنا ہے۔ کسی اور چیز کے بارے میں پوچھے جانے پر کہیں: "معذرت، میں صرف ریسٹورنٹ کی بکنگ میں مدد کر سکتا ہوں۔"

# گفتگو کا سلسلہ
مہمان کو خوش آمدید کہیں۔
افراد کی تعداد، پھر تاریخ، پھر وقت پوچھیں۔
بکنگ دہرا کر تصدیق کریں۔`

export const PER_LANGUAGE: PerLanguage[] = [
  {
    firstMessage:
      "Thank you for calling {{company_name}}. My name is {{agent_name}}. How can I help you today?",
    firstMessageEnabled: true,
    language: "en",
    persona: "Noura — Warm, Gulf English",
    prompt: EN_PROMPT,
  },
  {
    firstMessage:
      "شكرًا لاتصالك بـ {{company_name}}. معك {{agent_name}}. كيف أقدر أساعدك؟",
    firstMessageEnabled: true,
    language: "ar",
    persona: "Layla — Warm, Saudi Arabic",
    prompt: AR_PROMPT,
  },
  {
    firstMessage:
      "{{company_name}} پر کال کرنے کا شکریہ۔ میں {{agent_name}} ہوں۔ میں آپ کی کیا مدد کر سکتا ہوں؟",
    firstMessageEnabled: false,
    language: "ur",
    persona: "Imran — Neutral, Urdu",
    prompt: UR_PROMPT,
  },
]

/** English is the scenario's default language. */
export const DEFAULT_LANGUAGE: LanguageCode = "en"

export const TIMEZONE = "Asia/Riyadh"

/* ------------------------------------------------------ template variables -- */

export interface TemplateVariable {
  defaultValue: string
  name: string
  required: boolean
  type: "boolean" | "date" | "number" | "text"
  /** Which language prompts reference it. */
  usedIn: LanguageCode[]
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  {
    defaultValue: "",
    name: "guest_name",
    required: true,
    type: "text",
    usedIn: ["ar", "en", "ur"],
  },
  {
    defaultValue: "None",
    name: "loyalty_status",
    required: true,
    type: "text",
    usedIn: ["ar", "en", "ur"],
  },
  {
    defaultValue: "Sizzler",
    name: "company_name",
    required: true,
    type: "text",
    usedIn: ["ar", "en", "ur"],
  },
  {
    defaultValue: "",
    name: "last_visit_date",
    required: false,
    type: "date",
    usedIn: ["en"],
  },
  {
    defaultValue: "0",
    name: "outstanding_credit",
    required: false,
    type: "number",
    usedIn: ["en"],
  },
]

/* -------------------------------------------------------- data extraction -- */

export interface ExtractionField {
  description: string
  name: string
  required: boolean
  type: "boolean" | "date" | "number" | "text"
}

export const DATA_EXTRACTION = {
  enabled: true,
  fields: [
    {
      description: "How many people the table is booked for.",
      name: "party_size",
      required: true,
      type: "number" as const,
    },
    {
      description: "Date the guest asked for, normalised to ISO.",
      name: "booking_date",
      required: true,
      type: "date" as const,
    },
    {
      description: "Sitting time in the restaurant's local timezone.",
      name: "booking_time",
      required: true,
      type: "text" as const,
    },
    {
      description:
        "Birthday, anniversary or similar, if the guest offered one.",
      name: "special_occasion",
      required: false,
      type: "text" as const,
    },
    {
      description: "Allergies and dietary needs mentioned on the call.",
      name: "dietary_notes",
      required: false,
      type: "text" as const,
    },
    {
      description: "True when the guest confirmed the booking read-back.",
      name: "confirmed",
      required: true,
      type: "boolean" as const,
    },
  ] satisfies ExtractionField[],
}

/* -------------------------------------------------------- data destinations -- */

export interface Destination {
  connected: boolean
  description: string
  enabled: boolean
  label: string
  type: "webhook" | "zoho-crm" | "zoho-desk"
}

export const DESTINATIONS: Destination[] = [
  {
    connected: true,
    description: "Write the extracted fields onto the matching CRM record.",
    enabled: true,
    label: "Zoho CRM",
    type: "zoho-crm",
  },
  {
    connected: true,
    description: "Open a ticket when the call ends unresolved.",
    enabled: false,
    label: "Zoho Desk",
    type: "zoho-desk",
  },
  {
    connected: false,
    description: "POST the extracted payload to a URL you own.",
    enabled: false,
    label: "Webhook",
    type: "webhook",
  },
]

/** Call recording delivery — the record-sinks section as it stands today. */
export const RECORD_SINKS = {
  zohoCallActivity: true,
}

/* ------------------------------------------------------- knowledge bases -- */

export interface KnowledgeBase {
  attached: boolean
  documents: number
  /** Languages the base has content for. */
  languages: LanguageCode[]
  name: string
}

export const KNOWLEDGE_BASES: KnowledgeBase[] = [
  {
    attached: true,
    documents: 12,
    languages: ["ar", "en"],
    name: "Sizzler menu & allergens",
  },
  {
    attached: true,
    documents: 4,
    languages: ["ar", "en", "ur"],
    name: "Branch hours & locations",
  },
  {
    attached: true,
    documents: 7,
    languages: ["en"],
    name: "Reservation policy",
  },
  {
    attached: false,
    documents: 23,
    languages: ["ar", "en"],
    name: "Loyalty programme FAQ",
  },
  {
    attached: false,
    documents: 9,
    languages: ["ar"],
    name: "Private dining packages",
  },
]

/* -------------------------------------------------------- success criteria -- */

export interface SuccessCriterion {
  primary: boolean
  text: string
}

export const SUCCESS_CRITERIA: SuccessCriterion[] = [
  {
    primary: true,
    text: "Successfully collected the guest's core booking requirements — party size, date and time — and read them back before confirming.",
  },
  {
    primary: false,
    text: "Offered to record a special occasion or dietary requirement, and gave the guest a confirmation number before closing.",
  },
]

/* ------------------------------------------------------------------ tools -- */

export type ToolSlug =
  | "code-switching"
  | "collect-digits"
  | "custom-api"
  | "end-call"
  | "ivr-navigation"
  | "salla-tools"
  | "transfer-to-human"
  | "voicemail-detection"
  | "zoho-desk-create-ticket"

export interface Tool {
  description: string
  enabled: boolean
  label: string
  /** One line of the tool's own configuration, shown once it is on. */
  summary?: string
  slug: ToolSlug
}

export const TOOLS: Tool[] = [
  {
    description:
      "End the call once the booking is confirmed or the guest hangs up.",
    enabled: true,
    label: "End the Call",
    summary: "Closing phrase: “Thanks for calling Sizzler, see you soon.”",
    slug: "end-call",
  },
  {
    description: "Hand the call to a person on your team.",
    enabled: true,
    label: "Transfer to a Human Agent",
    summary: "Reservations desk · +966 11 000 0000 · warm transfer",
    slug: "transfer-to-human",
  },
  {
    description: "Let the agent switch languages mid-conversation.",
    enabled: true,
    label: "Switch Language",
    summary: "English ⇄ Arabic ⇄ Urdu",
    slug: "code-switching",
  },
  {
    description: "Detect an answering machine and leave a message instead.",
    enabled: true,
    label: "Voicemail Detection",
    summary: "Leave a message, then end the call",
    slug: "voicemail-detection",
  },
  {
    description: "Collect a number the guest types on the keypad.",
    enabled: false,
    label: "Collect Digits",
    slug: "collect-digits",
  },
  {
    description: "Make a custom HTTP call during the conversation.",
    enabled: false,
    label: "HTTP Request",
    slug: "custom-api",
  },
  {
    description: "Navigate another party's phone menu.",
    enabled: false,
    label: "IVR Navigation",
    slug: "ivr-navigation",
  },
  {
    description: "Look up orders and products from a Salla store.",
    enabled: false,
    label: "Salla E-Commerce",
    slug: "salla-tools",
  },
  {
    description: "Open a Zoho Desk ticket from the call.",
    enabled: false,
    label: "Create a ticket on ZohoDesk",
    slug: "zoho-desk-create-ticket",
  },
]

/* ----------------------------------------------------------- personas -- */

export const PERSONAS = [
  "Noura — Warm, Gulf English",
  "Layla — Warm, Saudi Arabic",
  "Imran — Neutral, Urdu",
  "Faisal — Formal, Gulf English",
  "Huda — Bright, Egyptian Arabic",
]

/* --------------------------------------------------------------- insights -- */

/** Where an insight points, so the rail row it belongs to can be highlighted. */
export type InsightTarget =
  "criteria" | "extraction" | "knowledge" | "prompt" | "tools"

export interface Insight {
  body: string
  calls: number
  target: InsightTarget
  title: string
}

export const INSIGHTS: Insight[] = [
  {
    body: "Guests ask for a high chair on 1 in 6 calls and the agent has nothing to say. Add it to the details it offers to note.",
    calls: 268,
    target: "prompt",
    title: "Add high chairs to the special-request step",
  },
  {
    body: "The agent quotes a 15-minute hold on late arrivals. The policy base says 20. Reattach the reservation policy or correct the prompt.",
    calls: 141,
    target: "knowledge",
    title: "Late-arrival grace period is stated wrong",
  },
  {
    body: "72 calls ended with the guest asking to change a booking. There is no tool for it, so every one transferred to a person.",
    calls: 72,
    target: "tools",
    title: "Booking changes always transfer out",
  },
  {
    body: "dietary_notes came back empty on 84% of calls where the guest mentioned an allergy out loud. The field description is too narrow.",
    calls: 213,
    target: "extraction",
    title: "Dietary notes are being missed",
  },
  {
    body: "Criterion 2 counts a call successful without a confirmation number. 19% of “successful” calls never gave one.",
    calls: 96,
    target: "criteria",
    title: "Second criterion passes calls with no confirmation",
  },
]

/** Total the header shows; the drawer lists the ones with a written note. */
export const UNRESOLVED_INSIGHTS = 41

/* ---------------------------------------------------- Sarj staff surfaces -- */

export interface Opportunity {
  detail: string
  impact: "high" | "low" | "medium"
  title: string
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    detail:
      "The scope-limitation block repeats in all three prompts. Moving it to a global prompt cuts 380 tokens a call.",
    impact: "high",
    title: "Deduplicate the scope block into a global prompt",
  },
  {
    detail:
      "Urdu has run 11 calls in 90 days. Removing it drops a prompt, a persona and a knowledge base from every publish.",
    impact: "medium",
    title: "Urdu is configured but barely used",
  },
  {
    detail:
      "Two of the three attached bases answer the same menu questions. Retrieval picks the wrong one on 8% of calls.",
    impact: "low",
    title: "Menu content overlaps across two bases",
  },
]

export const ORGANIZATIONS = [
  "Sizzler KSA",
  "Sizzler UAE",
  "Americana Restaurants",
  "Sarj Internal",
]

export const CURRENT_ORGANIZATION = "Sizzler KSA"
