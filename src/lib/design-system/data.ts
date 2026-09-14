/**
 * The design system, written down.
 *
 * Content only. It lives here rather than inside the page because the rules
 * are a list that gets edited, and a list that gets edited should not be
 * tangled up in the markup that renders it.
 */

/** A named rule and the one line that says what it means. */
export type Rule = {
  label: string
  detail: string
}

/**
 * One of the seven non-negotiables. The `id` picks the worked example that runs
 * underneath it in `RuleDemo` — the rule and its example are one thing, so they
 * are keyed together rather than left to line up by position.
 */
export type GlobalRule = Rule & {
  id:
    | "icons"
    | "shadows"
    | "typography"
    | "spacing"
    | "radius"
    | "accessibility"
    | "scrollbars"
}

/**
 * The non-negotiables. Seven rules, no exceptions, and none of them is a
 * judgement call — which is why they are the first thing on the page.
 */
export const GLOBAL_RULES: GlobalRule[] = [
  {
    id: "icons",
    label: "Icons",
    detail: "Only HugeIcons, at one size and one style across the product.",
  },
  {
    id: "shadows",
    label: "Shadows",
    detail: "One shared set, for elevation or separation. Never decorative.",
  },
  {
    id: "typography",
    label: "Typography",
    detail: "One scale of sizes, weights, line heights and heading styles.",
  },
  {
    id: "spacing",
    label: "Spacing",
    detail: "One scale, and the same rhythm everywhere.",
  },
  { id: "radius", label: "Radius", detail: "A small fixed set of tokens." },
  {
    id: "scrollbars",
    label: "Scrollbars",
    detail:
      "One width and one token, native or ScrollArea. Never an arrow, never a track.",
  },
  {
    id: "accessibility",
    label: "Accessibility",
    detail:
      "Keyboard, visible focus, contrast and labels — part of the pattern, not a later pass.",
  },
]

/** One of the four places a piece of configuration or creation can live. */
export type SurfaceChoice = {
  id: "inline" | "drawer" | "popup" | "multi-step"
  title: string
  /** What this surface is for. */
  criterion: string
  /** What it is never for. The exclusions are the half that gets argued. */
  avoid: string
  examples: string
}

/**
 * The decision the rest of the system hangs off. Two questions, in order: is
 * the reader deciding, or configuring? A decision is a pop-up. Configuration
 * stays inline while it fits beside the value it changes, and becomes a drawer
 * when there is enough of it to crowd the page.
 */
export const SURFACE_CHOICES: SurfaceChoice[] = [
  {
    id: "inline",
    title: "Inline",
    criterion:
      "Changing or configuring something the page is already about, with room for the control where the value sits.",
    avoid: "deciding anything, and creating anything.",
    examples:
      "Agent model, agent instructions, voice selection, project settings.",
  },
  {
    id: "drawer",
    title: "Drawer",
    criterion:
      "Enough to configure, or enough to read, that it would crowd the page — and the page behind it still matters.",
    avoid: "a single quick decision, which does not need a panel.",
    examples: "Agent page → Tools → configure one tool.",
  },
  {
    id: "popup",
    title: "Pop-up",
    criterion:
      "A quick decision, and only that: deleting, confirming, or making something that fits on one screen.",
    avoid: "configuration, and anything with more to read — that is a drawer.",
    examples: "Delete agent, import voice, create API key.",
  },
  {
    /* The fourth surface, and the one that gets skipped: a creation too long
       for a pop-up is usually built as a pop-up anyway, with a scrollbar. It
       is here so the comparison names the point where that stops working. */
    id: "multi-step",
    title: "Multi-step creation",
    criterion:
      "Creating one object that does not fit on one screen, or where a later answer depends on an earlier one.",
    avoid:
      "editing what already exists — a made object is configured inline or in a drawer.",
    examples: "Create voice, connect a telephony endpoint.",
  },
]

/**
 * Content for the four surface demos, and nothing beyond what they render.
 *
 * The demos configure a voice because that is the one object in the product
 * that legitimately gets every surface: picking one is inline, tuning one is a
 * drawer, deleting one is a pop-up, and making one runs across steps.
 */
export const DEMO_VOICES = [
  { id: "layla-gulf", label: "Layla — Gulf Arabic" },
  { id: "omar-msa", label: "Omar — Modern Standard" },
  { id: "sara-egyptian", label: "Sara — Egyptian" },
]

export const DEMO_RECORDINGS = [
  { id: "CL-8840", label: "CL-8840 — Al Bilad Bank, 10:11" },
  { id: "CL-8842", label: "CL-8842 — Rawabi Holding, 3:44" },
]

/** The anatomy of the index page, named part by part. */
export const INDEX_PAGE_PARTS: Rule[] = [
  { label: "Header", detail: "Title, optional description, primary action." },
  {
    label: "Controls",
    detail: "Search, filters, sort — only the ones this collection needs.",
  },
  { label: "Content", detail: "Table, list, grid or cards." },
  {
    label: "Actions",
    detail: "Per row, overflow, destructive, and bulk once selection exists.",
  },
  { label: "States", detail: "Loading, empty, no results, error, populated." },
]

