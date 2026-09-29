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

/**
 * The eight answers to "where does this go?".
 *
 * Researched in September 2026 against ElevenLabs Agents (about 45 overlays on
 * Mobbin), Vapi, Stripe, Linear, Vercel, Attio, HubSpot and Supabase, and the
 * written guidance of NN/g, Carbon, Atlassian, Polaris, Primer, Fluent and
 * Apple — then dry-run against every overlay in the Sarj platform
 * (`surface-audit.ts`). Carbon gave the only hard numbers (a modal for up to
 * four fields and never one that scrolls); ElevenLabs gave the rest by doing
 * it: small creates in a modal, growing ones in a drawer, records in a wide
 * sheet with arrows, the agent as a page, steps full screen.
 */
export type SurfaceId =
  | "inline"
  | "popover"
  | "undo"
  | "dialog"
  | "confirm"
  | "drawer"
  | "record"
  | "page"

export type SurfaceChoice = {
  id: SurfaceId
  title: string
  /** Where it sits relative to the page the reader was on. */
  sits: string
  /** How big it is: a width, or where it lives when it has none. */
  size: string
  /** What this surface is for. */
  criterion: string
  /** What it is never for. The exclusions are the half that gets argued. */
  avoid: string
  /** Its fixed shape — width, chrome, how it closes. Not a menu of options. */
  shape: string[]
  /** Where the Sarj platform should use it. */
  examples: string
  /** Products seen doing it, so a reader can go and look. */
  seenIn: string
}

