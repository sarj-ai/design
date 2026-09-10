import {
  AiVoiceIcon,
  Alert02Icon,
  ArrowReloadHorizontalIcon,
  AudioWave01Icon,
  BookBookmark01Icon,
  CallOutgoing01Icon,
  DocumentAttachmentIcon,
  Key01Icon,
  Layers01Icon,
  LayoutTable01Icon,
  Message01Icon,
  ShieldKeyIcon,
  SparklesIcon,
  TelephoneIcon,
  Timer01Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

import { prepareField, prepareQuery, scoreTerm, type Term } from "@/lib/fuzzy"

/**
 * Linear's **Surface** label group, in the order the index renders it. Every
 * design ticket carries exactly one label from this group.
 *
 * It is on the index because of the rule the group exists for — *one page, one
 * live design*: a new design on a surface has to carry every design already in
 * flight on that same surface. That is only checkable if the designs on a
 * surface sit next to each other.
 *
 * Keep this identical to the group in Linear. It is a vocabulary, not a set of
 * headings to invent from.
 */
export const SURFACES = [
  "Conversations",
  "Personas",
  "Scenarios Index",
  "Scenario Edit",
  "Knowledge Bases",
  "Integrations Pages",
  "Playground",
  "Settings",
] as const

export type Surface = (typeof SURFACES)[number]

/**
 * The index. One entry per mockup — one request, one route, one card.
 *
 * `npm run new <slug>` appends here, so keep the array literal shape: entries
 * separated by `},` and the sentinel comment at the end where new ones land.
 */
export type Mockup = {
  /** Route it lives at, which is also its identity in the list. */
  href: string
  title: string
  /** Shape and state, e.g. "Drawer · in progress". */
  meta: string
  /**
   * The product surface it redesigns, from the Surface group above. `null`
   * when no label in that group covers it — the group has nothing for the
   * Reports page or for the platform-admin screens Sarj staff use.
   */
  surface: Surface | null
  description: string
  icon: IconSvgElement
  /** Linear IDs the mockup answers, e.g. "DES-149". */
  tickets: string[]
  /**
   * Where `npm run registry` starts following imports for this mockup, as a
   * path under `src/`. Defaults to the route, which pulls the workspace
   * chrome in with it — right for a screen, wrong for a mockup whose
   * deliverable is one component a consumer wants to drop into their own app.
   */
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
  },
  {
    href: "/knowledge-base",
    title: "Knowledge base — files, text and URLs",
    meta: "Page · exploration",
    surface: "Knowledge Bases",
    description:
      "The knowledge base as a resource the agent queries rather than prompt text: documents added from files, a pasted note or a URL, each carrying its extraction state, and the summary that tells the agent when to reach for it.",
    icon: BookBookmark01Icon,
    /* Both have this page attached in Linear: DES-136, and DES-149, the KB
       experience upgrade this design answers. */
    tickets: ["DES-136", "DES-149"],
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
  },
  {
    href: "/conversations-revamp",
    title: "Conversations with the revamped call drawer",
    meta: "Page + drawer · integration",
    surface: "Conversations",
    description:
      "The Conversations page as it ships today — app shell, filter bar, result count, table and pagination — with the revamped call drawer (revamp 4) opening from its rows: one transcript with the STT mishearings marked in place, search, a resizable split, and a section panel the reader can reorder.",
    icon: LayoutTable01Icon,
    /* One design answering four tickets, which is why they are all on the
       card: the index page and the drawer are the same screen, and the
       scheduling and status work both land inside it. */
    tickets: ["DES-110", "DES-134", "DES-147", "DES-157"],
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
  },
  {
    /* Under Personas rather than Settings, and directly after the index: what
       this redesigns is the Backchannel section inside the persona editor.
       `backchannel-settings.tsx` in the app has three consumers — the persona
       create form, the persona update form, and the "Persona Default Values"
       block of global settings — so backchannelling has no life outside a
       persona to file it under. */
    href: "/listener-cues",
    title: "Design backchanneling without mid-conversation interruption",
    meta: "Drawer · exploration",
    surface: "Personas",
    description:
      "Mid-turn listener cues configured beside the existing post-turn filler words: a weighted cue mix that always totals 100%, an exact response-frequency slider with the recommended range marked, timing limits, per-language approved clips, and the inherit-then-override lifecycle across global settings and one persona.",
    icon: AudioWave01Icon,
    tickets: ["DIS-63", "DES-172"],
  },
  {
    /* Beside listener-cues, and for the same reason: this is the persona
       editor's Backchannel section too. The two are competing designs of that
       one section, which is what the surface group exists to put side by side
       — a new design on a surface has to carry every design already in flight
       on it. */
    href: "/phrase-mappings",
    title: "Design persona-specific backchannel phrase-response mappings",
    meta: "Drawer · exploration",
    surface: "Personas",
    description:
      "Phrase-response mappings inside the existing Filler words drawer: several caller phrases map to one deterministic acknowledgment, kept exactly as typed so the voice pronounces it right. Priority ordering, whole-utterance or within-utterance matching, conflict validation, and a persona override that replaces the global set.",
    icon: Message01Icon,
    tickets: ["DES-171", "DIS-21"],
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
    /* The dialog is the deliverable. Installing it should not also install a
       Reports page and the app sidebar the consumer already has. */
    registryEntry: "components/configure-report/configure-report-dialog.tsx",
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
  },
  // `npm run new` appends new mockups above this line.
]