/* ---------------------------------------------------------------------------
 * The list table, moved here when /tables was folded into this page. It is the
 * index page's content, and the colour key for the chips those rows render.
 * ------------------------------------------------------------------------ */

export type CallRow = {
  id: string
  customer: string
  status: "completed" | "failed" | "in_progress" | "scheduled"
  /** Rides inside the status chip, dimmed, rather than in a column of its own. */
  cause: null | string
  direction: "inbound" | "outbound"
  scenario: string
  /** ISO 639-1 codes, uppercased by the chip. One chip each. */
  languages: string[]
  /** Seconds. Formatted at the call site so the column stays sortable. */
  duration: null | number
  cost: null | number
  started: string
}

export const CALL_ROWS: CallRow[] = [
  {
    id: "CL-8842",
    customer: "Rawabi Holding",
    status: "completed",
    cause: null,
    direction: "inbound",
    scenario: "Appointment booking",
    languages: ["AR"],
    duration: 224,
    cost: 0.41,
    started: "12 Aug, 09:14",
  },
  {
    id: "CL-8841",
    customer: "Nadec Foods",
    status: "failed",
    cause: "not answered",
    direction: "outbound",
    scenario: "Payment reminder",
    languages: ["AR"],
    duration: null,
    cost: null,
    started: "12 Aug, 09:02",
  },
  {
    id: "CL-8840",
    customer: "Al Bilad Bank",
    status: "completed",
    cause: "transferred",
    direction: "inbound",
    scenario: "Card dispute intake",
    languages: ["AR", "EN"],
    duration: 611,
    cost: 1.12,
    started: "12 Aug, 08:47",
  },
  {
    id: "CL-8839",
    customer: "Tamimi Markets",
    status: "in_progress",
    cause: null,
    direction: "outbound",
    scenario: "Delivery confirmation",
    languages: ["AR", "UR"],
    duration: 38,
    cost: null,
    started: "12 Aug, 08:41",
  },
  {
    id: "CL-8838",
    customer: "Solutions by STC",
    status: "scheduled",
    cause: "customer asked",
    direction: "outbound",
    scenario: "Renewal follow-up",
    languages: ["AR"],
    duration: null,
    cost: null,
    started: "13 Aug, 10:00",
  },
  {
    id: "CL-8837",
    customer: "Jarir Bookstore",
    status: "completed",
    cause: null,
    direction: "inbound",
    scenario: "Order status",
    languages: ["EN"],
    duration: 96,
    cost: 0.18,
    started: "12 Aug, 08:22",
  },
]

/**
 * Every chip the table renders, and why it is the colour it is.
 *
 * The intent tokens in globals.css settle what each tint means across the app;
 * this list is the layer under that — which of the four states gets which
 * verdict, and which chips are deliberately not verdicts at all. Both halves
 * matter: a reader who cannot see why `scheduled` is purple will pick amber for
 * it on the next screen.
 */
export type ChipNote = {
  label: string
  tone: string
  /** Mapped to a component at the call site so the data file stays data. */
  icon: "completed" | "failed" | "inbound" | "running" | "scheduled" | null
  token: string
  why: string
}

export const CHIP_NOTES: ChipNote[] = [
  {
    label: "Completed",
    tone: "bg-success-tint text-success-tint-foreground",
    icon: "completed",
    token: "success-tint",
    why: "Nothing is left to do, so the reader can skip the row. The cause rides inside the chip, dimmed.",
  },
  {
    label: "Failed",
    tone: "bg-destructive-tint text-destructive-tint-foreground",
    icon: "failed",
    token: "destructive-tint",
    why: "The row is the failure, and the only tone that should pull the eye down the column.",
  },
  {
    label: "In progress",
    tone: "bg-warning-tint text-warning-tint-foreground",
    icon: "running",
    token: "warning-tint",
    why: "Unsettled, not wrong — the same reason the cost beside it is still a dash.",
  },
  {
    label: "Scheduled",
    tone: "bg-primary-tint text-primary-tint-foreground",
    icon: "scheduled",
    token: "primary-tint",
    why: "Deliberate, and not yet the platform's turn. Warning would read as running late.",
  },
  {
    label: "inbound",
    tone: "bg-muted text-muted-foreground",
    icon: "inbound",
    token: "muted",
    why: "Direction is a category, not a verdict. The arrow separates the two, so colour does not have to.",
  },
  {
    label: "Order status",
    tone: "bg-muted text-muted-foreground",
    icon: null,
    token: "muted",
    why: "Same reason, and no icon — scenario names are per workspace, so no glyph fits them all.",
  },
]

/**
 * What goes in a cell that has nothing in it.
 *
 * The rule the list is answering: **one reason, one rendering, across the whole
 * table.** A dash in one column and a word in the next, for the same reason, is
 * two conventions doing one job — and the approval checklist gates on exactly
 * that ("one empty-value convention").
 */
export type EmptyValueNote = {
  /** Rendered as it appears in the cell. */
  sample: string
  /** The condition, or "Never" for the one that is here as a warning. */
  when: string
  why: string
}

