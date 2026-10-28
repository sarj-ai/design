export type VariableKind = "global" | "scenario" | "system"

type VariableType = "boolean" | "date" | "number" | "text"

export interface ScenarioVariable {
  kind: "scenario"
  name: string
  required: boolean
  type: VariableType
  defaultValue?: string
}

export interface PlatformVariable {
  kind: "global" | "system"
  name: string
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

const TIMEZONE = "Asia/Riyadh"

const SCENARIO_VARIABLES: ScenarioVariable[] = [
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

const GLOBAL_VARIABLES: PlatformVariable[] = [
  { description: "Name of the AI agent", kind: "global", name: "agent_name" },
  {
    description: "Gender of the AI agent",
    kind: "global",
    name: "agent_gender",
  },
]

const SYSTEM_VARIABLES: PlatformVariable[] = [
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

export function describe(variable: Variable): string {
  if (variable.kind !== "scenario") {
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

export type VariablesState = "loading" | "none" | "populated"

export const VARIABLE_STATES: { label: string; value: VariablesState }[] = [
  { label: "Populated", value: "populated" },
  { label: "None", value: "none" },
  { label: "Loading", value: "loading" },
]

export function variablesFor(state: VariablesState): Variable[] {
  const scenario = state === "none" ? [] : SCENARIO_VARIABLES
  return [...scenario, ...GLOBAL_VARIABLES, ...SYSTEM_VARIABLES]
}

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

/** Stored as `{{name}}`; the chip is display only. `{{promo_code}}` is undefined on purpose: a stale mention. */
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