export const SURFACE_CHOICES: SurfaceChoice[] = [
  {
    id: "inline",
    title: "Inline",
    sits: "In the page",
    size: "In place",
    criterion:
      "Changing one value on something the page is already about, where that value is shown.",
    avoid:
      "a group of settings that would push the page around, and any decision.",
    shape: [
      "The value turns into its control, in place",
      "Save and Cancel sit with the field, or the page's save bar takes them",
      "Saves on its own only for a switch or a single pick",
    ],
    examples:
      "A knowledge base's description, a variable's row, a number's direction.",
    seenIn: "Attio, Linear, Stripe, Vercel",
  },
  {
    id: "popover",
    title: "Popover",
    sits: "In the page",
    size: "Anchored",
    criterion:
      "Picking one or several things from a list, filtering, or a quick look at a value too long for its cell.",
    avoid:
      "a form with a Save, which is a dialog, and anything read for more than a moment.",
    shape: [
      "Anchored to the button that opened it",
      "A search once the list passes eight",
      "“Create …” at its foot when the list can be empty",
      "An outside click closes it; there is no footer",
    ],
    examples: "Attach knowledge bases, add a tool, every filter.",
    seenIn: "ElevenLabs (add tool), Vapi (filters), Attio",
  },
  {
    id: "undo",
    title: "Undo",
    sits: "No surface",
    size: "A toast",
    criterion:
      "An action that can be taken back: archive, stop and resume, set a default, remove from a list.",
    avoid:
      "deleting for good, and anything that takes something live down — that is a confirm.",
    shape: [
      "It happens on the click; nothing asks first",
      "A toast says what happened and offers Undo",
      "Undo puts it back exactly, in its place in the list",
    ],
    examples: "Archive a scenario, stop a batch, set the default persona.",
    seenIn: "Linear (Recently deleted), NN/g, Apple",
  },
  {
    id: "dialog",
    title: "Dialog",
    sits: "Over the page",
    size: "448px",
    criterion:
      "A short task on one screen: up to four fields, or an action that needs a few answers before it runs.",
    avoid:
      "anything that scrolls, grows rows, or has tabs or steps — that is a drawer or a page.",
    shape: [
      "448px, and never taller than its content",
      "Title and Close; the body does not scroll",
      "Cancel, then a verb that names the result",
      "A secret shown once appears in the same dialog, after the create",
    ],
    examples:
      "Create a knowledge base, create an API key, send a test call, rename from a list.",
    seenIn: "ElevenLabs (Add URL, Outbound call), Vapi, Stripe",
  },
  {
    id: "confirm",
    title: "Confirm",
    sits: "Over the page",
    size: "384px",
    criterion:
      "A decision about something that cannot be undone, or that takes something live down.",
    avoid:
      "anything Undo could cover, and any field beyond the name typed to confirm.",
    shape: [
      "384px; Esc and Cancel close it, an outside click does not",
      "The title names the thing; the body says what goes, what stops, what stays",
      "Cancel, then the verb — red only when it destroys",
      "Typing the name only when it takes something live down",
    ],
    examples:
      "Delete a persona, disconnect an integration, deactivate a number.",
    seenIn: "ElevenLabs, Linear, Vercel, Stripe",
  },
  {
    id: "drawer",
    title: "Drawer",
    sits: "Beside the page",
    size: "448px",
    criterion:
      "Configuring a group of settings, or creating something with more than four fields or rows that grow, while the page stays in view.",
    avoid: "a quick decision, a whole object's configuration, and steps.",
    shape: [
      "448px from the right, full height",
      "Title and Close; only the body scrolls; Cancel and Save stay at the foot",
      "Save is off until something changes; every exit asks before it drops them",
      "Needs a new thing midway? One level deeper inside, with Back",
    ],
    examples:
      "Configure a tool, batch settings, register a number, add a messaging configuration.",
    seenIn: "ElevenLabs (Add webhook, Import number), HubSpot, Supabase",
  },
  {
    id: "record",
    title: "Record",
    sits: "Beside the page",
    size: "1024px",
    criterion:
      "Reading one record opened from a list — a call, a conversation, a file — and moving to the next without going back.",
    avoid: "a record's settings, and anything not opened from a list.",
    shape: [
      "1024px from the right; the list stays visible at the edge",
      "↑ and ↓ step through the list; the open record is in the URL",
      "Actions in the header, and no footer",
    ],
    examples: "A call, a messaging session, a knowledge base file.",
    seenIn: "ElevenLabs (Conversations), Vapi (Calls), Linear",
  },
  {
    id: "page",
    title: "Page",
    sits: "Instead of the page",
    size: "Full screen",
    criterion:
      "Configuring a whole object, or creating one in steps where a later answer depends on an earlier one.",
    avoid: "a handful of settings, which is a drawer, and any quick decision.",
    shape: [
      "Creating in steps is the creation flow: one question a screen, full screen",
      "Back and Close at the top, the step dots at the foot, a name and Create at the end",
      "An object with sections is its own page, with tabs and a save bar",
      "Leaving part-way asks first",
    ],
    examples:
      "A scenario, a persona, creating a scenario, connecting a SIP trunk.",
    seenIn: "ElevenLabs (New agent), Stripe (focus view), Vapi, PlayAI",
  },
]

/** A rule every surface keeps, whichever one the decision picked. */
export type SurfaceRuleId =
  | "one-at-a-time"
  | "pinned"
  | "widths"
  | "guard"
  | "footer"
  | "undo-first"
  | "confirm-copy"
  | "red"
  | "typed"
  | "feedback"
  | "record-url"
  | "picker"

export type SurfaceRule = {
  id: SurfaceRuleId
  label: string
  detail: string
  seenIn: string
}