export const EMPTY_VALUES: EmptyValueNote[] = [
  {
    sample: "—",
    when: "The value cannot exist for this row",
    why: "Nothing is missing, so nothing is said. A dash also end-aligns with the numbers above it.",
  },
  {
    sample: "Not set",
    when: "It could exist, and nobody has filled it in",
    why: "Worth a word, because the reader can go and set it.",
  },
  {
    sample: "Not analysed",
    when: "It could exist, and the system has not produced it yet",
    why: "Name what has not happened, so the reader waits rather than goes looking for a fix.",
  },
  {
    sample: "Unavailable",
    when: "Never",
    why: "It names no reason, so nobody can act on it. Every case it covers is one of the three above.",
  },
]

/**
 * The three languages the platform has, from `LANGUAGES` and
 * `LanguageLabels.en` in `precedent-iso/src/models/config.ts`. There is no
 * fourth, and no dialect: `Language` is flat ISO 639-1, and the Hamsa dialect
 * list is a TTS provider setting rather than a language a customer picks.
 */
export const LANGUAGES = [
  { code: "EN", name: "English" },
  { code: "AR", name: "Arabic" },
  { code: "UR", name: "Urdu" },
]

/** Code to name, for the tooltip on a chip. */
export const LANGUAGE_NAMES: Record<string, string> = Object.fromEntries(
  LANGUAGES.map((language) => [language.code, language.name]),
)

/**
 * When each button size is the right one.
 *
 * The four steps are 24, 28, 32 and 36px — close together on purpose, because
 * size is a density decision and not a hierarchy one. Two of them are pinned to
 * the form controls: `sm` is the height of a small Input or SelectTrigger and
 * `default` is the height of a normal one, which is what makes a filter bar
 * line up instead of stepping.
 */
export type ButtonSizeNote = {
  size: "xs" | "sm" | "default" | "lg"
  when: string
  why: string
}

export const BUTTON_SIZES: ButtonSizeNote[] = [
  {
    size: "xs",
    when: "Inside a table row or a dense toolbar",
    why: "24px. The row height is fixed, so the button fits it rather than setting it.",
  },
  {
    size: "sm",
    when: "Beside a small field, and in most cards and drawers",
    why: "28px, the height of a sm Input or Select. The most common size in the app.",
  },
  {
    size: "default",
    when: "Beside a normal field, and in page chrome",
    why: "32px, the height of a default Input and SelectTrigger — which is what makes a filter bar line up.",
  },
  {
    size: "lg",
    when: "When it is the only thing on the surface to do",
    why: "36px. An empty state\u2019s single action: bigger because nothing is next to it, not because it matters more.",
  },
]

/**
 * The eight form decisions, settled.
 *
 * Read out of the real forms in `bulbul` — persona, voice, batch calls, the
 * scenario editor — rather than invented, except where the app contradicts
 * itself. Where it does, the newest shipped code wins and the divergence is
 * named in the rule.
 */
export const FORM_RULES: Rule[] = [
  {
    label: "The label",
    detail:
      "Above the control, text-sm font-medium, at full text-foreground. Never muted: at text-muted-foreground it clears AA by 0.04 and stops being tellable from its own description, which is the same size in the same grey. A switch or checkbox is the exception to placement — label at the start, control at the end, on one row.",
  },
  {
    label: "Required and optional",
    detail:
      "Mark the minority. A destructive asterisk on the required ones where most are optional; “(optional)” after the label where most are required. Never both in one form, and never the word “Required”.",
  },
  {
    label: "Help text on a form",
    detail:
      "One sentence under the label, above the control — never below it, and that includes the line saying why a read-only value cannot be edited. Constraints, formats, and what the choice changes elsewhere. A form is met once and answered once, so the reader gets it without asking.",
  },
  {
    label: "Help text in a drawer or a dialog",
    detail:
      "An (i) beside the label, on hover. A panel is 384px and a dialog step is two columns, so a sentence under every label is a paragraph under every label and the settings stop being scannable. These surfaces are read many times and answered once. The cost is real — a constraint behind a hover is one a reader can set wrong — so put a hard limit in the label where it matters and the rest in the hint.",
  },
  {
    label: "One language per screen",
    detail:
      "Whichever of the two a screen uses, it uses for every field on it. Both at once and the reader has to learn which sentences live where, which is a rule nobody reads a form to discover.",
  },
  {
    label: "Error messages",
    detail:
      "Under the label with the help text, above the control, saying what to do rather than what went wrong. Nothing sits below a control — the box is the last thing in every field, so a column of fields keeps one rhythm instead of growing a line under whichever one is in trouble. The control's border carries the state and the label does not turn — the field's name is not the thing that is wrong, and a column of labels that changes colour is the one stable thing you were scanning to find the error. A failed submit goes to a toast.",
  },
  {
    label: "Validation timing",
    detail:
      "On submit, then live on change once a field has failed once. Nothing is marked wrong before the reader has finished typing it the first time.",
  },
  {
    label: "Control width",
    detail:
      "As wide as the longest plausible value, up to the form's own column. A three-character value in a full-width box asks for a sentence and then rejects one.",
  },
  {
    label: "Placeholders",
    detail:
      "An example of the shape, never a second label and never a constraint. It is gone by the second keystroke, so nothing the reader needs while typing can live in it.",
  },
  {
    label: "Field grouping",
    detail:
      "A group gets a legend. A bordered box with no heading is not a group — the reader is left to infer what it collects.",
  },
  {
    label: "Form actions",
    detail:
      "An end-aligned footer: Cancel as outline, then the primary. A long editor swaps the footer for a bar that appears only once something is dirty.",
  },
  {
    label: "Disabled and read-only",
    detail:
      "A value that cannot be edited stays on screen, disabled, with one line saying why. Never swapped for plain text, never removed. The line is dropped when the control that turns editing on is on the same screen — a panel of dead switches under the switch that killed them needs no caption, and one that appears in only one state is a section the reader re-reads every visit.",
  },
]

