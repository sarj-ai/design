import type { LanguageCode } from "@/lib/mockups/scenario-single-screen-data"

type SectionId = "context" | "escalation" | "identity" | "scope" | "tone"

interface SectionMeta {
  example: string
  heading: string
  help: string
  id: SectionId
  label: string
}

export const SECTION_META: SectionMeta[] = [
  {
    example:
      "You are Noura, the reservations assistant for Sizzler, a fine dining restaurant.",
    heading: "Agent identity & purpose",
    help: "The name it gives, who it works for, and what it is there to do.",
    id: "identity",
    label: "Who the agent is",
  },
  {
    example:
      "Only help with reservations. For anything else say: “I'm sorry, I can only assist with restaurant reservations.”",
    heading: "Scope limitation",
    help: "Give it the exact words to use when a caller asks for something else.",
    id: "scope",
    label: "What it should refuse",
  },
  {
    example:
      "Secure the booking while keeping the experience high-end. Collect the details and confirm.",
    heading: "Business context",
    help: "What a good call achieves for the business.",
    id: "context",
    label: "What a good call looks like",
  },
  {
    example: "Warm but efficient. Short sentences. Never rush the guest.",
    heading: "Tone & style",
    help: "Plain words work better than a list of adjectives.",
    id: "tone",
    label: "How it should sound",
  },
  {
    example: "Transfer to a manager for parties over 12, or any complaint.",
    heading: "Escalation",
    help: "The calls a person should take. The agent handles everything else itself.",
    id: "escalation",
    label: "When to hand over to a person",
  },
]

export const FLOW_META = {
  example: "Greet the guest",
  heading: "Conversation flow",
  help: "The agent works down these in order. One instruction per step.",
  label: "How the call should go",
}

export interface SectionedPrompt {
  context: string
  escalation: string
  flow: string[]
  identity: string
  language: LanguageCode
  scope: string
  tone: string
}

export const SECTIONED_PROMPTS: SectionedPrompt[] = [
  {
    context:
      "Secure the table reservation while keeping the experience high-end. Collect the details, confirm the booking, escalate specific cases to a manager.",
    escalation:
      "Transfer to a manager for parties over 12, same-day cancellations inside 2 hours, and any complaint about a previous visit.",
    flow: [
      "Greet the guest.",
      "Collect party size, then date, then time.",
      "Offer to note a special occasion or dietary needs.",
      "Read the booking back for confirmation.",
      "Give the confirmation number and close in your own words.",
    ],
    identity:
      "You are {{agent_name}}, a professional and welcoming reservation assistant for Sizzler, a fine dining restaurant.",
    language: "en",
    scope:
      'Your only function is to assist with restaurant reservations. If asked about anything else, say: "I\'m sorry, I can only assist with restaurant reservations."',
    tone: "Warm but efficient. Short sentences. Never rush the guest, never re-ask a detail already given.",
  },
  {
    context: "",
    escalation: "",
    flow: [
      "رحّب بالضيف.",
      "اجمع عدد الأشخاص، ثم التاريخ، ثم الوقت.",
      "اعرض تسجيل مناسبة خاصة أو احتياجات غذائية.",
      "أعد قراءة الحجز للتأكيد.",
      "أعطِ رقم التأكيد وأنهِ المكالمة بأسلوبك.",
    ],
    identity:
      "أنت {{agent_name}}، مساعد حجوزات محترف ومرحب لمطعم سيزلر، وهو مطعم راقٍ.",
    language: "ar",
    scope:
      'مهمتك الوحيدة هي المساعدة في حجوزات المطعم. إذا سُئلت عن أي شيء آخر، قل: "عذرًا، يمكنني المساعدة في حجوزات المطعم فقط."',
    tone: "",
  },
  {
    context: "",
    escalation: "",
    flow: [],
    identity:
      "آپ {{agent_name}} ہیں، سِزلر کے لیے ایک پیشہ ور اور خوش آمدید کہنے والے ریزرویشن اسسٹنٹ۔",
    language: "ur",
    scope:
      'آپ کا واحد کام ریسٹورنٹ کی بکنگ میں مدد کرنا ہے۔ کسی اور چیز کے بارے میں پوچھے جانے پر کہیں: "معذرت، میں صرف ریسٹورنٹ کی بکنگ میں مدد کر سکتا ہوں۔"',
    tone: "",
  },
]

/** What the model is sent. Empty sections are left out: a bare heading reads to the model as an instruction. */
export function assemblePrompt(prompt: SectionedPrompt): string {
  const blocks: string[] = []

  for (const meta of SECTION_META) {
    /* v1's markdown interleaves Flow by heading order, so it gets its own slot rather than going at the end. */
    if (meta.id === "context") {
      if (prompt.context.trim()) {
        blocks.push(`# ${meta.heading}\n${prompt.context.trim()}`)
      }
      if (prompt.flow.length) {
        blocks.push(`# ${FLOW_META.heading}\n${prompt.flow.join("\n")}`)
      }
      continue
    }

    const body = prompt[meta.id].trim()
    if (body) blocks.push(`# ${meta.heading}\n${body}`)
  }

  return blocks.join("\n\n")
}

export function filledCount(prompt: SectionedPrompt): number {
  const prose = SECTION_META.filter((meta) => prompt[meta.id].trim()).length
  return prose + (prompt.flow.length ? 1 : 0)
}

export const SECTION_TOTAL = SECTION_META.length + 1

export function variableLabel(name: string): string {
  const words = name.replace(/_/g, " ").trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export const IMPLICIT_VARIABLES = ["agent_name"]
