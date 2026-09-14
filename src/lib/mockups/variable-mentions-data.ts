/**
 * What the scenario editor can mention, and the scenario it is mentioned in.
 *
 * Three kinds of variable, split by where the value comes from when a call
 * starts. Scenario variables are the ones an author defines under Template
 * variables and supplies per call. The other two are provided by the
 * platform — today the product files all of them under one "Global" badge
 * (`precedent-iso/src/global-variables.ts`). The ticket asks to keep system
 * information apart from global variables; the split below is the working
 * assumption for review, not a decision on which names belong where.
 */

export type VariableKind = "global" | "scenario" | "system"

export type VariableType = "boolean" | "date" | "number" | "text"

export interface ScenarioVariable {
  kind: "scenario"
  name: string
  required: boolean
  type: VariableType
  /** Only an optional variable carries one, as in the product's schema. */
  defaultValue?: string
}

export interface PlatformVariable {
  kind: "global" | "system"
  name: string
  /** The product's own description, verbatim. */
  description: string
}

export type Variable = PlatformVariable | ScenarioVariable

export const KIND_ORDER: readonly VariableKind[] = [
  "scenario",
  "global",
  "system",
]

export const KIND_LABEL: Record<VariableKind, { group: string; one: string }> =
  {
    scenario: { group: "Scenario variables", one: "Scenario variable" },
    global: { group: "Global variables", one: "Global variable" },
    system: { group: "System information", one: "System information" },
  }

const TYPE_LABEL: Record<VariableType, string> = {
  boolean: "Yes or no",
  date: "Date",
  number: "Number",
  text: "Text",
}

export const TIMEZONE = "Asia/Riyadh"

export const SCENARIO_VARIABLES: ScenarioVariable[] = [
  { kind: "scenario", name: "guest_name", required: true, type: "text" },
  {
    defaultValue: "None",
    kind: "scenario",
    name: "loyalty_status",
    required: false,
    type: "text",
  },
  {
    defaultValue: "Sizzler",
    kind: "scenario",
    name: "company_name",
    required: false,
    type: "text",
  },
  {
    defaultValue: "",
    kind: "scenario",
    name: "last_visit_date",
    required: false,
    type: "date",
  },
  {
    defaultValue: "0",
    kind: "scenario",
    name: "outstanding_credit",
    required: false,
    type: "number",
  },
]

export const GLOBAL_VARIABLES: PlatformVariable[] = [
  { description: "Name of the AI agent", kind: "global", name: "agent_name" },
  {
    description: "Gender of the AI agent",
    kind: "global",
    name: "agent_gender",
  },
]

export const SYSTEM_VARIABLES: PlatformVariable[] = [
  {
    description: "Current date, formatted as 'January 15, 2025'",
    kind: "system",
    name: "date",
  },
  {
    description: "Current day of the week, formatted as 'Wednesday'",
    kind: "system",
    name: "weekday",
  },
  {
    description:
      "Current time rounded to the nearest 10 minutes, formatted as '02:30 PM'",
    kind: "system",
    name: "time",
  },
  {
    description: "Phone number of the person being called",
    kind: "system",
    name: "user_phone_number",
  },
]

/**
 * The line under a name in the picker, and the second line of a chip's
 * tooltip. A scenario variable has no description of its own in the product,
 * so its type and whether a call has to supply it stand in.
 */
export function describe(variable: Variable): string {
  if (variable.kind !== "scenario") {
    /* The product appends the scenario's timezone to date and time — the two
       whose value depends on it. */
    const zoned = variable.name === "date" || variable.name === "time"
    return zoned
      ? `${variable.description} · ${TIMEZONE}`
      : variable.description
  }

  const type = TYPE_LABEL[variable.type]
  if (variable.required) return `${type} · required`
  return variable.defaultValue
    ? `${type} · defaults to ${variable.defaultValue}`
    : `${type} · optional`
}

/* ------------------------------------------------------- reviewer states -- */

export type VariablesState = "loading" | "none" | "populated"

export const VARIABLE_STATES: { label: string; value: VariablesState }[] = [
  { label: "Populated", value: "populated" },
  { label: "None", value: "none" },
  { label: "Loading", value: "loading" },
]

