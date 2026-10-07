/**
 * What changed in the design system, newest first. `/changelog` renders it.
 *
 * Add an entry whenever a rule, token, topic, component or lint rule changes —
 * in the same commit as the change, so the log never trails the system. Put
 * new entries at the top.
 *
 * An entry is one change a reader would describe in one breath. Its title
 * says what is different now, not what was done ("Select opens below its
 * trigger", not "Fix select"). Each line under it is one fact, and `topics`
 * are design-system topic ids, which the page turns into links.
 */

export type ChangeKind = "added" | "changed" | "fixed" | "removed"

export type ChangelogEntry = {
  /** ISO date, `YYYY-MM-DD`. */
  date: string
  title: string
  /** One sentence on why, when the title does not already carry it. */
  summary?: string
  changes: { kind: ChangeKind; text: string }[]
  /** Topic ids from `DOCS_SECTIONS`, linked under the entry. */
  topics?: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
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
]
