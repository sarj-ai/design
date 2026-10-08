/**
 * Mock data for DES-203 — live scenario status and the change warning.
 *
 * Live is a manual switch on the scenario (PROD-234, Kidus Asmare: "Manual
 * switch; add badge on the playground index and scenario index page"). It is
 * off for a new scenario, it is not content, and who flipped it and when is
 * recorded — the Configuration versioning doc (INT-253) builds its publish
 * step on exactly this switch, so nothing here infers live from traffic.
 */

export type LiveRecord = {
  /** Who flipped the switch on, and when. */
  by: string
  at: string
}

export type ScenarioRow = {
  id: string
  name: string
  languages: string[]
  created: string
  updated: string
  /** Null when nobody has edited it since it was created. */
  updatedBy: string | null
  live: LiveRecord | null
}

export const SCENARIOS: ScenarioRow[] = [
  {
    id: "s1",
    name: "Welcome and onboarding (outbound)",
    languages: ["AR", "EN"],
    created: "28 Sep 2026, 17:07",
    updated: "28 Sep 2026, 17:26",
    updatedBy: "rmansour",
    live: { by: "Nouf Al-Harbi", at: "30 Sep 2026, 09:12" },
  },
  {
    id: "s2",
    name: "Temporary licence reminder (outbound)",
    languages: ["AR", "EN"],
    created: "28 Sep 2026, 17:07",
    updated: "28 Sep 2026, 17:07",
    updatedBy: null,
    live: null,
  },
  {
    id: "s3",
    name: "Invoices awaiting payment (outbound)",
    languages: ["AR", "EN"],
    created: "28 Sep 2026, 17:06",
    updated: "07 Oct 2026, 16:40",
    updatedBy: "rmansour",
    live: { by: "Nouf Al-Harbi", at: "02 Oct 2026, 14:02" },
  },
  {
    id: "s4",
    name: "Returned licence requests (outbound)",
    languages: ["AR", "EN"],
    created: "28 Sep 2026, 17:06",
    updated: "28 Sep 2026, 17:25",
    updatedBy: "rmansour",
    live: null,
  },
  {
    id: "s5",
    name: "Inbound agent",
    languages: ["AR"],
    created: "28 Sep 2026, 15:20",
    updated: "06 Oct 2026, 11:08",
    updatedBy: "aalharbi",
    live: { by: "Sara Al-Qahtani", at: "29 Sep 2026, 08:30" },
  },
  {
    id: "s6",
    name: "Debt collection (hard posture)",
    languages: ["AR"],
    created: "27 Sep 2026, 18:11",
    updated: "27 Sep 2026, 18:16",
    updatedBy: "aalharbi",
    live: null,
  },
  {
    id: "s7",
    name: "Card offer (outbound sales)",
    languages: ["AR"],
    created: "27 Sep 2026, 18:10",
    updated: "27 Sep 2026, 18:10",
    updatedBy: null,
    live: null,
  },
  {
    id: "s8",
    name: "Debt collection (standard posture)",
    languages: ["AR"],
    created: "27 Sep 2026, 18:09",
    updated: "05 Oct 2026, 10:21",
    updatedBy: "fjanahi",
    live: { by: "Nouf Al-Harbi", at: "01 Oct 2026, 12:45" },
  },
  {
    id: "s9",
    name: "Plan upgrade (subscription upsell)",
    languages: ["AR"],
    created: "27 Sep 2026, 18:09",
    updated: "27 Sep 2026, 18:09",
    updatedBy: null,
    live: null,
  },
  {
    id: "s10",
    name: "Appointment booking",
    languages: ["AR", "EN"],
    created: "26 Sep 2026, 11:42",
    updated: "27 Sep 2026, 09:03",
    updatedBy: "fjanahi",
    live: null,
  },
  {
    id: "s11",
    name: "Delivery confirmation",
    languages: ["AR", "UR"],
    created: "25 Sep 2026, 16:30",
    updated: "25 Sep 2026, 16:30",
    updatedBy: null,
    live: null,
  },
  {
    id: "s12",
    name: "Renewal follow-up",
    languages: ["EN"],
    created: "24 Sep 2026, 10:15",
    updated: "26 Sep 2026, 14:48",
    updatedBy: "talzamel",
    live: null,
  },
]