/** Which variant carries which kind of action. */
export type ButtonRoleNote = {
  variant: "default" | "outline" | "ghost" | "destructive"
  label: string
  when: string
}

export const BUTTON_ROLES: ButtonRoleNote[] = [
  {
    variant: "default",
    label: "Save",
    when: "The one primary action on the surface. One per form, one per page.",
  },
  {
    variant: "outline",
    label: "Cancel",
    when: "Cancel, and anything secondary standing beside a primary.",
  },
  {
    variant: "ghost",
    label: "Duplicate",
    when: "Inside a row or a toolbar, where a border on every action would be noise.",
  },
  {
    variant: "destructive",
    label: "Delete",
    when: "Delete, remove, revoke. A soft tint rather than solid red: it confirms first, so it does not also need to shout.",
  },
]

/**
 * A page pattern, split into what it cannot ship without and what it grows.
 *
 * The split is the point. "Anatomy" as one flat list reads as a checklist of
 * things every page must have, and half of them are not — a bulk action on a
 * collection nobody multi-selects is a feature with a cost and no reader.
 */
export type PatternAnatomy = {
  id: string
  title: string
  description: string
  /** Ship without one of these and the pattern is broken. */
  required: Rule[]
  /** Earn their place per surface; absent by default. */
  optional: Rule[]
}

export const PATTERNS: PatternAnatomy[] = [
  {
    id: "multi-step-create",
    title: "Multi-step creation",
    description:
      "Making one object across several screens, because it will not fit on one.",
    required: [
      {
        label: "Step indicator",
        detail: "Which step this is, and how many there are.",
      },
      {
        label: "One decision per step",
        detail: "A step that asks nothing is a step to delete.",
      },
      {
        label: "Back",
        detail:
          "Every step after the first is leavable without losing what is in it.",
      },
      {
        label: "Review",
        detail:
          "The last step shows what is about to be created, before it is.",
      },
      {
        label: "Submitting state",
        detail: "The primary disables and says what is happening.",
      },
      {
        label: "Failure state",
        detail:
          "Which step broke, and the way back to it — never a bare toast.",
      },
    ],
    /* Deliberately empty. The four that were here — named steps, jumping
       back, saved draft, running summary — were removed as noise; the shell
       enforces the required list and the rest was read as a menu of things to
       add. `PatternAnatomy` drops the whole section when this is empty. */
    optional: [],
  },
]

/* ---------------------------------------------------------------------------
 * The docs navigation.
 *
 * The page reads as a documentation site rather than one long scroll: a rail
 * on the start edge listing everything the system has, and one topic in the
 * pane beside it. The rail is the table of contents *and* the inventory —
 * scanning it is how you find out that `Marker` exists at all, which a tab
 * strip of three words could never say.
 *
 * Everything here is a client-side view. AGENTS.md keeps alternate views of
 * one thing on one route, so a topic switches the pane rather than the URL.
 * ------------------------------------------------------------------------ */

/** A leaf in the rail: a title, and the one line the pane opens with. */
export type DocsPage = {
  id: string
  title: string
  description: string
  /**
   * The page documents a decision of ours rather than an inherited default —
   * somewhere following stock shadcn or Tailwind would give a different answer.
   * The rail and the section index both mark these, so a reader can see at a
   * glance which half of the system is ours to argue about.
   */
  sarj?: boolean
}

/** Leaves under an optional small label, the way `Components` splits its
    guidance from its inventory. */
export type DocsGroup = {
  label?: string
  pages: DocsPage[]
}

/** A top-level entry in the rail. It is itself a page — clicking it opens the
    section's index rather than nothing. */
export type DocsSection = DocsPage & { groups: DocsGroup[] }

/**
 * The twelve groups the primitive inventory is filed under.
 *
 * Named here rather than inside the catalog because the rail lists them and
 * the catalog renders them — one array means the two cannot drift.
 */
export type CatalogGroupId =
  | "surface"
  | "actions"
  | "status"
  | "text-entry"
  | "choice"
  | "form-structure"
  | "data"
  | "overlays"
  | "navigation"
  | "feedback"
  | "conversation"
  | "effects"

export type CatalogGroup = DocsPage & { id: CatalogGroupId }