export const SURFACE_RULES: SurfaceRule[] = [
  {
    id: "one-at-a-time",
    label: "One overlay at a time",
    detail:
      "A confirm may sit on anything, and a popover may open inside anything. Nothing else stacks: a drawer that needs a new thing goes one level deeper inside itself, with Back, and returns with it selected.",
    seenIn: "Atlassian, Fluent, Polaris, Apple",
  },
  {
    id: "pinned",
    label: "Header and footer stay; the body scrolls",
    detail:
      "A footer that scrolls away hides the only way to finish. A dialog whose body needs to scroll was a drawer.",
    seenIn: "Carbon, Fluent, Primer",
  },
  {
    id: "widths",
    label: "Four widths and the screen",
    detail:
      "Confirm 384, dialog 448, drawer 448, record 1024, page full. Always sm:max-w-* — without the prefix the primitive's own sm:max-w-lg wins and every dialog is 512.",
    seenIn: "Primer, Carbon",
  },
  {
    id: "guard",
    label: "One guard on every way out",
    detail:
      "Once something has changed, Esc, Close, Cancel and an outside click all ask the same thing: discard changes? Keep editing, or Discard.",
    seenIn: "Primer, Fluent, Apple",
  },
  {
    id: "footer",
    label: "Cancel, then the verb",
    detail:
      "At the trailing edge. The verb names the result — Create persona, Save, Delete webhook — never Done, OK, Yes, Submit or Got it. Save is off until something changes; Create stays on and says what is missing.",
    seenIn: "NN/g, Carbon, Polaris, Apple",
  },
  {
    id: "undo-first",
    label: "Ask only when it cannot be undone",
    detail:
      "Everything else happens on the click, with Undo in the toast. A confirm on every action trains people to press through the one that matters.",
    seenIn: "NN/g, Apple",
  },
  {
    id: "confirm-copy",
    label: "Name it, then say what happens",
    detail:
      "“Delete Reservations?”, then what goes with it, what stops and what is kept. Never “Are you sure”, and no warning icon — the words are the warning.",
    seenIn: "Polaris, Linear, Stripe",
  },
  {
    id: "red",
    label: "Red is for destroying",
    detail:
      "Only on a confirm's button, and only when pressing it destroys something. Transfer, retry and create anyway are primary.",
    seenIn: "Carbon, Apple",
  },
  {
    id: "typed",
    label: "Type the name when something live goes down",
    detail:
      "An organisation, a number that takes calls, a persona on a live number. Nothing else asks for typing.",
    seenIn: "Linear, Vercel, NN/g",
  },
  {
    id: "feedback",
    label: "Failure stays, success leaves",
    detail:
      "A failure is a callout inside the surface, which stays open. Success closes it and says so in a toast; a create adds View.",
    seenIn: "ElevenLabs, Stripe",
  },
  {
    id: "record-url",
    label: "A record lives in the URL",
    detail:
      "Opened from a list, it can be shared and reloaded, and ↑ ↓ reach the next one without closing it.",
    seenIn: "Vapi, Linear, ElevenLabs",
  },
  {
    id: "picker",
    label: "Picking is a popover",
    detail:
      "Anchored to the button that asked. A dialog for one choice covers the page the choice is for.",
    seenIn: "ElevenLabs, Attio",
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
  {
    label: "Header",
    detail:
      "Title on the left. One line of description under it only when the title does not say enough — most pages have none. Page state, such as a quota or a sync status, sits on the right, level with the title. Never an action there.",
  },
  {
    label: "Actions",
    detail:
      "Buttons at the end of the search row: secondary ones first, outlined; the create action last and the only filled one. When a page has several ways of adding content (a knowledge base: files, a URL, text), those become a row of tiles under the title instead — an icon over a verb. PageHeader and ActionTile from shared/page-header.",
  },
  {
    label: "Views",
    detail:
      "Two lists of the same object — Active and Recently deleted — are the system's secondary tabs, directly under the title. They pick the list, so they come before the search and filters that narrow it. Not two pages, and not a filter.",
  },
  {
    label: "Controls",
    detail:
      'Search at the start of the row, the page\'s buttons at its end. Filters on the line under it, as chips from shared/filter-bar: an unset filter is "+ Field", a set one reads its value ("Language: English", or a count past one) with an × to clear it, and Clear all appears once two are set. Three or four chips at most; the rest sit behind + Filter. Dates are one range chip with presets, never an after and a before.',
  },
  { label: "Content", detail: "Table, list, grid or cards." },
  {
    label: "Row actions",
    detail: "Per row, overflow, destructive, and bulk once selection exists.",
  },
  {
    label: "Footer",
    detail:
      'Under the table: "1–10 of 12" at the start; the page size ("10 / page") and First, Previous and Next as a joined group of icons at the end. No labels. ListFooter from shared/list-footer.',
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
 * Read out of the real forms in `sarj-ai/platform` — persona, voice, batch calls, the
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
      "A small (i) after the label — the label's size, muted until pointed at — that opens the sentence on hover or focus. A drawer or dialog is read many times, so a line under every label turns the panel into prose. Only fields that need it get one, and a hard limit never hides there: it stays on screen as a reading beside the label (“~6s of 20s”).",
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

/** The Components section: ours, built for this product. */
export const PRODUCT_COMPONENTS: DocsPage[] = [
  {
    id: "colour",
    title: "Colour",
    description:
      "The 44 tokens a screen is built from, and what each one is for.",
    sarj: true,
  },
  /* `index` rather than `index-page`: that id is the pattern's, and a topic
     id has to be unique across every section. */
  {
    id: "index",
    title: "Index page",
    description:
      "A collection of one kind of object, and the four states it can be in instead of full.",
    sarj: true,
  },
  {
    id: "surfaces",
    title: "Choosing a surface",
    description:
      "Where a task goes — in the page, over it, beside it, or instead of it — decided by what the reader is doing and how much there is. Dry-run against every overlay in the platform.",
    sarj: true,
  },
  {
    id: "drawer-anatomy",
    title: "Drawer",
    description:
      "A panel from the side for configuring or reading one thing while the page behind stays in reach.",
    sarj: true,
  },
  {
    id: "integration-card",
    title: "Integration card",
    description:
      "A service the organisation can connect: who it is, whether it is connected, and the one thing to do next.",
    sarj: true,
  },
  {
    id: "section-card",
    title: "Section card",
    description:
      "One block of a settings page: its title, what it is for, the one control it needs, and what it holds.",
    sarj: true,
  },
  {
    id: "creation-flow",
    title: "Creation flow",
    description:
      "Making something new on its own screen: pick how to start, answer one question a screen, and finish on a name.",
    sarj: true,
  },
  {
    id: "json-view",
    title: "JSON",
    description:
      "A value read rather than dumped: folds, Copy, and two values compared key by key with only the differences tinted.",
    sarj: true,
  },
  {
    id: "alert",
    title: "Alert",
    description:
      "Four intents, one recipe each, and every shape the platform needs — plus the alerts that should be something else.",
    sarj: true,
  },
  {
    id: "unsaved-changes",
    title: "Unsaved changes",
    description:
      "The bar that appears once a page has edits: what changed, Discard, and a review before anything goes live.",
    sarj: true,
  },
  {
    id: "developers",
    title: "Developers",
    description:
      "Everything for building on Sarj on one page: a quickstart that places a call through the public API, then keys, webhooks and variables.",
    sarj: true,
  },
  {
    id: "admin-view",
    title: "Admin view",
    description:
      "The organisation a superadmin is reading a page as, and the control that switches it.",
    sarj: true,
  },
  {
    id: "orb-avatar",
    title: "Avatar",
    description:
      "A shader orb for anyone without a photo. The name moves the light, so the same name always gets the same orb.",
    sarj: true,
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

  /* `product-components` rather than `components`: `components` was the
     shadcn inventory's address, and links to it may still be out there. */
  {
    id: "product-components",
    title: "Components",
    description: "The components the product is built from.",
    sarj: true,
    groups: [{ pages: PRODUCT_COMPONENTS }],
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
      "First, Previous and Next. A jump-to-page control over a list that is being written to is a promise the data cannot keep; First only returns to the start.",
  },
  {
    label: "The page size sits beside the controls",
    detail:
      "10 / 25 / 50 / 100, remembered across visits. A reader who wants 100 rows wants them on every list, not on this one.",
  },
  {
    label: "Under the table, inside its width",
    detail:
      'One row: where you are ("1–10 of 12") at the start, the page size and the cursor at the end. Never above the table, and never in the page header.',
  },
  {
    label: "A list either has both or neither",
    detail:
      "Controls at a fixed size with no way to change it is the half-built version, and it is the one that gets shipped.",
  },
]
