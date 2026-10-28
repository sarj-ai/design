export type Rule = {
  label: string
  detail: string
}

/** The `id` picks the worked example `RuleDemo` renders under it. */
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

export type SurfaceId =
  | "inline"
  | "popover"
  | "undo"
  | "dialog"
  | "confirm"
  | "drawer"
  | "record"
  | "page"

type SurfaceChoice = {
  id: SurfaceId
  title: string
  sits: string
  size: string
  criterion: string
  avoid: string
  shape: string[]
  examples: string
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
      "anything Undo could cover, any field beyond the name typed to confirm, and reviewing changes before a save — that is the Unsaved changes review drawer.",
    shape: [
      "384px; Esc and Cancel close it, an outside click does not",
      "The title names the thing; the body says what goes, what stops, what stays",
      "Cancel, then the verb — red only when it destroys",
      "Typing the name only when it is final and something live goes with it",
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
      "Configuring a group of settings while the page stays in view — and creating a list item that is edited in this same drawer later, so create and edit are one form.",
    avoid:
      "a quick decision, a whole object's configuration, and making a main object — that is the creation flow.",
    shape: [
      "448px from the right, full height",
      "Title and Close; only the body scrolls; Cancel and Save stay at the foot",
      "Save is off until something changes; every exit asks before it drops them",
      "Needs a new thing midway? One level deeper inside, with Back",
      "Add and Edit are the same drawer; only the title and the button change",
    ],
    examples:
      "Configure a tool, batch settings, add a webhook, register a number.",
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
      "Configuring a whole object, or making one — a scenario, a persona, a batch — in the creation flow, which lands on its page.",
    avoid:
      "a handful of settings or a list item, which is a drawer, and any quick decision.",
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

type SurfaceRule = {
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
      "In a drawer or a page, once something has changed, Esc, Close, Cancel and an outside click all ask the same thing: discard changes? Keep editing, or Discard. A dialog is short enough to type again, so it does not ask.",
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
    label: "Ask only when it cannot be undone, or something live goes down",
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
    label: "Type the name only when it is final and live",
    detail:
      "When it cannot be undone and something live goes with it: deleting an organisation, releasing a number, deleting a persona on a live number. Anything Activate or Link brings back does not ask for typing.",
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

export const DEMO_VOICES = [
  { id: "layla-gulf", label: "Layla — Gulf Arabic" },
  { id: "omar-msa", label: "Omar — Modern Standard" },
  { id: "sara-egyptian", label: "Sara — Egyptian" },
]

type CallRow = {
  id: string
  customer: string
  status: "completed" | "failed" | "in_progress" | "scheduled"
  cause: null | string
  direction: "inbound" | "outbound"
  scenario: string
  /** ISO 639-1 codes. */
  languages: string[]
  /** Seconds. */
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

type ChipNote = {
  label: string
  tone: string
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

type EmptyValueNote = {
  sample: string
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

// Must match `LANGUAGES` in precedent-iso/src/models/config.ts.
export const LANGUAGES = [
  { code: "EN", name: "English" },
  { code: "AR", name: "Arabic" },
  { code: "UR", name: "Urdu" },
]

export const LANGUAGE_NAMES: Record<string, string> = Object.fromEntries(
  LANGUAGES.map((language) => [language.code, language.name]),
)

type ButtonSizeNote = {
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
      "On the label's line, at its end, saying what to do rather than what went wrong — a few words, so it fits. It takes no height, so the box never moves: a row of fields stays in line when one goes wrong, and the form does not jump when it is submitted. Nothing sits below a control — the box is the last thing in every field. `FieldHeader` draws the line. The control's border carries the state and the label does not turn — the field's name is not the thing that is wrong, and a column of labels that changes colour is the one stable thing you were scanning to find the error. A failed submit goes to a toast.",
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
      "An end-aligned footer: Cancel as outline, then the primary. When the form is a card, the footer is the card's own CardFooter, inside the box — never a loose button under it, which reads as belonging to the page rather than to that card. The same goes for any card's own action, not only Save: Clone a voice under a voice picker sits in that card's footer band, end-aligned, never loose at the bottom of the body. A long editor swaps the footer for a bar that appears only once something is dirty.",
  },
  {
    label: "Disabled and read-only",
    detail:
      "A value that cannot be edited stays on screen, disabled, with one line saying why. Never swapped for plain text, never removed. The line is dropped when the control that turns editing on is on the same screen — a panel of dead switches under the switch that killed them needs no caption, and one that appears in only one state is a section the reader re-reads every visit.",
  },
]

type ButtonRoleNote = {
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

export type PatternAnatomy = {
  id: string
  title: string
  description: string
  required: Rule[]
  optional: Rule[]
}

export const PATTERNS: PatternAnatomy[] = [
  {
    id: "creation-flow",
    title: "Creation flow",
    description:
      "Making something new on its own screen: one question a screen, ending on a name.",
    required: [
      {
        label: "Step dots",
        detail:
          "Where you are and how many screens there are. Not clickable: Back is the way back.",
      },
      {
        label: "One question a screen",
        detail:
          "A screen that asks nothing is a screen to delete. A wait has no Back.",
      },
      {
        label: "Back",
        detail:
          "Every screen after the first is leavable without losing what is in it.",
      },
      {
        label: "Ends on what is made",
        detail:
          "The last screen shows what is about to be created — its name, its preview — before Create.",
      },
      {
        label: "Working state",
        detail: "The primary disables and says what is happening.",
      },
      {
        label: "Failure state",
        detail:
          "On the screen that broke, with the way to retry it — never a bare toast.",
      },
      {
        label: "Leaving asks",
        detail:
          "Past the first screen, Close and Esc ask to discard; nothing is created yet.",
      },
    ],
    optional: [],
  },
]

export type DocsPage = {
  id: string
  title: string
  description: string
  sarj?: boolean
}

export type DocsGroup = {
  label?: string
  pages: DocsPage[]
}

export type DocsSection = DocsPage & { groups: DocsGroup[] }

const PRODUCT_COMPONENTS: DocsPage[] = [
  {
    id: "colour",
    title: "Colour",
    description:
      "The 44 tokens a screen is built from, and what each one is for.",
    sarj: true,
  },
  // Topic ids must be unique across every section; `index-page` is taken.
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
    id: "notifications",
    title: "Notifications",
    description:
      "A bell in the top bar with a dot for unread, opening a list where each notice leads to the thing it is about.",
    sarj: true,
  },
  {
    id: "orb-avatar",
    title: "Avatar",
    description:
      "A shader orb for anyone without a photo. The name moves the light, so the same name always gets the same orb.",
    sarj: true,
  },
  {
    id: "recording",
    title: "Recording",
    description:
      "The mark for a live microphone: bars that grow from the centre with the voice and fall flat when it stops.",
    sarj: true,
  },
]

const SARJ_FOUNDATIONS = new Set([
  "icons",
  "shadows",
  "typography",
  "scrollbars",
])

const FOUNDATION_PAGES: DocsPage[] = [
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
  {
    id: "control-scale",
    title: "Control scale",
    description:
      "Four heights, shared by every control. A button is pinned to the field it sits next to, which is what makes a filter bar line up instead of stepping.",
    sarj: true,
  },
  {
    id: "enforcement",
    title: "Enforcement",
    description:
      "Twenty-seven rules npm run lint fails you for. Everything else on this site is a decision; these are errors.",
    sarj: true,
  },
]

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
    groups: [{ pages: PATTERN_PAGES }, { label: "States", pages: STATE_PAGES }],
  },

  // Not `components`: that was the shadcn inventory's address, and old links may still point at it.
  {
    id: "product-components",
    title: "Components",
    description: "The components the product is built from.",
    sarj: true,
    groups: [{ pages: PRODUCT_COMPONENTS }],
  },
]

type LayerToken = {
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

type ControlStep = {
  px: number
  button: string
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

type LintRule = {
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
    bans: "Raw button, input, select, table, label, kbd; a div with radius and edge and padding",
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
    bans: "A transition-* or animate-* on its own; a Skeleton without its escape",
    instead:
      "Pair it with motion-reduce:transition-none or motion-reduce:animate-none. No exception for opacity, or for a Skeleton's pulse.",
  },
  {
    id: "no-layout-animation",
    bans: "transition-all, transition-[width], transition-[height]",
    instead:
      "Transform and opacity. They are the only two the browser hands to the compositor.",
  },
  {
    id: "type-scale",
    bans: "font-bold, font-black, font-light, font-thin; font-serif, font-[…], fontFamily",
    instead:
      "Three weights — semibold, medium, normal — and two faces: Nunito, and font-mono for code.",
  },
  {
    id: "no-scrollbar-style",
    bans: "scrollbar-*, a ::-webkit-scrollbar variant, scrollbarWidth in style",
    instead:
      "Nothing. globals.css hides every bar, and everything still scrolls.",
  },
  {
    id: "icon-button-label",
    bans: 'A Button size="icon*" with no aria-label and no text',
    instead:
      "aria-label naming what it does. A tooltip is a description, not a name.",
  },
  {
    id: "surface-width",
    bans: "max-w-* without sm:, a width that is not one of the four, a drawer width without !",
    instead:
      "Confirm sm:max-w-sm, dialog sm:max-w-md, drawer sm:max-w-md!, record sm:max-w-5xl!.",
  },
  {
    id: "one-overlay",
    bans: "A Dialog, Sheet or Drawer inside another overlay's content",
    instead:
      "Go one level deeper inside the drawer, with Back. Only a confirm or a popover stacks.",
  },
  {
    id: "dialog-shape",
    bans: "Tabs, Stepper, ScrollArea or overflow-y-auto inside a dialog",
    instead: "A drawer for what scrolls or grows; a page for tabs and steps.",
  },
  {
    id: "footer-actions",
    bans: "Done, OK, Yes, Submit, Got it; Cancel after the verb or not outline; two filled buttons; a ButtonGroup in a footer",
    instead: "Cancel (outline), then one verb that names the result.",
  },
  {
    id: "no-header-icon",
    bans: "An icon, ItemMedia or AlertDialogMedia in a dialog, drawer or confirm header",
    instead: "Title, description, Close. The words are the warning.",
  },
  {
    id: "destructive-variant",
    bans: 'variant="destructive" on an action that destroys nothing, or in a table row',
    instead:
      "Red only for delete, remove, revoke, disconnect, discard. A row's delete is ghost with text-destructive.",
  },
  {
    id: "select-position",
    bans: 'A SelectContent without position="popper"',
    instead:
      'position="popper", so it opens under its trigger like every popover.',
  },
  {
    id: "form-labels",
    bans: "text-muted-foreground on a FieldLabel, Label or FieldLegend",
    instead:
      "Full-strength labels. The (optional) marker is the one muted span inside.",
  },
  {
    id: "table-shape",
    bans: "A muted TableHead, a header band without its hover, onClick on a TableHead",
    instead:
      "DataTable, DataTableHeaderRow and DataTableHead from shared/data-table.",
  },
  {
    id: "empty-state",
    bans: "An Empty with no EmptyTitle; two actions in EmptyContent",
    instead: "A title that is the state, and the one action that changes it.",
  },
  {
    id: "shared-blocks",
    bans: "ui/pagination",
    instead: "ListFooter — cursor and page size under the table.",
  },
  {
    id: "no-nested-card",
    bans: "A Card inside a Card",
    instead: "A bg-muted inset, Separator or ItemSeparator.",
  },
  {
    id: "copy-conventions",
    bans: "Are you sure; Something went wrong as the message; Unavailable, N/A; Required in a label; No … found",
    instead:
      "Name the thing; name what failed; —, Not set or Not analysed; mark the minority; No API keys yet.",
  },
  {
    id: "sentence-case",
    bans: "The uppercase class; Title Case in a title, label, tab, button or heading",
    instead: "Sentence case. Acronyms stay; proper nouns go in an expression.",
  },
]

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