/**
 * Components this product added, kept apart from the shadcn inventory.
 *
 * The distinction is who maintains them: a shadcn primitive is regenerated by
 * `npx shadcn add` and its quirks are upstream's, while everything here is
 * ours to fix. Filing them together hid that — FileCard sat under Surface
 * beside Card as though the two came from the same place.
 */
export const PLATFORM_COMPONENTS: DocsPage[] = [
  {
    id: "file-card",
    title: "FileCard",
    description:
      "The kind of source a knowledge base is being given, where a row of text does not carry it.",
    sarj: true,
  },
  {
    id: "dot-pattern",
    title: "DotPattern",
    description: "A field of dots behind a panel. Never over content.",
    sarj: true,
  },
]

export const CATALOG_GROUPS: CatalogGroup[] = [
  {
    id: "surface",
    title: "Surface and layout",
    description:
      "The boxes everything else sits in, and the ways to fold one away.",
  },
  {
    id: "actions",
    title: "Actions",
    description: "Anything you press.",
  },
  {
    id: "status",
    title: "Status and identity",
    description: "What state a thing is in, and who or what it is.",
  },
  {
    id: "text-entry",
    title: "Text entry",
    description: "Typing, in each shape the product asks for it.",
  },
  {
    id: "choice",
    title: "Choice",
    description: "Picking one, picking several, or picking a date.",
  },
  {
    id: "form-structure",
    title: "Form structure",
    description: "The label, description and error that wrap every control.",
  },
  {
    id: "data",
    title: "Data",
    description: "Rows, series, and the pages they come in.",
  },
  {
    id: "overlays",
    title: "Overlays",
    description:
      "Everything that opens over the page. Which one is a Patterns question.",
  },
  {
    id: "navigation",
    title: "Navigation",
    description: "Getting between places, and saying where you are.",
  },
  {
    id: "feedback",
    title: "Feedback",
    description: "Saying what happened, or that nothing has yet.",
  },
  {
    id: "conversation",
    title: "Conversation and media",
    description: "Transcripts, attachments, and the frames they sit in.",
  },
  {
    id: "effects",
    title: "Effects and utilities",
    description: "The three that are behaviour rather than surface.",
  },
]

/** Colour leads, then the seven rules in the order the source document has
    them. Each rule's own `detail` is the line its pane opens with. */
/**
 * The foundations where stock shadcn or Tailwind would answer differently:
 * icons are HugeIcons where shadcn ships lucide, shadows are banned outright
 * where shadcn leans on them, the type scale is Nunito, and the scrollbar is
 * one we draw. Spacing, radius and accessibility are left unmarked — those
 * are the ordinary answers, and marking them would say nothing.
 */
const SARJ_FOUNDATIONS = new Set([
  "icons",
  "shadows",
  "typography",
  "scrollbars",
])

const FOUNDATION_PAGES: DocsPage[] = [
  {
    id: "colour",
    title: "Colour",
    description:
      "All 57 tokens in globals.css. A colour that is not on this page does not exist.",
    sarj: true,
  },
  /* Beside colour rather than under Motion, where the lint rule that enforces
     it lives: a layer is a token like any other, and the reason it was being
     guessed at is that nothing listed the names. */
  {
    id: "layering",
    title: "Layering",
    description:
      "Nine named layers. Name the layer, never the number \u2014 a raw z-index is a guess about what else is on the page.",
    sarj: true,
  },
  ...GLOBAL_RULES.map((rule) => ({
    id: rule.id,
    title: rule.label,
    description: rule.detail,
    sarj: SARJ_FOUNDATIONS.has(rule.id),
  })),
  /* The heights were written down twice \u2014 once under Buttons as four sizes,
     once nowhere \u2014 and the half that got lost is the half that matters: they
     are pinned to the fields beside them, so none of the four is free to move. */
  {
    id: "control-scale",
    title: "Control scale",
    description:
      "Four heights, shared by every control. A button is pinned to the field it sits next to, which is what makes a filter bar line up instead of stepping.",
    sarj: true,
  },
  /* Last, because it is the one page that is about the others: ten of the
     rules above are not advice, and a reader is better off knowing which. */
  {
    id: "enforcement",
    title: "Enforcement",
    description:
      "Ten rules npm run lint fails you for. Everything else on this site is a decision; these are errors.",
    sarj: true,
  },
]

/**
 * The motion rules, which lint already enforces.
 *
 * They live in `eslint-rules/rules/motion-*.mjs` and were unwritten here, so
 * the only way to learn them was to break one and read the error. Three of the
 * ten enforced rules are motion rules; none of them had a page.
 */
export type MotionRule = {
  id:
    | "easing"
    | "duration"
    | "animatable"
    | "reduced-motion"
    | "motion-performance"
  label: string
  detail: string
}

export const MOTION_RULES: MotionRule[] = [
  {
    id: "easing",
    label: "Easing",
    detail:
      "Two curves. Out for anything entering or leaving, in-out for something already on screen that moves.",
  },
  {
    id: "duration",
    label: "Duration",
    detail:
      "Six steps, and nothing over 300ms. Past that an animation stops reading as feedback and starts reading as latency.",
  },
  {
    id: "animatable",
    label: "What may animate",
    detail:
      "Transform and opacity. They are the only two properties the browser hands to the compositor.",
  },
  {
    id: "reduced-motion",
    label: "Reduced motion",
    detail:
      "Every animated element carries its own escape. No exception for opacity, and none for colour.",
  },
  {
    id: "motion-performance",
    label: "Performance",
    detail:
      "Picking the right property is most of it. The rest is not making React re-render sixty times a second.",
  },
]

