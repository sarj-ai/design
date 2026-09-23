import { IconsTopicGlyph } from "@/components/design-system/icons"
import { Figure, LINE, type FigureProps } from "@/components/shared/figure"
import { cn } from "@/lib/utils"

import { TOPIC_FIGURE_VIEWBOX } from "./frame"

/* Every subject sits in the box x 60–180, y 72–192: centred across the sheet,
   a little below its middle, clear of the tile's number. */

/** Colour: a swatch strip, one cell per step of a ramp. */
function ColourFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d="M0 168h240" opacity=".5" strokeDasharray="4 8" />
        <rect height="56" rx="8" width="120" x="60" y="104" />
        <path d="M84 104v56M108 104v56M132 104v56M156 104v56" opacity=".6" />
      </g>
    </Figure>
  )
}

/** Layering: three planes stacked in plan, each lifted over the last. */
function LayeringFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <rect height="64" opacity=".5" rx="8" width="80" x="100" y="80" />
        <rect height="64" opacity=".7" rx="8" width="80" x="80" y="104" />
        <rect height="64" rx="8" width="80" x="60" y="128" />
      </g>
    </Figure>
  )
}

/**
 * Icons: one real glyph on its construction sheet — the keyline square it is
 * drawn inside, centre guides run edge to edge, and the 24px grid every
 * HugeIcons glyph is drawn on called out above it.
 */
function IconsFigure({ className }: FigureProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("grid place-items-center", className)}
    >
      <Figure
        className="absolute inset-0 h-full"
        viewBox={TOPIC_FIGURE_VIEWBOX}
      >
        <g {...LINE}>
          {/* Centre guides through the glyph, to every edge. */}
          <path d="M0 140h240M120 0v240" opacity=".5" strokeDasharray="4 8" />
          {/* The keyline square the glyph sits in, and its padding box. */}
          <rect height="112" opacity=".7" rx="14" width="112" x="64" y="84" />
          <rect
            height="80"
            opacity=".4"
            rx="6"
            strokeDasharray="4 8"
            width="80"
            x="80"
            y="100"
          />
          {/* 24px, the grid the set is drawn on. */}
          <path d="M64 68h112M64 60v16M176 60v16" opacity=".7" />
          <path d="m74 62-10 6 10 6M166 62l10 6-10 6" opacity=".7" />
        </g>
        <text
          className="text-xs"
          fill="currentColor"
          textAnchor="middle"
          x="120"
          y="54"
        >
          24px
        </text>
      </Figure>
      {/* The glyph itself, centred on the guides. */}
      <IconsTopicGlyph className="relative mt-4 size-12" strokeWidth={1.5} />
    </div>
  )
}

/** Shadows: a card, and the one soft edge it casts on the ground below. */
function ShadowsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d="M0 184h240" opacity=".5" strokeDasharray="4 8" />
        <path
          d="M68 156v6a10 10 0 0 0 10 10h84a10 10 0 0 0 10-10v-6"
          opacity=".5"
        />
        <rect height="72" rx="10" width="104" x="68" y="92" />
      </g>
    </Figure>
  )
}

/** Typography: two letterforms on cap, x-height and baseline guides. */
function TypographyFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path
          d="M0 88h240M0 132h240M0 180h240"
          opacity=".5"
          strokeDasharray="4 8"
        />
        <path d="m64 180 28-92 28 92M73 150h38" />
        <circle cx="152" cy="156" r="24" />
        <path d="M176 132v48" />
      </g>
    </Figure>
  )
}

/* The spacing steps 8 12 16 24 32, at 1.25 units to the pixel. */
const SPACING_STEPS = [8, 12, 16, 24, 32].map((px) => px * 1.25)
/* Each square's left edge, 5 units after the one before — worked out once
   here rather than accumulated during render. */
const SPACING_LEFTS = SPACING_STEPS.map(
  (_, i) =>
    52.5 + SPACING_STEPS.slice(0, i).reduce((sum, size) => sum + size + 5, 0),
)

/** Spacing: the scale's steps as squares standing on one baseline. */
function SpacingFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d="M0 168h240" opacity=".5" strokeDasharray="4 8" />
        {SPACING_STEPS.map((size, i) => (
          <rect
            height={size}
            key={size}
            rx="2"
            width={size}
            x={SPACING_LEFTS[i]}
            y={168 - size}
          />
        ))}
      </g>
    </Figure>
  )
}

/** Radius: one rounded corner over the square corner it replaces. */
function RadiusFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d="M84 0v240M0 80h240" opacity=".5" strokeDasharray="4 8" />
        <path d="M84 192v-64a48 48 0 0 1 48-48h64" />
        <path d="M132 128 98 94" opacity=".6" />
        <circle cx="132" cy="128" opacity=".6" r="2" />
      </g>
      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="start"
        x="140"
        y="146"
      >
        10px
      </text>
    </Figure>
  )
}

/** Scrollbars: a panel with a bare thumb on its edge, and no track. */
function ScrollbarsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <rect height="120" rx="10" width="112" x="64" y="72" />
        <path d="M80 96h60M80 116h48M80 136h60M80 156h40" opacity=".5" />
        <path d="M164 88v40" strokeWidth="4" />
      </g>
    </Figure>
  )
}

/** Accessibility: a control wearing its visible focus ring. */
function AccessibilityFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <rect height="48" opacity=".6" rx="16" width="120" x="60" y="110" />
        <rect height="36" rx="10" width="108" x="66" y="116" />
        <path d="M100 134h40" opacity=".5" />
      </g>
    </Figure>
  )
}

/* The four control heights, 36 32 28 24px, at 1.5 units to the pixel. */
const CONTROL_HEIGHTS = [36, 32, 28, 24].map((px) => px * 1.5)

/** Control scale: the four heights side by side on one baseline. */
function ControlScaleFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d="M0 180h240" opacity=".6" strokeDasharray="4 8" />
        <path d="M0 126h240" opacity=".5" strokeDasharray="4 8" />
        {CONTROL_HEIGHTS.map((height, i) => (
          <rect
            height={height}
            key={height}
            rx="8"
            width="24"
            x={60 + i * 32}
            y={180 - height}
          />
        ))}
      </g>
    </Figure>
  )
}

/** Enforcement: a file of code with one line underlined as an error. */
function EnforcementFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <rect height="112" rx="8" width="96" x="72" y="80" />
        <path d="M88 104h56M88 124h40M88 164h48" opacity=".5" />
        <path d="M88 144h64" />
        <path d="m88 154 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4" />
      </g>
    </Figure>
  )
}

/** Topic id → its tile's drawing. */
export const FOUNDATIONS_FIGURES: Record<
  string,
  (props: FigureProps) => React.ReactNode
> = {
  colour: ColourFigure,
  layering: LayeringFigure,
  icons: IconsFigure,
  shadows: ShadowsFigure,
  typography: TypographyFigure,
  spacing: SpacingFigure,
  radius: RadiusFigure,
  scrollbars: ScrollbarsFigure,
  accessibility: AccessibilityFigure,
  "control-scale": ControlScaleFigure,
  enforcement: EnforcementFigure,
}
