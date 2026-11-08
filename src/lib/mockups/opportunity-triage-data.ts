/**
 * DES-208 — resolve or dismiss scenario optimization opportunities.
 *
 * Mirrors the platform's InsightSummary (title, category, description, call
 * count) and adds what the ticket asks for: the latest decision on an
 * opportunity, the calls that arrived after it, and whether it was found since
 * this person last opened the tab.
 */

export type Category = "tool" | "knowledge" | "prompt" | "platform" | "other";

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: "tool", label: "Tool" },
  { key: "knowledge", label: "Knowledge" },
  { key: "prompt", label: "Prompt" },
  { key: "platform", label: "Platform" },
  { key: "other", label: "Other" },
];

export type DecisionKind = "resolved" | "dismissed";

export type Decision = {
  kind: DecisionKind;
  by: string;
  /** ISO date of the decision. */
  at: string;
};

export type Call = {
  id: string;
  createdAt: string;
  phoneNumber: string;
  durationSeconds: number;
  status: "completed" | "failed" | "no answer";
};

export type Opportunity = {
  id: string;
  title: string;
  category: Category;
  description: string;
  callCount: number;
  /** The latest decision, shared by everyone in the organization. */
  decision: Decision | null;
  /** Calls that showed the same gap after the decision. Above zero, the
   *  opportunity is open again. */
  callsSinceDecision: number;
  /** First found after this person last opened the tab. Per person. */
  isNew: boolean;
};

export type Status = "open" | DecisionKind;

export function statusOf(opportunity: Opportunity): Status {
  if (opportunity.decision === null) return "open";
  if (opportunity.callsSinceDecision > 0) return "open";
  return opportunity.decision.kind;
}

export function hasRecurred(opportunity: Opportunity): boolean {
  return opportunity.decision !== null && opportunity.callsSinceDecision > 0;
}

export const SCENARIO = {
  name: "Motor renewal reminders",
  status: "Live",
  createdAt: "Aug 12, 2026",
};

export const CURRENT_USER = "Omar Haddad";

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "plate-lookup",
    title: "Policy lookup fails when the plate number has Arabic letters",
    category: "tool",
    description:
      "The lookup tool receives the plate as the customer said it, in Arabic letters, and returns no policy. The agent then asks for the policy number, which most customers don't have to hand.",
    callCount: 14,
    decision: null,
    callsSinceDecision: 0,
    isNew: true,
  },
  {
    id: "payment-link",
    title: "Payment link is sent before the customer confirms the amount",
    category: "tool",
    description:
      "The agent calls the payment link tool right after quoting the renewal price, before the customer says yes. Several customers asked why they received a link they did not agree to.",
    callCount: 9,
    decision: { kind: "resolved", by: "Sara Al-Qahtani", at: "2026-10-28" },
    callsSinceDecision: 4,
    isNew: false,
  },
  {
    id: "cover-difference",
    title:
      "No answer for the difference between comprehensive and third-party cover",
    category: "knowledge",
    description:
      "Customers ask what they lose by switching to third-party cover. The knowledge base has the prices for both but not what each covers, so the agent offers to transfer.",
    callCount: 21,
    decision: null,
    callsSinceDecision: 0,
    isNew: false,
  },
  {
    id: "discount-table",
    title: "Outdated no-claims discount percentages",
    category: "knowledge",
    description:
      "The agent quotes a 20% no-claims discount for three claim-free years. The current table gives 25%.",
    callCount: 6,
    decision: { kind: "resolved", by: "Omar Haddad", at: "2026-10-30" },
    callsSinceDecision: 0,
    isNew: false,
  },
  {
    id: "vat-price",
    title: "Renewal price quoted without VAT",
    category: "knowledge",
    description:
      "The price the agent reads out excludes VAT, so the payment link shows a higher amount than the one agreed on the call.",
    callCount: 7,
    decision: { kind: "resolved", by: "Sara Al-Qahtani", at: "2026-11-01" },
    callsSinceDecision: 0,
    isNew: false,
  },
  {
    id: "repeat-price",
    title: "Agent repeats the renewal price after the customer has agreed",
    category: "prompt",
    description:
      "After the customer accepts, the agent restates the full price and cover before moving on, which reopens the decision on a third of these calls.",
    callCount: 17,
    decision: null,
    callsSinceDecision: 0,
    isNew: false,
  },
  {
    id: "driving-callback",
    title: "No callback offered when the customer is driving",
    category: "prompt",
    description:
      "Customers say they are driving and the agent carries on with the renewal. Offering a callback time would end these calls sooner and bring them back later.",
    callCount: 5,
    decision: null,
    callsSinceDecision: 0,
    isNew: true,
  },
  {
    id: "long-greeting",
    title: "Greeting runs long before stating the reason for the call",
    category: "prompt",
    description:
      "The agent gives the company name, its own name and a recording notice before saying the call is about the renewal. Some customers hang up during the greeting.",
    callCount: 11,
    decision: { kind: "dismissed", by: "Sara Al-Qahtani", at: "2026-10-22" },
    callsSinceDecision: 0,
    isNew: false,
  },
  {
    id: "policy-silence",
    title: "Long silence after the customer reads out the policy number",
    category: "platform",
    description:
      "There is a gap of four to six seconds between the customer finishing the policy number and the agent's reply. Customers repeat the number or ask if anyone is there.",
    callCount: 8,
    decision: null,
    callsSinceDecision: 0,
    isNew: false,
  },
  {
    id: "claim-question",
    title: "Customer asks about an open claim, not the renewal",
    category: "other",
    description:
      "The customer wants an update on a claim. The scenario only covers renewals, so the agent cannot help.",
    callCount: 4,
    decision: { kind: "dismissed", by: "Omar Haddad", at: "2026-10-25" },
    callsSinceDecision: 0,
    isNew: false,
  },
];

/** The same list after everyone has decided on every opportunity. */
export const ALL_HANDLED: Opportunity[] = OPPORTUNITIES.map((opportunity) =>
  opportunity.decision === null
    ? {
        ...opportunity,
        decision: { kind: "resolved", by: "Sara Al-Qahtani", at: "2026-11-03" },
        isNew: false,
      }
    : { ...opportunity, callsSinceDecision: 0, isNew: false },
);

const PHONES = [
  "+966 55 214 8830",
  "+966 50 731 0492",
  "+966 54 902 1176",
  "+966 56 118 4027",
  "+966 53 640 2215",
  "+966 59 377 9061",
];

const STATUSES: Call["status"][] = [
  "completed",
  "completed",
  "completed",
  "no answer",
  "completed",
  "failed",
];

/** The latest calls for an opportunity, newest first. Deterministic, so the
 *  page renders the same on the server and the client. */
export function callsFor(opportunity: Opportunity): Call[] {
  const seed = opportunity.id.length;
  const count = Math.min(opportunity.callCount, 5);
  return Array.from({ length: count }, (_, index) => {
    const day = 3 - Math.floor((index * 3 + seed) / 4);
    const hour = 9 + ((seed + index * 5) % 9);
    const minute = (seed * 7 + index * 13) % 60;
    return {
      id: `${opportunity.id}-${index}`,
      createdAt: `2026-11-${String(Math.max(day, 1)).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
      phoneNumber: PHONES[(seed + index) % PHONES.length],
      durationSeconds: 48 + ((seed * 31 + index * 47) % 240),
      status: STATUSES[(seed + index) % STATUSES.length],
    };
  });
}
