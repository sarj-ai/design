/**
 * DES-161 — Multiple Routing Options Within Transfer Tool.
 *
 * A route is a destination plus the reasons a caller should reach it. The tool
 * evaluates every route's cases once, in parallel, and picks the closest match
 * — so routes are a flat list rather than a branching tree, and one of them has
 * to be the default that catches everything nothing else claimed.
 *
 * Three fields are always per route, because they are what makes a route a
 * route: the destination, the trigger cases, and the keypad key that jumps
 * straight there. Everything else starts shared and only splits once a route
 * actually needs to differ.
 */

export type TransferMode = "cold" | "warm"

export const TRANSFER_MODES: { value: TransferMode; label: string }[] = [
  { value: "cold", label: "Cold transfer — connect immediately" },
  { value: "warm", label: "Warm transfer — brief the agent first" },
]

/** Keys a caller can actually press to skip the conversation. */
export const KEYPAD_KEYS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "*",
  "#",
]

/** Always shared, never per route — the carrier the call leaves on. */
export const OUTBOUND_TRUNKS = [
  "Sarj shared trunk",
  "Quara dedicated trunk (STC)",
  "Mobily SIP trunk",
]

export type WorkingHours = {
  start: string
  end: string
  outsideHoursMessage: string
}

/**
 * What a route takes off the shared settings. `null` means "still shared".
 *
 * Working hours and the outside-hours message travel as one unit — hours with
 * no message to play outside them is a half-configured route.
 */
export type RouteOverrides = {
  transferMode: TransferMode | null
  messageBeforeTransfer: string | null
  workingHours: WorkingHours | null
  warmSummaryPrompt: string | null
}

export type Route = {
  id: string
  name: string
  destination: string
  /** Free text on purpose — an LLM reads these live, mid-call. */
  cases: string[]
  keypadKey: string
  overrides: RouteOverrides
}

export type SharedSettings = {
  transferMode: TransferMode
  messageBeforeTransfer: string
  workingHours: WorkingHours
  warmSummaryPrompt: string
  outboundTrunk: string
}

export const SHARED_SETTINGS: SharedSettings = {
  transferMode: "cold",
  messageBeforeTransfer:
    "Thanks for holding — I'm connecting you to someone who can help with this now.",
  workingHours: {
    start: "08:00",
    end: "20:00",
    outsideHoursMessage:
      "Our team is away right now. They're back at 8 in the morning and will pick this up then.",
  },
  warmSummaryPrompt:
    "Summarise who is calling, what they asked for, and anything already tried on this call. Keep it to three sentences.",
  outboundTrunk: "Quara dedicated trunk (STC)",
}

export const DEFAULT_ROUTE_ID = "route-support"

export const ROUTES: Route[] = [
  {
    id: "route-support",
    name: "General Support",
    destination: "+966 11 234 5678",
    cases: ["general question", "doesn't match another route"],
    keypadKey: "0",
    overrides: {
      transferMode: null,
      messageBeforeTransfer: null,
      workingHours: null,
      warmSummaryPrompt: null,
    },
  },
  {
    id: "route-sales",
    name: "Sales",
    destination: "+966 11 234 5601",
    cases: ["wants pricing", "asks to speak to sales team"],
    keypadKey: "1",
    // Sales is the route that genuinely differs: its own hours, its own words,
    // and it stays cold on purpose even if support moves to a warm handoff.
    overrides: {
      transferMode: "cold",
      messageBeforeTransfer:
        "Great — putting you through to the sales team now, they'll have your pricing in front of them.",
      workingHours: {
        start: "09:00",
        end: "17:00",
        outsideHoursMessage:
          "Sales is out for the day. Leave your number and they'll call you back tomorrow morning.",
      },
      warmSummaryPrompt: null,
    },
  },
  {
    id: "route-retention",
    name: "Retention",
    destination: "+966 11 234 5622",
    cases: ["wants to cancel", "wants to talk to sales about upgrading"],
    keypadKey: "2",
    // A cancellation is the one call nobody wants handed over cold.
    overrides: {
      transferMode: "warm",
      messageBeforeTransfer: null,
      workingHours: null,
      warmSummaryPrompt:
        "Say why the customer wants to cancel, how long they have been with us, and anything they have already been offered.",
    },
  },
]

/** A blank route, for the button at the bottom of the list. */
export function emptyRoute(id: string, keypadKey: string): Route {
  return {
    id,
    name: "",
    destination: "",
    cases: [],
    keypadKey,
    overrides: {
      transferMode: null,
      messageBeforeTransfer: null,
      workingHours: null,
      warmSummaryPrompt: null,
    },
  }
}

/** Which fields this route has taken off the shared settings. */
export function overriddenFields(route: Route): string[] {
  const {
    transferMode,
    messageBeforeTransfer,
    workingHours,
    warmSummaryPrompt,
  } = route.overrides

  return [
    transferMode !== null ? "Transfer mode" : null,
    messageBeforeTransfer !== null ? "Message before transferring" : null,
    workingHours !== null ? "Working hours" : null,
    warmSummaryPrompt !== null ? "Warm summary prompt" : null,
  ].filter((field): field is string => field !== null)
}

/** The mode a route will actually transfer in, shared or overridden. */
export function effectiveMode(
  route: Route,
  shared: SharedSettings,
): TransferMode {
  return route.overrides.transferMode ?? shared.transferMode
}

/* -------------------------------------------------------------------------
   Overlapping cases.

   The real check is semantic: an LLM reads these live on the call, so "speak
   to sales team" and "talk to sales about upgrading" collide for reasons no
   string comparison can see. This is the cheap stand-in — strip the words
   every case sentence carries and see what is left in common. It fires on the
   pairs a reviewer would flag by eye, which is what the warning is for.
------------------------------------------------------------------------- */

/** Words that appear in half the cases anyone writes, so they prove nothing. */
const FILLER = new Set([
  "a",
  "about",
  "an",
  "and",
  "another",
  "any",
  "are",
  "ask",
  "asks",
  "be",
  "call",
  "caller",
  "customer",
  "doesn't",
  "does",
  "for",
  "has",
  "have",
  "i",
  "in",
  "is",
  "it",
  "match",
  "me",
  "my",
  "need",
  "needs",
  "not",
  "of",
  "on",
  "or",
  "route",
  "said",
  "says",
  "that",
  "the",
  "their",
  "them",
  "they",
  "this",
  "to",
  "want",
  "wants",
  "with",
])

function contentWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z']+/)
    .filter((word) => word.length > 2 && !FILLER.has(word))
}

export type Overlap = {
  routeIds: [string, string]
  cases: [string, string]
  /** The words the two cases have in common, for the warning copy. */
  shared: string[]
}

/** Every pair of cases from different routes that read alike. */
export function findOverlaps(routes: Route[]): Overlap[] {
  const overlaps: Overlap[] = []

  for (let i = 0; i < routes.length; i += 1) {
    for (let j = i + 1; j < routes.length; j += 1) {
      for (const a of routes[i].cases) {
        for (const b of routes[j].cases) {
          const wordsB = new Set(contentWords(b))
          const shared = [...new Set(contentWords(a))].filter((word) =>
            wordsB.has(word),
          )

          if (shared.length) {
            overlaps.push({
              routeIds: [routes[i].id, routes[j].id],
              cases: [a, b],
              shared,
            })
          }
        }
      }
    }
  }

  return overlaps
}

/** The cases caught in an overlap, so the chips can carry the warning too. */
export function overlappingCases(overlaps: Overlap[]): Set<string> {
  return new Set(overlaps.flatMap((overlap) => overlap.cases))
}
