/**
 * Every colour in `globals.css`, in the order the file declares them.
 *
 * The values are copied from that file rather than read at runtime, so this
 * table has to be updated with it — the alternative reads the computed style
 * of a probe element, which renders empty on the server and lands a hydration
 * mismatch on the one page whose job is to be exact.
 *
 * `swatch` is a literal class rather than `bg-${name}`: Tailwind only emits a
 * utility it can see spelled out in a source file.
 */

export type ColourToken = {
  /** The name without its `--` prefix. */
  name: string
  /** Exactly what `globals.css` sets it to. */
  value: string
  /** A literal `bg-*` class, so Tailwind emits it. */
  swatch: string
  use: string
}

export type ColourGroup = {
  title: string
  note: string
  tokens: ColourToken[]
}

export const COLOUR_GROUPS: ColourGroup[] = [
  {
    title: "Surfaces",
    note: "Every one is paired with its own foreground. Never mix a surface with another surface's text colour.",
    tokens: [
      {
        name: "background",
        value: "oklch(1 0 0)",
        swatch: "bg-background",
        use: "The page itself.",
      },
      {
        name: "foreground",
        value: "oklch(0.145 0 0)",
        swatch: "bg-foreground",
        use: "Default text on the page.",
      },
      {
        name: "card",
        value: "oklch(1 0 0)",
        swatch: "bg-card",
        use: "Card, and anything that reads as a raised panel.",
      },
      {
        name: "card-foreground",
        value: "oklch(0.145 0 0)",
        swatch: "bg-card-foreground",
        use: "Text on a card.",
      },
      {
        name: "popover",
        value: "oklch(1 0 0)",
        swatch: "bg-popover",
        use: "Popover, dropdown, dialog, tooltip.",
      },
      {
        name: "popover-foreground",
        value: "oklch(0.145 0 0)",
        swatch: "bg-popover-foreground",
        use: "Text on those.",
      },
      {
        name: "muted",
        value: "oklch(0.97 0 0)",
        swatch: "bg-muted",
        use: "Inset panels, table header rows, disabled fills.",
      },
      {
        name: "muted-foreground",
        value: "oklch(0.556 0 0)",
        swatch: "bg-muted-foreground",
        use: "Descriptions, labels, anything secondary.",
      },
      {
        name: "secondary",
        value: "oklch(0.97 0 0)",
        swatch: "bg-secondary",
        use: "Secondary button and badge fill.",
      },
      {
        name: "secondary-foreground",
        value: "oklch(0.205 0 0)",
        swatch: "bg-secondary-foreground",
        use: "Text on secondary.",
      },
      {
        name: "accent",
        value: "oklch(0.97 0 0)",
        swatch: "bg-accent",
        use: "Hover and keyboard-focus fill on rows and menu items.",
      },
      {
        name: "accent-foreground",
        value: "oklch(0.205 0 0)",
        swatch: "bg-accent-foreground",
        use: "Text on accent.",
      },
    ],
  },
  {
    title: "Brand",
    note: "Sarj purple. --primary is the whitelabel hook: change it and the ramp follows.",
    tokens: [
      {
        name: "primary",
        value: "oklch(0.334 0.107 291.8)",
        swatch: "bg-primary",
        use: "The one primary action, selected states, brand marks.",
      },
      {
        name: "primary-foreground",
        value: "oklch(1 0 0)",
        swatch: "bg-primary-foreground",
        use: "Text on primary.",
      },
      {
        name: "primary-tint",
        value: "oklch(0.948 0.019 291.8)",
        swatch: "bg-primary-tint",
        use: "Selected rows and icon containers.",
      },
      {
        name: "primary-tint-foreground",
        value: "oklch(0.411 0.108 291.8)",
        swatch: "bg-primary-tint-foreground",
        use: "Text and icons on the tint.",
      },
      {
        name: "primary-highlight",
        value: "color-mix(in oklch, #392868 85%, white)",
        swatch: "bg-primary-highlight",
        use: "Brand mixed 85% with white.",
      },
      {
        name: "primary-light",
        value: "color-mix(in oklch, #392868 70%, white)",
        swatch: "bg-primary-light",
        use: "Brand mixed 70% with white.",
      },
      {
        name: "primary-dark",
        value: "color-mix(in oklch, #392868 80%, black)",
        swatch: "bg-primary-dark",
        use: "Brand mixed 80% with black.",
      },
    ],
  },
  {
    title: "Intent",
    note: "Solid for a filled control, tint for a surface something is written on.",
    tokens: [
      {
        name: "destructive",
        value: "oklch(0.577 0.245 27.325)",
        swatch: "bg-destructive",
        use: "Delete, revoke, and failure.",
      },
      {
        name: "destructive-foreground",
        value: "oklch(0.985 0 0)",
        swatch: "bg-destructive-foreground",
        use: "Text on destructive.",
      },
      {
        name: "destructive-tint",
        value: "oklch(0.948 0.028 27.325)",
        swatch: "bg-destructive-tint",
        use: "Destructive badge and alert surface.",
      },
      {
        name: "destructive-tint-foreground",
        value: "oklch(0.442 0.176 27.325)",
        swatch: "bg-destructive-tint-foreground",
        use: "Text on the destructive tint.",
      },
      {
        name: "warning",
        value: "oklch(0.769 0.188 70.08)",
        swatch: "bg-warning",
        use: "Needs attention, nothing broken yet.",
      },
      {
        name: "warning-foreground",
        value: "oklch(0.28 0.07 55)",
        swatch: "bg-warning-foreground",
        use: "Text on warning.",
      },
      {
        name: "warning-tint",
        value: "oklch(0.955 0.055 70.08)",
        swatch: "bg-warning-tint",
        use: "Warning badge and alert surface.",
      },
      {
        name: "warning-tint-foreground",
        value: "oklch(0.402 0.086 55)",
        swatch: "bg-warning-tint-foreground",
        use: "Text on the warning tint.",
      },
      {
        name: "success",
        value: "oklch(0.627 0.17 149.2)",
        swatch: "bg-success",
        use: "Completed, connected, live.",
      },
      {
        name: "success-foreground",
        value: "oklch(0.985 0 0)",
        swatch: "bg-success-foreground",
        use: "Text on success.",
      },
      {
        name: "success-tint",
        value: "oklch(0.945 0.045 149.2)",
        swatch: "bg-success-tint",
        use: "Success badge and alert surface.",
      },
      {
        name: "success-tint-foreground",
        value: "oklch(0.402 0.098 149.2)",
        swatch: "bg-success-tint-foreground",
        use: "Text on the success tint.",
      },
      {
        name: "info",
        value: "oklch(0.54 0.15 250)",
        swatch: "bg-info",
        use: "Neutral notice, no action implied.",
      },
      {
        name: "info-foreground",
        value: "oklch(0.985 0 0)",
        swatch: "bg-info-foreground",
        use: "Text on info.",
      },
      {
        name: "info-tint",
        value: "oklch(0.948 0.03 250)",
        swatch: "bg-info-tint",
        use: "Info badge and alert surface.",
      },
      {
        name: "info-tint-foreground",
        value: "oklch(0.43 0.11 250)",
        swatch: "bg-info-tint-foreground",
        use: "Text on the info tint.",
      },
    ],
  },
  {
    title: "Lines",
    note: "Edges and focus. There is no shadow in this system, so these carry separation.",
    tokens: [
      {
        name: "border",
        value: "oklch(0.922 0 0)",
        swatch: "bg-border",
        use: "Every divider and card edge.",
      },
      {
        name: "input",
        value: "oklch(0.922 0 0)",
        swatch: "bg-input",
        use: "The edge of a control.",
      },
      {
        name: "ring",
        value: "oklch(0.708 0 0)",
        swatch: "bg-ring",
        use: "The focus ring.",
      },
    ],
  },
  {
    title: "Charts",
    note: "One purple ramp, darkest first. Never a rainbow, and never for ranked steps.",
    tokens: [
      {
        name: "chart-1",
        value: "var(--primary)",
        swatch: "bg-chart-1",
        use: "First series. Follows --primary, so it stays branded.",
      },
      {
        name: "chart-2",
        value: "oklch(0.5 0.13 250)",
        swatch: "bg-chart-2",
        use: "Second series, and the single-series default.",
      },
      {
        name: "chart-3",
        value: "oklch(0.66 0.08 178)",
        swatch: "bg-chart-3",
        use: "Third series.",
      },
      {
        name: "chart-4",
        value: "oklch(0.62 0.13 72)",
        swatch: "bg-chart-4",
        use: "Fourth series.",
      },
      {
        name: "chart-5",
        value: "oklch(0.46 0.08 350)",
        swatch: "bg-chart-5",
        use: "Fifth series.",
      },
      {
        name: "chart-6",
        value: "oklch(0.66 0.18 300)",
        swatch: "bg-chart-6",
        use: "Sixth series, and the mute for de-emphasised bars.",
      },
    ],
  },
  {
    title: "Sidebar",
    note: "The left rail keeps its own set so the shell can differ from the page.",
    tokens: [
      {
        name: "sidebar",
        value: "oklch(0.985 0 0)",
        swatch: "bg-sidebar",
        use: "The rail.",
      },
      {
        name: "sidebar-foreground",
        value: "oklch(0.145 0 0)",
        swatch: "bg-sidebar-foreground",
        use: "Text in the rail.",
      },
      {
        name: "sidebar-primary",
        value: "oklch(0.205 0 0)",
        swatch: "bg-sidebar-primary",
        use: "The rail's own primary.",
      },
      {
        name: "sidebar-primary-foreground",
        value: "oklch(0.985 0 0)",
        swatch: "bg-sidebar-primary-foreground",
        use: "Text on it.",
      },
      {
        name: "sidebar-accent",
        value: "oklch(0.948 0.019 291.8)",
        swatch: "bg-sidebar-accent",
        use: "The active nav item.",
      },
      {
        name: "sidebar-accent-foreground",
        value: "oklch(0.411 0.108 291.8)",
        swatch: "bg-sidebar-accent-foreground",
        use: "Text on the active item.",
      },
      {
        name: "sidebar-border",
        value: "oklch(0.922 0 0)",
        swatch: "bg-sidebar-border",
        use: "Dividers in the rail.",
      },
      {
        name: "sidebar-ring",
        value: "oklch(0.708 0 0)",
        swatch: "bg-sidebar-ring",
        use: "Focus in the rail.",
      },
    ],
  },
  {
    title: "Defined only as a Tailwind alias",
    note: "These have no :root entry, so they are not themeable the way the rest are.",
    tokens: [
      {
        name: "tailwind-black",
        value: "#06050f",
        swatch: "bg-tailwind-black",
        use: "Near-black used by the marketing surfaces.",
      },
      {
        name: "manafa-blue",
        value: "#0d6efd",
        swatch: "bg-manafa-blue",
        use: "Manafa brand blue.",
      },
      {
        name: "manafa-light-blue",
        value: "#3d8bfd",
        swatch: "bg-manafa-light-blue",
        use: "Manafa brand blue, lighter.",
      },
      {
        name: "variable",
        value: "#0369a1",
        swatch: "bg-variable",
        use: "A template variable in prompt and scenario editors.",
      },
      {
        name: "variable-background",
        value: "#e0f2fe",
        swatch: "bg-variable-background",
        use: "The chip behind one.",
      },
    ],
  },
]
