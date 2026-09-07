/**
 * The instruction prompt, as the things it actually says — v2 only.
 *
 * v1 stores the prompt as one markdown string and edits it in one monospace
 * textarea. That is the shape the model wants, and it is the wrong shape for
 * the person writing it: the reviewer feedback was that the prompting area is
 * not intuitive for a business user. A `#` heading is not a label, `{{var}}`
 * is not a field, and a 140-row code box gives no clue whether anything has
 * been missed.
 *
 * So the same prompt is held here as named sections. Nothing is lost — the raw
 * markdown is assembled back from these, byte-comparable with what v1 stores,
 * which is what lets the structured view be a view rather than a lossy form.
 */

import type { LanguageCode } from "@/lib/scenario-single-screen-data"

export type SectionId = "context" | "escalation" | "identity" | "scope" | "tone"

/**
 * One prose section, and how it is introduced to somebody who has never
 * written a prompt.
 *
 * `heading` is what goes back into the markdown, so it stays the engineer's
 * wording. `label` is what the screen says. They are deliberately different:
 * "Scope limitation" is precise and means nothing to a restaurant manager.
 */
export interface SectionMeta {
  /** Shown when the section is empty — teaching by example, not by tooltip. */
  example: string
  /** The `#` heading this section round-trips to in the raw prompt. */
  heading: string
  /** One line of plain guidance, under the label. */
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

/** The call script. Its own shape because it is the one section that is a list. */
export const FLOW_META = {
  example: "Greet the guest",
  heading: "Conversation flow",
  help: "The agent works down these in order. One instruction per step.",
  label: "How the call should go",
}

export interface SectionedPrompt {
  context: string
  escalation: string
  /** Ordered steps. The agent follows them top to bottom. */
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

/* ------------------------------------------------------------- assembling -- */

/**
 * The raw markdown, rebuilt from the sections.
 *
 * This is what the model is actually sent, and what the raw editor shows. An
 * empty section is left out rather than emitted as a bare heading — a heading
 * with nothing under it reads to the model as an instruction to say nothing.
 */
export function assemblePrompt(prompt: SectionedPrompt): string {
  const blocks: string[] = []

  for (const meta of SECTION_META) {
    /* Flow is interleaved by heading order in v1's markdown, so it is emitted
       in its own slot below rather than appended at the end. */
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

/** How many sections carry something, for the "nothing is missing" count. */
export function filledCount(prompt: SectionedPrompt): number {
  const prose = SECTION_META.filter((meta) => prompt[meta.id].trim()).length
  return prose + (prompt.flow.length ? 1 : 0)
}

export const SECTION_TOTAL = SECTION_META.length + 1

/* -------------------------------------------------------------- variables -- */

/**
 * `{{loyalty_status}}` as a person would say it.
 *
 * Derived rather than mapped by hand, so a variable added in the drawer is
 * readable here without a second list to keep in step.
 */
export function variableLabel(name: string): string {
  const words = name.replace(/_/g, " ").trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** Variables the prompt references but the variables table does not declare. */
export const IMPLICIT_VARIABLES = ["agent_name"]
