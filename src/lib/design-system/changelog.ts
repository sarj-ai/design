// Newest first: add entries at the top, in the same commit as the change.

export type ChangeKind = "added" | "changed" | "fixed" | "removed";

export type ChangelogEntry = {
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  title: string;
  summary?: string;
  changes: { kind: ChangeKind; text: string }[];
  /** Topic ids from `DOCS_SECTIONS`, linked under the entry. */
  topics?: string[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-11-05",
    title: "Buttons are flat shadcn buttons again",
    changes: [
      {
        kind: "removed",
        text: "The lit button surface — gradient fill, inner edge, ring and drop — is gone. Every variant renders as the stock primitive.",
      },
      {
        kind: "changed",
        text: "The Buttons topic is back to its sizes and roles tables in place of the specimen sheet.",
      },
    ],
    topics: ["buttons"],
  },
  {
    date: "2026-11-04",
    title: "A tab can carry a marker after its name",
    changes: [
      {
        kind: "changed",
        text: "PrimaryTabs and SecondaryTabs take any node as a tab's label, so a tab can show a dot for what is new since your last visit. The scenario's Optimization opportunities tab is the first to use it.",
      },
    ],
    topics: ["tabs"],
  },
  {
    date: "2026-11-02",
    title: "The buttons page shows every button and nothing else",
    changes: [
      {
        kind: "changed",
        text: "Buttons is one specimen sheet inside the lab's browser-window frame: a hairline cell per button, a role per column, a size per row, and the four icon-only sizes in the last row, each captioned role · size.",
      },
      {
        kind: "removed",
        text: "The sizes and roles tables, with their when-to-use and why notes, are off the page. The same guidance still ships in the design-system file.",
      },
      {
        kind: "removed",
        text: "The page's section label and lead line: the header is the title alone.",
      },
    ],
    topics: ["buttons"],
  },
  {
    date: "2026-11-02",
    title: "Buttons are lit surfaces instead of flat fills",
    changes: [
      {
        kind: "changed",
        text: "The default Button fills from primary at the top to a darker primary at the bottom, under a white sheen across its top half.",
      },
      {
        kind: "changed",
        text: "Its edge is a gradient, lighter at the top and darker at the bottom, inside a 1px darker-primary ring, with a soft shade along the inner bottom and a short drop below.",
      },
      {
        kind: "changed",
        text: "Hover lightens the fill 6% instead of fading it to 80%; press scales it to 99%.",
      },
      {
        kind: "changed",
        text: "Outline, secondary and destructive take the same surface in their own colours: white, grey, and destructive's soft red tint, each with a faint ring and a short drop. Hover sinks them 4% toward foreground.",
      },
      {
        kind: "changed",
        text: "Ghost stays flat at rest and takes the secondary surface on hover or while its menu is open.",
      },
      {
        kind: "added",
        text: "Every colour is mixed from the variant's own tokens, in globals.css rather than the generated primitive, so a rebrand carries through and shadcn can still regenerate ui/button.tsx.",
      },
    ],
  },
  {
    date: "2026-11-01",
    title: "The overview is a tour of the system, and copies it as one file",
    changes: [
      {
        kind: "changed",
        text: "The overview is one long page: each section gets a screen of its own, over a graph of every topic that moves to the section being read.",
      },
      {
        kind: "changed",
        text: "Section addresses open the overview at that section, and closing a topic returns there.",
      },
      {
        kind: "added",
        text: "Copy design system, in the overview's nav: the whole system as one markdown file for an agent to load — rules, colour, layers, motion, patterns, surfaces, components and the lint rules.",
      },
      {
        kind: "added",
        text: "The file is generated from the same data the pages render, so it changes when a rule does.",
      },
      {
        kind: "added",
        text: "The same file is a public registry item, design-system, that installs as a Claude skill — the docs site is private, the registry is not.",
      },
      {
        kind: "added",
        text: "Every Components topic is its own registry item, ds-<topic>, and the file links each component to it rather than to a page nobody outside can open.",
      },
    ],
  },
  {
    date: "2026-11-01",
    title: "A voice agent shows whether it is listening, thinking or speaking",
    summary:
      "An exploration: three ways to draw the same three states, to pick one from.",
    changes: [
      {
        kind: "added",
        text: "Agent states topic under Components: every state side by side, and a switcher to watch one state blend into the next.",
      },
      {
        kind: "added",
        text: "Three visuals in components/shared/agent-state: a dot matrix on a 2D canvas, and waves and a three-strand string as WebGL shaders, all in the orb's violets.",
      },
      {
        kind: "added",
        text: "Listening and speaking follow a voice level, the caller's and the agent's; thinking hears nothing and runs on its own.",
      },
    ],
    topics: ["agent-states"],
  },
  {
    date: "2026-10-28",
    title: "A failure takes the smallest piece of the screen it can",
    summary:
      "The Error topic named what to say but not where an error goes, so one failed request could blank a page that had mostly loaded.",
    changes: [
      {
        kind: "added",
        text: "Six scopes, each with a demo: field, action (a toast), section, list, page area and app. The sidebar and top bar stay for every one but app.",
      },
      {
        kind: "added",
        text: "ErrorState in components/design-system: what failed, that trying again is safe, and Try again. It draws no box; the card, table or page it replaces already has one.",
      },
      {
        kind: "added",
        text: "Rules: show what did load, keep what the reader did through the retry, and report every failure to Sentry, not only a page that broke.",
      },
      {
        kind: "changed",
        text: "Try again re-runs only what failed, keeps its label and shows a spinner while it runs.",
      },
    ],
    topics: ["error-state"],
  },
  {
    date: "2026-10-22",
    title: "A scenario's Live switch is one shared control",
    summary:
      "Live status (DES-203) and versioning (DES-202) are one TDD and drew Live two ways; they now import the same switch.",
    changes: [
      {
        kind: "added",
        text: "LiveSwitch in shared/: a Live label and a switch in an outline control the height of the header's buttons. One click, nothing asked.",
      },
      {
        kind: "changed",
        text: "Who last turned it on or off is its tooltip; what live means for saves is the toast after a toggle.",
      },
      {
        kind: "removed",
        text: "DES-203's popover behind a status button, and its status strip take.",
      },
    ],
  },
  {
    date: "2026-10-22",
    title: "The save bar is a shared component",
    changes: [
      {
        kind: "added",
        text: "SaveBar in shared/: the floating pill from Unsaved changes, so a mockup uses the same bar the topic shows.",
      },
    ],
    topics: ["unsaved-changes"],
  },
  {
    date: "2026-10-19",
    title: "Integration cards show what each connection does",
    summary:
      "The product's card only says whether a service is connected; a reader wants which events start calls, where call results go, and whether it is still working.",
    changes: [
      {
        kind: "added",
        text: "A flow concept: each automation drawn as a line between the service and Sarj, pointing in when an event starts a call and out when a result goes back.",
      },
      {
        kind: "added",
        text: "An activity concept: a week of events as bars, when the last one arrived, how many automations run on it, and the one thing about to break.",
      },
      {
        kind: "added",
        text: "A layout concept: each connected service gets a wide panel listing its automations, and services that are not connected shrink to a shelf of chips.",
      },
    ],
    topics: ["integration-card"],
  },
  {
    date: "2026-10-13",
    title: "Secondary tabs can carry a control at the end of their row",
    summary:
      "Version history's Split and Unified tabs needed their comparison picker on the same line, not stacked above it.",
    changes: [
      {
        kind: "added",
        text: "SecondaryTabs takes an aside: a control that scopes every tab, such as what a diff is compared with, at the end of the tab row.",
      },
      {
        kind: "changed",
        text: "Secondary tabs sit closer to their rule: the 8px gap between the labels and the line is gone, so the bar reads as part of the tab it marks.",
      },
    ],
    topics: ["tabs"],
  },
  {
    date: "2026-10-13",
    title: "Notifications have a home: a bell in the top bar",
    summary:
      "Publish approval (DES-204) is the first thing the product notifies about, and the PRD asks for it inside the platform as well as by email.",
    changes: [
      {
        kind: "added",
        text: "Components › Notifications: the bell sits first in the top bar's right-hand row and opens a list of notices. Each notice is what happened, then where and when, and leads to the thing it is about.",
      },
      {
        kind: "added",
        text: "Notifications, a shared component in shared/notifications.tsx. Mark all read shows only while something is unread, and the foot leads to the page that holds everything.",
      },
      {
        kind: "changed",
        text: "Unread is a dot on the bell, not a numbered pill. The count stays in the button's label and the list.",
      },
    ],
    topics: ["notifications"],
  },
  {
    date: "2026-10-11",
    title: "Any card's action sits in its footer band",
    summary:
      "The rule named only Save, so a card's other actions ended up loose at the bottom of its body.",
    changes: [
      {
        kind: "changed",
        text: "Form actions: a card's own action — Save, or one like Clone a voice — goes in its CardFooter, end-aligned.",
      },
      {
        kind: "fixed",
        text: "Voice cloning's persona voice card: Clone a voice moved from the body into the footer.",
      },
    ],
    topics: ["forms"],
  },
  {
    date: "2026-10-11",
    title:
      "Multi-step creation is removed; creating in steps is the creation flow",
    summary:
      "Two components did one job, and the card one read as a pop-up with steps — a shape the surfaces page rules out.",
    changes: [
      {
        kind: "removed",
        text: "The Patterns › Multi-step creation topic, MultiStepCreateDialog and MultiStepForm. Nothing in the lab used them.",
      },
      {
        kind: "changed",
        text: "Its rules — step indicator, Back, working state, failure on the screen that broke, ask before leaving — now sit under the Creation flow demo as its anatomy.",
      },
    ],
    topics: ["creation-flow"],
  },
  {
    date: "2026-10-11",
    title: "The creation flow is one shared component",
    summary:
      "Its chrome lived inside the scenario demo, so a flow built on it had to copy the layout and drifted into the multi-step card instead.",
    changes: [
      {
        kind: "added",
        text: "CreationFlow in components/design-system: full screen, Back and Close at the top, title and one question a screen, step dots at the foot.",
      },
      {
        kind: "changed",
        text: "The scenario demo on this topic renders through it, as does voice cloning, so a change here reaches both.",
      },
    ],
    topics: ["creation-flow"],
  },
  {
    date: "2026-10-11",
    title: "A field's error sits on its label's line",
    summary:
      "On a line of its own it pushed the box down, so a field in trouble fell out of line with its neighbours.",
    changes: [
      {
        kind: "changed",
        text: "The error moves from its own line between label and control to the end of the label's line.",
      },
      {
        kind: "added",
        text: "FieldHeader in components/design-system: label, optional (i) hint, and the error, on one line.",
      },
    ],
    topics: ["forms"],
  },
  {
    date: "2026-10-11",
    title: "A live microphone shows level bars that follow the voice",
    summary:
      "A pulsing dot said only that something was happening; the bars say whether the microphone is hearing you.",
    changes: [
      {
        kind: "added",
        text: "RecordingIndicator in components/shared: five bars in the recording red, inside a tinted disc, tallest in the middle and mirrored, so a voice grows the mark from its centre.",
      },
      {
        kind: "added",
        text: "useMicrophoneLevels reads those bands from the real microphone; the countdown waits until the microphone is live, and a refused one falls back to upload.",
      },
      {
        kind: "added",
        text: "Silence keeps a sliver of every bar, so a quiet room never reads as recording having stopped.",
      },
      {
        kind: "added",
        text: "Reduced motion holds the bars in one still shape.",
      },
    ],
    topics: ["recording"],
  },
  {
    date: "2026-10-10",
    title: "A card's Save sits inside the card",
    summary:
      "A Save under a card reads as the page's, not the card's; the platform keeps every action in its box.",
    changes: [
      {
        kind: "changed",
        text: "Form actions: when a form is a card, its Cancel and Save go in the card's own CardFooter, end-aligned.",
      },
      {
        kind: "fixed",
        text: "The language-switching mockup's Save moved from under the persona card into its footer.",
      },
    ],
    topics: ["forms"],
  },
  {
    date: "2026-10-10",
    title: "A filter chip's short list opens as the standard dropdown",
    summary:
      "Its list used a command list's padding, so it looked unlike every other dropdown in the product.",
    changes: [
      {
        kind: "changed",
        text: "Under eight options, a select filter's list is the dropdown menu primitive: same rows, padding and tick as Select.",
      },
      {
        kind: "changed",
        text: "Eight options or more keep the command list, because they need the search box.",
      },
    ],
  },
  {
    date: "2026-10-07",
    title: "Lint enforces the system's own decisions",
    summary:
      "Seventeen new rules, so the decided patterns fail npm run lint instead of waiting for review.",
    changes: [
      {
        kind: "added",
        text: "Rules for surface widths, one overlay at a time, the dialog shape and Cancel-then-verb footers.",
      },
      {
        kind: "added",
        text: "Rules for header icons, red buttons, Select position, form labels, the table shape, empty states and the pagination block.",
      },
      {
        kind: "added",
        text: "Rules for nested cards, banned copy, sentence case, scrollbar styling and type weights.",
      },
      {
        kind: "added",
        text: "A LEGACY exemption list in eslint.config.mjs for screens built before a rule existed.",
      },
    ],
    topics: ["enforcement"],
  },
  {
    date: "2026-10-01",
    title: "Index pages filter by direction, duration and schedule",
    changes: [
      {
        kind: "added",
        text: "Direction, Duration (presets plus min and max) and Scheduled only filters, behind + Filter.",
      },
      {
        kind: "changed",
        text: "Single and multi selects open the same 256px list. Lists of 8 or more search, and ticked rows float to the top.",
      },
      {
        kind: "changed",
        text: "A multi-select chip reads its values (“Completed, Failed”, “Queued +2”) instead of a count.",
      },
      {
        kind: "fixed",
        text: "A multi-select menu no longer closes after the first tick.",
      },
    ],
    topics: ["index-page"],
  },
  {
    date: "2026-09-30",
    title: "Where a task goes is decided, not chosen per screen",
    summary:
      "Researched against six products and seven design systems, and dry-run against all 115 overlays in the platform.",
    changes: [
      {
        kind: "added",
        text: "One table for configuring, creating, picking, reading a record and confirming, each with its surface.",
      },
      {
        kind: "added",
        text: "Fixed widths: confirm 384, dialog 448, drawer 448, record 1024, page full.",
      },
      {
        kind: "added",
        text: "Creation flow and alert topics.",
      },
    ],
    topics: ["surfaces", "creation-flow", "alert"],
  },
  {
    date: "2026-09-28",
    title: "Developers page, drawer anatomy, integration card and save bar",
    changes: [
      {
        kind: "added",
        text: "The Developers page: API keys, webhooks and variables in tabs.",
      },
      {
        kind: "added",
        text: "Drawer anatomy: a title, a description and Close, no icon tile.",
      },
      {
        kind: "added",
        text: "The integration card and the unsaved-changes save bar.",
      },
    ],
    topics: [
      "developers",
      "drawer-anatomy",
      "integration-card",
      "unsaved-changes",
    ],
  },
  {
    date: "2026-09-28",
    title: "Orb avatar for people without a photo",
    changes: [
      {
        kind: "added",
        text: "A shader-drawn orb in place of initials, with its own colour tones.",
      },
    ],
    topics: ["orb-avatar"],
  },
  {
    date: "2026-09-28",
    title: "Select opens below its trigger",
    changes: [
      {
        kind: "fixed",
        text: 'Every SelectContent uses position="popper", so it opens under its trigger like every popover.',
      },
    ],
    topics: ["forms"],
  },
  {
    date: "2026-09-20",
    title: "No scrollbars anywhere",
    changes: [
      {
        kind: "removed",
        text: "The page's, every panel's and ScrollArea's scrollbar. Everything still scrolls.",
      },
    ],
    topics: ["scrollbars"],
  },
  {
    date: "2026-09-08",
    title: "Every topic has its own address",
    summary: "So a single topic can be sent to someone.",
    changes: [
      {
        kind: "changed",
        text: "The design system moved from client-side tabs to one URL per topic.",
      },
      {
        kind: "added",
        text: "Control scale, layering, lint enforcement, table anatomy, pagination and the four index-page states.",
      },
    ],
    topics: [
      "control-scale",
      "layering",
      "enforcement",
      "tables",
      "pagination",
    ],
  },
];