export const DELETED: ScenarioRow[] = [
  {
    id: "d1",
    name: "Card offer (old script)",
    languages: ["AR"],
    created: "12 Sep 2026, 10:02",
    updated: "26 Sep 2026, 13:40",
    updatedBy: "aalharbi",
    live: null,
  },
  {
    id: "d2",
    name: "Survey pilot",
    languages: ["EN"],
    created: "02 Sep 2026, 09:20",
    updated: "20 Sep 2026, 17:11",
    updatedBy: "fjanahi",
    live: null,
  },
]

/* ----------------------------------------------------------------- editor */

export type PromptField = {
  id: "first-message" | "instruction"
  label: string
  body: string
}

/**
 * The two prompt fields of the editor's Scenario tab — enough of the editor
 * to make a change and save it. The rest of the editor is unchanged by this
 * ticket and left out.
 */
export const PROMPT_FIELDS: PromptField[] = [
  {
    id: "first-message",
    label: "First message",
    body: "السلام عليكم، معك سارة من شركة الاتصالات. هل الوقت مناسب للحديث عن فاتورتك؟",
  },
  {
    id: "instruction",
    label: "Instruction prompt",
    body: [
      "You are Sara, a billing assistant calling about an unpaid invoice.",
      "Confirm the customer's name before mentioning any amount.",
      "State the amount due and the due date once.",
      "Offer to send a payment link by SMS.",
      "If the customer disputes the invoice, offer a transfer to billing.",
    ].join("\n"),
  },
]

/**
 * The editor cases the reviewer can open. Each is one scenario as the page
 * finds it — the switch in the mockup shell picks the case, not a state the
 * product would show.
 */
export type EditorCase = {
  id: string
  label: string
  scenario: string
  live: LiveRecord | null
  /** The reader may flip the switch. */
  canToggle: boolean
  /** Turning the switch fails on the server. */
  toggleFails: boolean
  /**
   * Someone else turns the scenario live after this page loaded; the save
   * review is the first place that finds out.
   */
  turnedLiveElsewhere: LiveRecord | null
}

export const EDITOR_CASES: EditorCase[] = [
  {
    id: "live",
    label: "Live",
    scenario: "Invoices awaiting payment (outbound)",
    live: { by: "Nouf Al-Harbi", at: "02 Oct 2026, 14:02" },
    canToggle: true,
    toggleFails: false,
    turnedLiveElsewhere: null,
  },
  {
    id: "not-live",
    label: "Not live",
    scenario: "Renewal follow-up",
    live: null,
    canToggle: true,
    toggleFails: false,
    turnedLiveElsewhere: null,
  },
  {
    id: "goes-live",
    label: "Goes live while editing",
    scenario: "Returned licence requests (outbound)",
    live: null,
    canToggle: true,
    toggleFails: false,
    turnedLiveElsewhere: { by: "Nouf Al-Harbi", at: "08 Oct 2026, 14:02" },
  },
  {
    id: "no-permission",
    label: "No permission",
    scenario: "Inbound agent",
    live: { by: "Sara Al-Qahtani", at: "29 Sep 2026, 08:30" },
    canToggle: false,
    toggleFails: false,
    turnedLiveElsewhere: null,
  },
  {
    id: "toggle-fails",
    label: "Switch fails",
    scenario: "Debt collection (hard posture)",
    live: null,
    canToggle: true,
    toggleFails: true,
    turnedLiveElsewhere: null,
  },
]

/** Who is reading the editor, for the toast after a flip. */
export const CURRENT_USER = "Rana Mansour"