const MOTION_PAGES: DocsPage[] = MOTION_RULES.map((rule) => ({
  id: rule.id,
  title: rule.label,
  description: rule.detail,
  sarj: true,
}))

const PATTERN_PAGES: DocsPage[] = [
  {
    id: "buttons",
    title: "Buttons",
    description:
      "Four sizes and four roles. Size is a density decision; the role is the hierarchy one.",
    sarj: true,
  },
  {
    id: "forms",
    title: "Forms",
    description:
      "Every decision settled, and all of them visible in the form beside them.",
    sarj: true,
  },
  {
    id: "surfaces",
    title: "Choosing a surface",
    description:
      "Deciding gets a pop-up and creating gets steps. Configuring stays inline while it fits, and moves to a drawer when it does not.",
    sarj: true,
  },
  {
    id: PATTERNS[0].id,
    title: PATTERNS[0].title,
    description: PATTERNS[0].description,
    sarj: true,
  },
  {
    id: "tabs",
    title: "Tabs",
    description:
      "One object, several views of it. Never steps in a flow, and never two different objects.",
    sarj: true,
  },
  {
    id: "drawer",
    title: "Drawer",
    description:
      "Configuring one thing, or showing one thing, beside the page it belongs to.",
    sarj: true,
  },
  {
    id: "stepper",
    title: "Stepper",
    description:
      "Vertical where each step needs a line of its own, horizontal where the labels fit.",
    sarj: true,
  },
  {
    id: "selection",
    title: "Selection",
    description:
      "What a card looks like when it is the one you picked. The edge changes and nothing else does.",
    sarj: true,
  },
  {
    id: "index-page",
    title: "Index page",
    description:
      "A collection of one kind of object — agents, voices, API keys.",
    sarj: true,
  },
  /* Its own topic rather than a note under the index page: the same shape
     answers a tab, a detail panel and a settings block, and the index page is
     only the place it is seen most. */
  {
    id: "tables",
    title: "Tables",
    description:
      "One container, one header band, one row height. Every table in the product is this table with different columns.",
    sarj: true,
  },
  {
    id: "pagination",
    title: "Pagination",
    description:
      "Cursor controls and a page size, in one place under the table. A list either has both or has neither.",
    sarj: true,
  },
]

/**
 * The four states an index page has that are not the populated one.
 *
 * A group of their own under Patterns because they are the half that gets
 * skipped: a screen is drawn full, shipped, and then meets an empty account, a
 * slow request, a filter that matches nothing, or a 500. Each of those is a
 * different sentence to write, and running them together is what produces a
 * spinner where an empty state belongs.
 */
const STATE_PAGES: DocsPage[] = [
  {
    id: "loading",
    title: "Loading",
    description:
      "A skeleton in the shape of what is coming. Same columns, same row height, so nothing moves when the data lands.",
    sarj: true,
  },
  {
    id: "empty-state",
    title: "Empty state",
    description:
      "Nothing here yet, and the one action that changes that. One primitive, one copy convention.",
    sarj: true,
  },
  {
    id: "no-results",
    title: "No results",
    description:
      "The collection has rows; this filter does not. Never the empty state, because the fix is the filter.",
    sarj: true,
  },
  {
    id: "error-state",
    title: "Error",
    description:
      "Name what failed and offer the retry. \u201cSomething went wrong\u201d is what a page says when nobody decided.",
    sarj: true,
  },
]

export const DOCS_SECTIONS: DocsSection[] = [
  {
    id: "foundations",
    title: "Foundations",
    description:
      "The fixed half of the system. Nothing here is a judgement call, which is what stops the decisions further down from being re-argued.",
    groups: [{ pages: FOUNDATION_PAGES }],
  },
  /* Its own section rather than a page under Foundations: three of the ten
     enforced rules are motion rules, and each one is a different question —
     which curve, how long, what may move, and who has asked not to see it. */
  {
    id: "motion",
    title: "Motion",
    description:
      "When something moves, how far, and for how long. Every rule here is one lint already fails you for.",
    sarj: true,
    groups: [{ pages: MOTION_PAGES }],
  },
  {
    id: "patterns",
    title: "Patterns",
    description:
      "The shapes to reach for first, and what each one cannot ship without.",
    groups: [
      { pages: PATTERN_PAGES },
      /* Labelled, so the four read as one list with one job rather than four
         more shapes filed after the shapes. */
      { label: "States", pages: STATE_PAGES },
    ],
  },
  {
    id: "custom-components",
    title: "Custom components",
    description:
      "Not shadcn. Added for this product, and ours to maintain rather than upstream's.",
    sarj: true,
    groups: [{ pages: PLATFORM_COMPONENTS }],
  },
  /* Last on purpose: it is the inventory you look something up in, not the
     part anyone reads through. Everything above it is a decision of ours. */
  {
    id: "components",
    title: "shadcn components",
    description:
      "Every shadcn primitive in src/components/ui, running rather than described. If one of these covers it, nothing gets hand-rolled.",
    groups: [{ pages: CATALOG_GROUPS }],
  },
]