/** What a query can hit, and how much a hit there counts toward the ranking. */
const SEARCH_FIELDS: { text: (mockup: Mockup) => string; weight: number }[] = [
  { text: (mockup) => mockup.title, weight: 3 },
  { text: (mockup) => mockup.tickets.join(" "), weight: 2.5 },
  { text: (mockup) => mockup.surface ?? "", weight: 2 },
  { text: (mockup) => mockup.meta, weight: 1.5 },
  /* The slug, because it is what the URL and the screenshots are named after,
     and it is often the shortest true name a mockup has. */
  { text: (mockup) => mockup.href.slice(1), weight: 1.5 },
  { text: (mockup) => mockup.description, weight: 1 },
]

/** What a term matching the whole query as written is worth on top. */
const PHRASE_BONUS = 40

/**
 * How well a mockup answers a query, or `null` when it does not.
 *
 * Two rules do most of the work here. **Every term has to land somewhere** —
 * "drawer settings" means both, so a mockup that is only a drawer drops out
 * rather than ranking slightly lower. And **each term may land in a different
 * field**, so that query is satisfied by the meta and the surface together,
 * which is how people actually describe a screen.
 */
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

  /* Words next to each other in the order they were typed beat the same words
     scattered across a card, so "call drawer" ranks the mockup whose meta says
     exactly that first. */
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

/** Ranked matches, or the full list when the query is empty. */
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

/** What the index calls a group. The unlabelled ones need a name too. */
export function surfaceLabel(surface: Surface | null) {
  return surface ?? "No surface label"
}

/**
 * A group's anchor on the index, so the dock at the foot of the page can jump
 * to it. Kebab-case, which is what the surface names collapse to.
 */
export function surfaceId(surface: Surface | null) {
  return surface ? surface.toLowerCase().replace(/\s+/g, "-") : "unlabelled"
}

export type SurfaceGroup = { surface: Surface | null; mockups: Mockup[] }

/**
 * The list split by surface, in `SURFACES` order, with the unlabelled ones
 * last. Surfaces nothing has been designed for yet are dropped rather than
 * rendered empty — a heading with no cards under it is noise on an index this
 * short.
 *
 * `ranked` puts the group holding the best match first instead, because a
 * fixed order and a ranked list do not fit together: the card the reader
 * searched for is the top card of its group, but its group can be three
 * headings down the page. Browsing keeps the stable order — it is what makes
 * the index somewhere you can find things twice.
 */
export function groupBySurface(
  mockups: Mockup[],
  { ranked = false }: { ranked?: boolean } = {},
): SurfaceGroup[] {
  const surfaces: (Surface | null)[] = [...SURFACES, null]

  const groups = surfaces.flatMap((surface) => {
    const matches = mockups.filter((mockup) => mockup.surface === surface)
    return matches.length ? [{ surface, mockups: matches }] : []
  })

  /* `mockups` arrives ranked and `filter` keeps that order, so a group's
     first card is its best one. */
  return ranked
    ? groups.sort(
        (a, b) => mockups.indexOf(a.mockups[0]) - mockups.indexOf(b.mockups[0]),
      )
    : groups
}
