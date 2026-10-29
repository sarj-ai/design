import {
  AiVoiceIcon,
  Alert02Icon,
  ArrowReloadHorizontalIcon,
  AtIcon,
  AudioWave01Icon,
  BookBookmark01Icon,
  CallOutgoing01Icon,
  CheckmarkBadge01Icon,
  DashboardSquare01Icon,
  DocumentAttachmentIcon,
  Flag02Icon,
  Key01Icon,
  LanguageSkillIcon,
  Layers01Icon,
  LayoutTable01Icon,
  LiveStreaming02Icon,
  Message01Icon,
  ShieldKeyIcon,
  SourceCodeIcon,
  SparklesIcon,
  TelephoneIcon,
  Timer01Icon,
  UserGroupIcon,
  VoiceIdIcon,
  WorkHistoryIcon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

import {
  prepareField,
  prepareQuery,
  scoreTerm,
  type Term,
} from "@/lib/site/fuzzy"

// Must match Linear's Surface label group and SURFACES in scripts/new-mockup.mjs.
const SURFACES = [
  "Conversations",
  "Personas",
  "Scenarios Index",
  "Scenario Edit",
  "Knowledge Bases",
  "Integrations Pages",
  "Playground",
  "Settings",
] as const

type Surface = (typeof SURFACES)[number]

// Scripts edit and parse this array as text: keep entries separated by `},`, the sentinel line last,
// and href, title, meta, surface, description adjacent in that order (scripts/lib/import-graph.mjs).
type Mockup = {
  href: string
  title: string
  meta: string
  surface: Surface | null
  description: string
  icon: IconSvgElement
  tickets: string[]
  added: string
  /** Path under `src/` where `npm run registry` starts following imports. Defaults to the route. */
  registryEntry?: string
}

export const MOCKUPS: Mockup[] = [
  {
    href: "/transfer-routing",
    title: "Design multiple routing options for Transfer tool",
    meta: "Drawer · exploration",
    surface: "Scenario Edit",
    description:
      "The Transfer tool configured with more than one destination: a card per route with its own cases, number and keypad key, an overlap warning when two routes read alike, and the shared settings each route can override.",
    icon: CallOutgoing01Icon,
    tickets: ["DES-161"],
    added: "2026-09-07T18:56+05:30",
  },
  {
    href: "/knowledge-base",
    title: "Knowledge base — files, text and URLs",
    meta: "Page · exploration",
    surface: "Knowledge Bases",
    description:
      "The knowledge base as a resource the agent queries rather than prompt text: documents added from files, a pasted note or a URL, each carrying its extraction state, and the summary that tells the agent when to reach for it.",
    icon: BookBookmark01Icon,
    tickets: ["DES-136", "DES-149"],
    added: "2026-09-07T18:56+05:30",
  },
  {
    href: "/call-turn-timing",
    title: "Turn timing on the call detail",
    meta: "Panel · exploration",
    surface: "Conversations",
    description:
      "The turn detection panel on a call's Model Settings tab: which detection path actually ran, the minimum and maximum wait that applied and where each came from, and how many turns reached the maximum — including the first one.",
    icon: Timer01Icon,
    tickets: ["DES-173"],
    added: "2026-09-07T18:56+05:30",
  },
  {
    href: "/conversations-revamp",
    title: "Conversations with the revamped call drawer",
    meta: "Page + drawer · integration",
    surface: "Conversations",
    description:
      "The Conversations page as it ships today — app shell, filter bar, result count, table and pagination — with the revamped call drawer (revamp 4) opening from its rows: one transcript with the STT mishearings marked in place, search, a resizable split, and a section panel the reader can reorder.",
    icon: LayoutTable01Icon,
    tickets: ["DES-110", "DES-134", "DES-147", "DES-157"],
    added: "2026-09-07T18:56+05:30",
  },
  {
    href: "/personas-depth",
    title: "Personas index depth design",
    meta: "Page · exploration",
    surface: "Personas",
    description:
      "Depth pass on the personas surface: index with search, filters and grouping, restructured create/edit, voice library with previews, and scenario assignment.",
    icon: SparklesIcon,
    tickets: ["DES-117", "DES-135"],
    added: "2026-09-07T18:56+05:30",
  },
  {
    href: "/listener-cues",
    title: "Design backchanneling without mid-conversation interruption",
    meta: "Drawer · exploration",
    surface: "Personas",
    description:
      "Mid-turn listener cues configured beside the existing post-turn filler words: a weighted cue mix that always totals 100%, an exact response-frequency slider with the recommended range marked, timing limits, per-language approved clips, and the inherit-then-override lifecycle across global settings and one persona.",
    icon: AudioWave01Icon,
    tickets: ["DIS-63", "DES-172"],
    added: "2026-09-07T18:56+05:30",
  },
  {
    href: "/phrase-mappings",
    title: "Design persona-specific backchannel phrase-response mappings",
    meta: "Drawer · exploration",
    surface: "Personas",
    description:
      "Phrase-response mappings inside the existing Filler words drawer: several caller phrases map to one deterministic acknowledgment, kept exactly as typed so the voice pronounces it right. Priority ordering, whole-utterance or within-utterance matching, conflict validation, and a persona override that replaces the global set.",
    icon: Message01Icon,
    tickets: ["DES-171", "DIS-21"],
    added: "2026-09-07T18:56+05:30",
  },
  {
    href: "/model-catalog",
    title: "Design model onboarding flows for platform admins",
    meta: "Page + dialog · exploration",
    surface: null,
    description:
      "The model catalog Sarj staff use to add an LLM without an engineer: a table per modality, a two-path add flow that fetches a provider's live model list where one exists and falls back to a manual ID plus connection test where it does not, and deactivate-reactivate that never breaks an org already configured to a model. TTS is activate-only — no add flow — and STT is not here at all.",
    icon: SparklesIcon,
    tickets: ["DES-169"],
    added: "2026-09-07T18:56+05:30",
  },
  {
    href: "/eou-timing",
    title: "Design EOU configuration updates independent from backchanneling",
    meta: "Settings · exploration",
    surface: "Settings",
    description:
      "Minimum and maximum wait as configurable values: the global default shown beside the detection model that uses them, and the persona that inherits until it overrides. Bounded ranges, plain-language help and the out-of-band warning, scoped to the PRD's requirements.",
    icon: Timer01Icon,
    tickets: ["DES-173"],
    added: "2026-09-07T18:56+05:30",
  },
  {
    href: "/scenario-single-screen",
    title: "Scenario editor on one screen",
    meta: "Scenario · exploration",
    surface: "Scenario Edit",
    description:
      "The scenario editor with no tabs: the prompt and first message as the page, every other setting a one-line summary in a rail that opens a drawer to edit.",
    icon: Layers01Icon,
    tickets: [],
    added: "2026-09-07T18:56+05:30",
  },
  {
    href: "/connected-apps",
    title: "Design custom integrations access token management flows",
    meta: "Page · exploration",
    surface: "Integrations Pages",
    description:
      "An organization's own custom integrations as connected apps, and the access tokens each one authenticates with: scoped presets over the real permission enum, an expiry, and the one-time secret reveal that is the only moment the token can be copied.",
    icon: Key01Icon,
    tickets: ["DES-146", "DIS-24"],
    added: "2026-09-07T18:56+05:30",
  },
  {
    href: "/configure-report",
    title: "Configure Report before generating it",
    meta: "Dialog · exploration",
    surface: null,
    description:
      "The approved Configure Report dialog: a template picker with save and set-as-default, and three groups of export columns as reorderable chips — each group's Add opening a searchable checkbox list with Select all, so a group is filled in one pass instead of one column per reopen.",
    icon: DocumentAttachmentIcon,
    tickets: ["PROD-289", "DES-155"],
    added: "2026-09-07T18:56+05:30",
    registryEntry:
      "components/mockups/configure-report/configure-report-dialog.tsx",
  },
  {
    href: "/roles-permissions",
    title: "Design view-only role and permissions updates",
    meta: "Page · exploration",
    surface: "Settings",
    description:
      "The three roles redefined as distinct permission bundles over the platform's real 39-scope taxonomy: a matrix a Sarj super admin edits in place, with what each change costs before it applies.",
    icon: ShieldKeyIcon,
    tickets: ["DES-170", "DIS-15"],
    added: "2026-09-07T18:56+05:30",
  },
  {
    href: "/behavioral-alerts",
    title: "Configure call flags and surface them after every call",
    meta: "Page + drawer · exploration",
    surface: "Conversations",
    description:
      "Behavioural and emotional flags an admin defines per scenario, and the post-call analyst's detections beside a caller-experience card on the call detail.",
    icon: Alert02Icon,
    tickets: ["DES-187"],
    added: "2026-09-07T18:56+05:30",
  },
  {
    href: "/call-retry",
    title: "Design retry mechanism across the platform",
    meta: "Scenario + batch call · exploration",
    surface: "Scenario Edit",
    description:
      "One retry configuration owned by the scenario — how many attempts a call gets, how long between them, and the retry window with its timezone — plus the batch-calls override that inherits every value until it is switched on.",
    icon: ArrowReloadHorizontalIcon,
    tickets: ["DES-145", "DIS-18"],
    added: "2026-09-07T18:56+05:30",
  },
  {
    href: "/phone-numbers",
    title: "Self serve telephony — the phone numbers index",
    meta: "Page · exploration",
    surface: null,
    description:
      "The phone numbers admin index and its three tabs — call activity, outbound trunk assignments and provisioned numbers — with every table on the platform-consistency pattern the revamp only reached one of them with.",
    icon: TelephoneIcon,
    tickets: ["DES-188", "INT-78"],
    added: "2026-09-07T18:56+05:30",
  },
  {
    href: "/add-voice",
    title: "Design TTS fallback options for provider outages",
    meta: "Dialog · ready for dev",
    surface: "Personas",
    description:
      "A voice entering the global library carries the voice it falls back to, so a provider outage swaps the voice instead of dropping the call to silence. Display name, vibe, language and gender, then the TTS provider config that renders it, then the fallback that covers it.",
    icon: AiVoiceIcon,
    tickets: ["DES-159"],
    added: "2026-09-10T10:26+05:30",
  },
  {
    href: "/variable-mentions",
    title: "Variable mentions in the scenario editor",
    meta: "Editor · exploration",
    surface: "Scenario Edit",
    description:
      "The @ mention flow that replaces typed {{brackets}}: a caret-anchored picker grouped by where a value comes from, the inserted variable as an inline chip, and three chip colour treatments side by side so the direction can be picked on the live editor.",
    icon: AtIcon,
    tickets: ["DES-185"],
    added: "2026-09-14T14:37+05:30",
  },
  {
    href: "/persona-pronunciation",
    title: "Design persona pronunciation UX and voice model split",
    meta: "Dialog · ready for dev",
    surface: "Personas",
    description:
      "The edit persona dialog rebuilt so pronunciation gets room: identity, voice cards, behavior toggles and end-call-on-silence up top, then a searchable pronunciation table with an always-visible add row, per-term playback, inline edit, delete and bulk upload.",
    icon: LanguageSkillIcon,
    tickets: ["DES-148"],
    added: "2026-09-15T14:36+05:30",
  },
  {
    href: "/call-flagging",
    title: "Design flagging category UI and color system",
    meta: "Dialog · ready for dev",
    surface: "Conversations",
    description:
      "Flag this call: a pop-up that files a moment of a call under one of the ten DIS-50 parent categories and any number of its subcategories. The first row ticked commits the flag to its parent and every other group dims; ticking a row in another group moves the flag there and drops the old ticks. The footer reads the flag back before it is saved. Latency carries a Not sure row because its subcategories are optional; the four parents with none are plain rows under the divider.",
    icon: Flag02Icon,
    tickets: ["DES-167"],
    added: "2026-09-17T10:35+05:30",
  },
  {
    href: "/developers",
    title: "Developers",
    meta: "Page · exploration",
    surface: null,
    description:
      "One place for building on Sarj: a quickstart that places a call through the public API, API keys, webhooks and variables as tabs of one page.",
    icon: SourceCodeIcon,
    tickets: [],
    added: "2026-09-28T19:43+05:30",
  },
  {
    href: "/language-switching",
    title: "Language switching",
    meta: "Scenario setting · in progress",
    surface: "Scenario Edit",
    description:
      "What the voice does when a caller changes language mid-call: keep it, or hand off to a persona for the new language.",
    icon: LanguageSkillIcon,
    tickets: ["DES-199"],
    added: "2026-10-07T13:54+05:30",
  },
  {
    href: "/org-access",
    title: "Invite-only organization access",
    meta: "Page + dialogs · exploration",
    surface: "Settings",
    description:
      "People join an organization only by invite: members and pending invites, an optional invite link, Sarj creating an organization with its owner, and what the invited person sees.",
    icon: UserGroupIcon,
    tickets: ["DES-197"],
    added: "2026-10-07T16:09+05:30",
  },
  {
    href: "/live-scenarios",
    title: "Live scenario status and change warning",
    meta: "Editor + index · in progress",
    surface: "Scenario Edit",
    description:
      "A manual Live switch on the scenario editor, a Live chip wherever a scenario's status shows (editor, scenarios index with a Live filter, playground list), and the save review that warns before a change reaches the next call.",
    icon: LiveStreaming02Icon,
    tickets: ["DES-203"],
    added: "2026-10-08T09:48+05:30",
  },
  {
    href: "/voice-cloning",
    title: "Voice cloning on the platform",
    meta: "Flow · in progress",
    surface: "Personas",
    description:
      "Clone a voice from a 6–20 second sample: record or upload, check the transcript, hear the clone before naming it, consent, and pick it on a persona. Pending publish, failure and delete-while-in-use states included.",
    icon: VoiceIdIcon,
    tickets: ["DES-198", "INT-191", "PLT-4472"],
    added: "2026-10-11T06:44:51.851Z",
  },
  {
    href: "/config-versioning",
    title: "Configuration versioning: save, publish, history, apply",
    meta: "Page · in progress",
    surface: "Scenario Edit",
    description:
      "Every save of a scenario's prompt and first message is a version, with an optional note. On a live scenario a save waits for a publish; history compares any two versions, applies an older one or copies it to edit, and a call's details show the version it ran on.",
    icon: WorkHistoryIcon,
    tickets: ["DES-202", "INT-253", "PLT-4477"],
    added: "2026-10-12T02:36:18.960Z",
  },
  {
    href: "/publish-approval",
    title: "Publish approval for live scenario changes",
    meta: "Page · in progress",
    surface: "Scenario Edit",
    description:
      "On a live scenario, publishing becomes a request: the requester writes why, the client approver reads an effect-first summary and approves or rejects, and the version goes in use only on approval. A feature of its own, after live and versioning ship.",
    icon: CheckmarkBadge01Icon,
    tickets: ["DES-204", "INT-253", "PLT-4477"],
    added: "2026-10-12T18:17:16.610Z",
  },
  {
    href: "/tool-calls-transcript",
    title: "Tool calls in the call transcript",
    meta: "Panel · exploration",
    surface: "Conversations",
    description:
      "Each tool call and its result as one row in the call transcript: the tool, what it returned, and a failure that can never read as a success.",
    icon: Wrench01Icon,
    tickets: ["DES-205"],
    added: "2026-10-15T04:24:13.803Z",
  },
  {
    href: "/dashboard",
    title: "Dashboard in line with the design system",
    meta: "Page · exploration",
    surface: null,
    description:
      "The dashboard's six number cards and the call volume chart, rebuilt on the system: neutral changes, one comparison label for the page, numbers on the type scale, no decorative icons or shadows, and chart colours that follow the brand.",
    icon: DashboardSquare01Icon,
    tickets: ["PROD-600"],
    added: "2026-10-20T08:57:18.871Z",
  },
  {
    href: "/review-tracking",
    title: "Keeping your place in conversation review",
    meta: "Page · 8 ideas, 3 competitors",
    surface: "Conversations",
    description:
      "Every idea from the INT-287 thread for tracking which conversation to review next, on the Conversations page as it ships: row numbers, last opened, unread dots, a reviewed checkbox, saved for later, watch history, a review mode and a review session. Then how ElevenLabs, Vapi and Intercom handle it.",
    icon: SparklesIcon,
    tickets: ["INT-287"],
    added: "2026-10-28T05:02:24.794Z",
  },
  // `npm run new` appends new mockups above this line.
]

const SEARCH_FIELDS: { text: (mockup: Mockup) => string; weight: number }[] = [
  { text: (mockup) => mockup.title, weight: 3 },
  { text: (mockup) => mockup.tickets.join(" "), weight: 2.5 },
  { text: (mockup) => mockup.surface ?? "", weight: 2 },
  { text: (mockup) => mockup.meta, weight: 1.5 },
  { text: (mockup) => mockup.href.slice(1), weight: 1.5 },
  { text: (mockup) => mockup.description, weight: 1 },
]

const PHRASE_BONUS = 40

function scoreMockup(terms: Term[], mockup: Mockup, phrase: string): number {
  let total = 0

  for (const term of terms) {
    let best: number | null = null

    for (const { text, weight } of SEARCH_FIELDS) {
      const score = scoreTerm(term, prepareField(text(mockup)))
      if (score === null) continue

      const weighted = score * weight
      if (best === null || weighted > best) best = weighted
    }

    if (best === null) return 0
    total += best
  }

  if (terms.length > 1) {
    for (const { text, weight } of SEARCH_FIELDS) {
      if (prepareField(text(mockup)).normalized.includes(phrase)) {
        total += PHRASE_BONUS * weight
        break
      }
    }
  }

  return total
}

export function searchMockups(query: string): Mockup[] {
  const terms = prepareQuery(query)
  if (!terms.length) return MOCKUPS

  const phrase = terms.map((term) => term.normalized).join(" ")

  return MOCKUPS.flatMap((mockup, index) => {
    const score = scoreMockup(terms, mockup, phrase)
    return score === 0 ? [] : [{ mockup, index, score }]
  })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ mockup }) => mockup)
}