/* ---------------------------------------------------------------------------
 * Layering. The nine `--z-*` tokens in globals.css, in order, with what each
 * one is for. Written down because the alternative is what the product does
 * today: two sticky bars and five fullscreen overlays all on a raw z-50, with
 * no ordering guarantee between them.
 * ------------------------------------------------------------------------ */

export type LayerToken = {
  /** The utility, which is what gets typed. */
  name: string
  value: number
  what: string
}

export const LAYER_TOKENS: LayerToken[] = [
  {
    name: "z-base",
    value: 0,
    what: "Normal flow. Everything, unless it is one of the eight below.",
  },
  {
    name: "z-raised",
    value: 10,
    what: "A sticky table header, or a card that lifts under the pointer.",
  },
  {
    name: "z-sticky",
    value: 20,
    what: "A page toolbar or filter bar that stays put while the list scrolls.",
  },
  {
    name: "z-nav",
    value: 30,
    what: "App sidebar and top nav. Above the page, below anything over it.",
  },
  { name: "z-overlay", value: 40, what: "The scrim behind a panel." },
  {
    name: "z-modal",
    value: 50,
    what: "Dialog, sheet and drawer content. 50 on purpose — it is what shadcn ships.",
  },
  {
    name: "z-popover",
    value: 60,
    what: "A popover or select opened from inside a modal, which has to clear it.",
  },
  {
    name: "z-toast",
    value: 70,
    what: "Toasts, which outrank the thing that produced them.",
  },
  {
    name: "z-tooltip",
    value: 80,
    what: "Always on top. Nothing is ever above a tooltip.",
  },
]

/* ---------------------------------------------------------------------------
 * The control scale. Four heights, and which primitives sit at each.
 * ------------------------------------------------------------------------ */

export type ControlStep = {
  px: number
  button: string
  /** The field at the same height, or null where nothing pairs with it. */
  field: null | string
  when: string
}

export const CONTROL_STEPS: ControlStep[] = [
  {
    px: 24,
    button: 'size="xs"',
    field: null,
    when: "Inside a table row. The row height is fixed, so the control fits it rather than setting it.",
  },
  {
    px: 28,
    button: 'size="sm"',
    field: 'Input / SelectTrigger size="sm"',
    when: "Cards, drawers and dense toolbars. The most common size in the app.",
  },
  {
    px: 32,
    button: "default",
    field: "Input / SelectTrigger default",
    when: "Page chrome, and any control standing beside a normal field.",
  },
  {
    px: 36,
    button: 'size="lg"',
    field: null,
    when: "The single action on an empty state. Bigger because nothing is next to it, not because it matters more.",
  },
]

/* ---------------------------------------------------------------------------
 * The ten enforced rules, from `eslint-rules/`. Named here so the reference
 * says which of its own pages are errors rather than advice.
 * ------------------------------------------------------------------------ */

export type LintRule = {
  /** The `sarj/*` rule id, as the error prints it. */
  id: string
  bans: string
  instead: string
}

export const LINT_RULES: LintRule[] = [
  {
    id: "no-raw-color",
    bans: "#hex, oklch(), rgb(), bg-purple-600, text-gray-500, colour in style",
    instead:
      "The semantic token. A literal never picks up a brand change or the whitelabel.",
  },
  {
    id: "no-arbitrary-scale",
    bans: "gap-[13px], rounded-[10px], text-[0.625rem], anything under text-xs",
    instead:
      "The scale — gap-4, rounded-lg, text-xs. If the value is genuinely missing, add a token.",
  },
  {
    id: "no-shadow",
    bans: "shadow-md, hover:shadow-lg, drop-shadow-*",
    instead:
      "A Card's ring, a bg-muted inset, or an overlay primitive that brings its own.",
  },
  {
    id: "z-index-tokens",
    bans: "z-50, z-[9999]",
    instead: "One of the nine names on the Layering page.",
  },
  {
    id: "use-ui-primitives",
    bans: "Raw button, input, select, table; a div with radius and edge and padding",
    instead: "The primitive. A raw element is still fine as an asChild child.",
  },
  {
    id: "no-primitive-override",
    bans: 'Button className="h-10 px-4 rounded-md", py-0 on a Card',
    instead:
      "A size or a variant. Margins and layout classes are always legal.",
  },
  {
    id: "icon-source",
    bans: "lucide-react outside src/components/ui",
    instead: "HugeIcons, through the mockup's own icons.tsx.",
  },
  {
    id: "motion-tokens",
    bans: "duration-500, ease-out, a raw cubic-bezier",
    instead:
      "duration-150 press, 200 popover, 200–300 dialog; ease-out-cubic or ease-in-out-cubic.",
  },
  {
    id: "motion-reduce",
    bans: "A transition-* or animate-* on its own",
    instead:
      "Pair it with motion-reduce:transition-none or motion-reduce:animate-none. No exception for opacity.",
  },
  {
    id: "no-layout-animation",
    bans: "transition-all, transition-[width], transition-[height]",
    instead:
      "Transform and opacity. They are the only two the browser hands to the compositor.",
  },
]

