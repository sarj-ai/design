/**
 * The Configure Report dialog's columns — PROD-289 / DES-155.
 *
 * Every group is defined the same way: the full list of fields it can draw
 * from, then which of them the report starts with. The picker ticks against
 * that same list, so a field is on the report or it is not — one id, one
 * checkbox, one chip.
 */

export type Column = {
  id: string
  label: string
}

/** Reads the starting columns out of a group's options, so the two lists
 *  cannot drift apart — a typo here fails the build rather than quietly
 *  rendering a chip no checkbox can ever tick. */
function pick(options: Column[], ids: string[]): Column[] {
  return ids.map((id) => {
    const option = options.find((column) => column.id === id)
    if (!option) throw new Error(`configure-report: unknown column "${id}"`)
    return option
  })
}

/** The export's own fields — the same for every organization. */
export const STANDARD_OPTIONS: Column[] = [
  { id: "call_id", label: "call_id" },
  { id: "phone_number", label: "phone_number" },
  { id: "name", label: "name" },
  { id: "time", label: "time" },
  { id: "status", label: "status" },
  { id: "outcome", label: "outcome" },
  { id: "duration", label: "duration" },
  { id: "transcript", label: "transcript" },
]

/**
 * Values passed into the call.
 *
 * The first seven are the platform's global variables — injected into every
 * call, so every scenario has them. The rest are scenario fields taken from
 * real scenarios: the ones a template actually asks the caller list for.
 */
export const VARIABLE_OPTIONS: Column[] = [
  { id: "agent_name", label: "agent_name" },
  { id: "agent_gender", label: "agent_gender" },
  { id: "date", label: "date" },
  { id: "weekday", label: "weekday" },
  { id: "time", label: "time" },
  { id: "timezone", label: "timezone" },
  { id: "user_phone_number", label: "user_phone_number" },
  { id: "customer_name", label: "customer_name" },
  { id: "campaign_name", label: "campaign_name" },
  { id: "city", label: "city" },
  { id: "age", label: "age" },
  { id: "zoho_record_id", label: "zoho_record_id" },
  { id: "zoho_module", label: "zoho_module" },
]

/**
 * Values the agent gathered during the call — the keys a scenario's extraction
 * schema writes after it ends. These are real ones from shipped scenarios,
 * spelled the way the export spells them: the raw key, not the title, which is
 * why the casing is uneven.
 */
export const COLLECTED_OPTIONS: Column[] = [
  { id: "sentiment", label: "sentiment" },
  { id: "rejection_reason", label: "rejection_reason" },
  { id: "complain_category", label: "complain_category" },
  { id: "callback_requested", label: "callback_requested" },
  { id: "concern_addressed", label: "concern_addressed" },
  { id: "customer_agreed_to_complete", label: "customer_agreed_to_complete" },
  { id: "customer_concern_category", label: "customer_concern_category" },
  { id: "friction_type", label: "friction_type" },
  { id: "promised_payment_date", label: "Promised_payment_date" },
  { id: "customer_name", label: "customer_name" },
  { id: "notes", label: "notes" },
]

/** Standard columns are all on until someone takes one out. */
export const INITIAL_STANDARD: Column[] = STANDARD_OPTIONS

export const INITIAL_VARIABLES: Column[] = pick(VARIABLE_OPTIONS, [
  "agent_name",
  "date",
  "time",
  "campaign_name",
])

export const INITIAL_COLLECTED: Column[] = pick(COLLECTED_OPTIONS, [
  "promised_payment_date",
  "customer_name",
])

export const TEMPLATES = [
  { id: "default", label: "Default template" },
  { id: "sales", label: "Sales Report" },
  { id: "call-performance", label: "Call Performance" },
  { id: "lead-qualification", label: "Lead Qualification" },
  { id: "customer-feedback", label: "Customer Feedback" },
]