/**
 * The mentionable set for a reviewer state. Global variables and system
 * information exist for every scenario, so only the scenario's own list can
 * be empty — and every chip in the prompt that pointed at one of those turns
 * into the not-defined state, which is exactly what happens when a variable
 * is deleted while the prompt still uses it.
 */
export function variablesFor(state: VariablesState): Variable[] {
  const scenario = state === "none" ? [] : SCENARIO_VARIABLES
  return [...scenario, ...GLOBAL_VARIABLES, ...SYSTEM_VARIABLES]
}

/* -------------------------------------------------------------- scenario -- */

export const SCENARIO = { name: "Reservation Assistant for Sizzler" }

export type LanguageCode = "ar" | "en"

export const LANGUAGES: readonly LanguageCode[] = ["en", "ar"]

export const LANGUAGE_LABEL: Record<LanguageCode, string> = {
  ar: "Arabic",
  en: "English",
}

export const LANGUAGE_SHORT: Record<LanguageCode, string> = {
  ar: "AR",
  en: "EN",
}

export interface PromptText {
  firstMessage: string
  prompt: string
}

/**
 * The stored form stays `{{name}}` — that is what PROD-80 inserts and what
 * every existing scenario already holds. The chip is how it is shown, not
 * how it is saved. `{{promo_code}}` is not defined anywhere on purpose: it
 * is the stale mention a deleted variable leaves behind.
 */
export const TEXTS: Record<LanguageCode, PromptText> = {
  en: {
    firstMessage:
      "Thank you for calling {{company_name}}. My name is {{agent_name}}. How can I help you today?",
    prompt: `# Agent identity & purpose
You are {{agent_name}}, a professional and welcoming reservation assistant for {{company_name}}, a fine dining restaurant. Today is {{weekday}}, {{date}}, and the time is {{time}}.

# Guest context
The guest is {{guest_name}}, a {{loyalty_status}} member. Their last visit was on {{last_visit_date}} and they have {{outstanding_credit}} SAR of credit to spend.

# Scope limitation
Your only function is to assist with restaurant reservations. If asked about anything else, say: "I'm sorry, I can only assist with restaurant reservations."

# Conversation flow
Greet the guest by name.
Collect party size, then date, then time.
Offer to note a special occasion or dietary needs.
Read the booking back for confirmation.
Give the confirmation number and close in your own words.

# Escalation
Transfer to a manager for parties over 12, same-day cancellations inside 2 hours, and any complaint about a previous visit. Mention {{promo_code}} only if the guest asks about offers.`,
  },
  ar: {
    firstMessage:
      "شكرًا لاتصالك بـ {{company_name}}. معك {{agent_name}}. كيف أقدر أساعدك؟",
    prompt: `# هوية الوكيل والغرض منه
أنت {{agent_name}}، مساعد حجوزات محترف ومرحب لمطعم {{company_name}}، وهو مطعم راقٍ. اليوم {{weekday}} {{date}}، والساعة الآن {{time}}.

# سياق الضيف
الضيف هو {{guest_name}}، عضو بمستوى {{loyalty_status}}. آخر زيارة له كانت في {{last_visit_date}} ولديه رصيد {{outstanding_credit}} ريال.

# حدود النطاق
مهمتك الوحيدة هي المساعدة في حجوزات المطعم. إذا سُئلت عن أي شيء آخر، قل: "عذرًا، يمكنني المساعدة في حجوزات المطعم فقط."

# سير المحادثة
رحّب بالضيف باسمه.
اجمع عدد الأشخاص، ثم التاريخ، ثم الوقت.
اعرض تسجيل مناسبة خاصة أو احتياجات غذائية.
أعد قراءة الحجز للتأكيد.
أعطِ رقم التأكيد وأنهِ المكالمة بأسلوبك.

# التصعيد
حوّل المكالمة إلى مدير للحجوزات التي تزيد عن 12 شخصًا، وإلغاءات اليوم نفسه خلال ساعتين، وأي شكوى عن زيارة سابقة. اذكر {{promo_code}} فقط إذا سأل الضيف عن العروض.`,
  },
}
