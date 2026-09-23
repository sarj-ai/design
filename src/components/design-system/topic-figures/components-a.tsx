import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

import { TOPIC_FIGURE_VIEWBOX } from "./frame"

/*
 * The first half of the shadcn primitive groups, one small plate each. The
 * controls share one height — 40 units, the `h-8` control line — so a row of
 * tiles reads as one inventory. Guides mark that line where it is the point.
 */

/** Surface: a card with its body cut by a collapsible section, folded away. */
function SurfaceFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        {/* The fold line, where the collapsible opens. */}
        <path d="M0 124h240" opacity=".6" strokeDasharray="4 8" />

        {/* The card and its title. */}
        <rect height="124" rx="14" width="144" x="48" y="76" />
        <path d="M68 102h56" />

        {/* The collapsible's trigger, with its chevron. */}
        <path d="M68 146h72" />
        <path d="m162 142 6 6 6-6" />

        {/* What it folds away. */}
        <path d="M68 168h92M68 182h60" opacity=".5" />
      </g>
    </Figure>
  )
}

/** Actions: the primary button beside its quieter secondary. */
function ActionsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d="M0 116h240M0 156h240" opacity=".6" strokeDasharray="4 8" />

        {/* Secondary. */}
        <g opacity=".6">
          <rect height="40" rx="12" width="68" x="44" y="116" />
          <path d="M62 136h32" />
        </g>

        {/* Primary: the focal object. */}
        <rect height="40" rx="12" width="76" x="124" y="116" />
        <path d="M142 136h40" />
      </g>
    </Figure>
  )
}

/** Status: an avatar carrying a presence dot, and a badge naming the state. */
function StatusFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d="M0 136h240" opacity=".6" strokeDasharray="4 8" />

        {/* Avatar, with its initials rule and a status dot on the rim. */}
        <circle cx="84" cy="136" r="32" />
        <path d="M72 136h24" opacity=".6" />
        <circle cx="107" cy="159" fill="currentColor" r="7" />

        {/* Badge: a dot and its label. */}
        <g opacity=".7">
          <rect height="26" rx="13" width="64" x="136" y="123" />
          <circle cx="150" cy="136" fill="currentColor" r="3" />
          <path d="M160 136h26" />
        </g>
      </g>
    </Figure>
  )
}

/** Text entry: an input mid-type, the caret after what is written. */
function TextEntryFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d="M0 116h240M0 156h240" opacity=".6" strokeDasharray="4 8" />

        <rect height="40" rx="12" width="160" x="40" y="116" />

        {/* Typed so far, then the caret. */}
        <path d="M58 136h56" />
        <path d="M124 126v20" />
      </g>
    </Figure>
  )
}

/** Choice: a checkbox, a radio and a switch, all on, on one line. */
function ChoiceFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d="M0 122h240M0 150h240" opacity=".6" strokeDasharray="4 8" />

        {/* Checkbox, checked: the focal object. */}
        <rect height="28" rx="7" width="28" x="44" y="122" />
        <path d="m51 137 5 5 10-11" />

        {/* Radio, selected. */}
        <g opacity=".7">
          <circle cx="104" cy="136" r="14" />
          <circle cx="104" cy="136" fill="currentColor" r="6" />
        </g>

        {/* Switch, on. */}
        <g opacity=".7">
          <rect height="28" rx="14" width="56" x="140" y="122" />
          <circle cx="182" cy="136" fill="currentColor" r="10" />
        </g>
      </g>
    </Figure>
  )
}

/** Form structure: label, control, description and error, on one left edge. */
function FormStructureFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        {/* The shared left edge every part of a field hangs from. */}
        <path d="M72 0v240" opacity=".6" strokeDasharray="4 8" />

        {/* Label. */}
        <path d="M72 88h44" />

        {/* The control. */}
        <rect height="40" rx="12" width="128" x="72" y="104" />

        {/* Description, then the error under it. */}
        <path d="M72 164h96" opacity=".6" />
        <g opacity=".6">
          <circle cx="76" cy="184" r="4" />
          <path d="M88 184h60" />
        </g>
      </g>
    </Figure>
  )
}

/** Topic id → its tile's drawing. */
export const COMPONENTS_A_FIGURES: Record<
  string,
  (props: FigureProps) => React.ReactNode
> = {
  surface: SurfaceFigure,
  actions: ActionsFigure,
  status: StatusFigure,
  "text-entry": TextEntryFigure,
  choice: ChoiceFigure,
  "form-structure": FormStructureFigure,
}