/* ---------------------------------------------------------------------------
 * The table shape, and the states an index page has besides the populated one.
 * ------------------------------------------------------------------------ */

export const TABLE_RULES: Rule[] = [
  {
    label: "One container",
    detail:
      "A rounded, bordered box with no padding of its own, so the header band reaches the edge instead of floating inside an inset.",
  },
  {
    label: "The band stays shaded on hover",
    detail:
      "bg-muted/50 and hover:bg-muted/50 together. Without the second, the header lights up under the pointer and reads as a row you can click.",
  },
  {
    label: "Header labels are full strength",
    detail:
      "Semibold at foreground, not muted. A column name is the thing you scan by; dimming it makes the reader work to find the one they want.",
  },
  {
    label: "Rows are 40px, always",
    detail:
      "A fixed height on 16px cell padding. Rows that grow with their content turn a scan into a read, and the header stops lining up with the body.",
  },
  {
    label: "Numbers end-align, and so does their header",
    detail:
      "Digits compare by place value, which only works when the places are in a column.",
  },
  {
    label: "Never more than three controls on a row",
    detail:
      "A word, then an icon, then the overflow. Every glyph carries an aria-label, because the glyph is the only name it has.",
  },
]

export const LOADING_RULES: Rule[] = [
  {
    label: "The skeleton is the table",
    detail:
      "Same column count, same 40px rows, same header band. A skeleton that does not match reflows the page the moment the data lands.",
  },
  {
    label: "Follow the real shape, not the default one",
    detail:
      "If a column is conditional on role or tab, the skeleton for that view has it. Matching only the default tab is a decision, so make it deliberately.",
  },
  {
    label: "Skeletons for content, a spinner for an action",
    detail:
      "A page that is arriving has a shape to promise. A button that is working does not, so it gets a Spinner and keeps its label.",
  },
  {
    label: "Never a spinner over a whole page",
    detail:
      "It says something is happening and nothing about what. The skeleton says both, and the page stops moving when it resolves.",
  },
]

export const EMPTY_STATE_RULES: Rule[] = [
  {
    label: "One primitive",
    detail:
      "Empty, with EmptyMedia, EmptyTitle, EmptyDescription and EmptyContent. Not a bordered div with an h3 in it.",
  },
  {
    label: "Name the object, in sentence case",
    detail:
      "“No API keys yet”. Not “No Files Yet”, not “No tasks found.” — one capitalisation and one wording across every list in the product.",
  },
  {
    label: "One action, and it is the primary one",
    detail:
      'The thing that makes the first row. size="lg", because nothing is beside it.',
  },
  {
    label: "The description says what a row would be",
    detail:
      "One line. It is the only place a reader who has never seen the feature finds out what the list is for.",
  },
]

export const NO_RESULTS_RULES: Rule[] = [
  {
    label: "It is not the empty state",
    detail:
      "The collection has rows. Offering “Create your first agent” to someone whose filter is too narrow answers a question they did not ask.",
  },
  {
    label: "The action clears the filter",
    detail:
      "The reader's way out is the control they just used, and it is usually scrolled out of view by the time they read this.",
  },
  {
    label: "Say what was searched for",
    detail:
      "Name the object and quote the term, the way the state above does. It is how a reader spots the typo without scrolling back to the field.",
  },
  {
    label: "It sits inside the table's container",
    detail:
      "The header band stays. Removing it removes the columns, and with them the evidence that a filter is what is doing this.",
  },
]

export const ERROR_RULES: Rule[] = [
  {
    label: "Name what failed",
    detail:
      "“Could not load calls”. “Something went wrong” is what a page says when nobody decided which page it was.",
  },
  {
    label: "Offer the retry",
    detail:
      "Most failures are one request that timed out. A page with no retry sends the reader to the browser's reload button and loses their filters.",
  },
  {
    label: "Never show the raw error",
    detail:
      "A stack trace names nothing the reader can act on. If a support code is needed, it goes under the message as a code, not as the message.",
  },
  {
    label: "A destructive action reports failure where it was pressed",
    detail:
      "In the dialog, not as a toast after it closes — the reader is still deciding, and the surface they decided on is the one that has to say it did not happen.",
  },
]

export const PAGINATION_RULES: Rule[] = [
  {
    label: "Cursor, not page numbers",
    detail:
      "Previous and Next. A jump-to-page control over a list that is being written to is a promise the data cannot keep.",
  },
  {
    label: "The page size sits beside the controls",
    detail:
      "10 / 25 / 50 / 100, remembered across visits. A reader who wants 100 rows wants them on every list, not on this one.",
  },
  {
    label: "Under the table, inside its width",
    detail:
      "One row, page size at the start, cursor controls at the end. Never above the table, and never in the page header.",
  },
  {
    label: "A list either has both or neither",
    detail:
      "Controls at a fixed size with no way to change it is the half-built version, and it is the one that gets shipped.",
  },
]