export function surfaceLabel(surface: Surface | null) {
  return surface ?? "No surface label"
}

export function surfaceId(surface: Surface | null) {
  return surface ? surface.toLowerCase().replace(/\s+/g, "-") : "unlabelled"
}

type SurfaceGroup = { surface: Surface | null; mockups: Mockup[] }

export function groupBySurface(
  mockups: Mockup[],
  { ranked = false }: { ranked?: boolean } = {},
): SurfaceGroup[] {
  const surfaces: (Surface | null)[] = [...SURFACES, null]

  const groups = surfaces.flatMap((surface) => {
    const matches = mockups.filter((mockup) => mockup.surface === surface)
    return matches.length ? [{ surface, mockups: matches }] : []
  })

  return ranked
    ? groups.sort(
        (a, b) => mockups.indexOf(a.mockups[0]) - mockups.indexOf(b.mockups[0]),
      )
    : groups
}

export type Order = "newest" | "oldest" | "section"

export function sortByAdded(
  mockups: Mockup[],
  order: "newest" | "oldest",
): Mockup[] {
  const sign = order === "newest" ? -1 : 1
  return [...mockups].sort(
    (a, b) =>
      sign *
      (Date.parse(a.added) - Date.parse(b.added) ||
        MOCKUPS.indexOf(a) - MOCKUPS.indexOf(b)),
  )
}

// The zone is fixed so the prerendered page and the browser print the same day.
export function addedLabel(mockup: Mockup) {
  return new Date(mockup.added).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  })
}
