import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

import { SECTION_FIGURE_VIEWBOX } from "./frame"

/* The dot lattice, at 2x. DotPattern's defaults are a 16px tile with each dot
   at (1, 1) inside it and a 1px radius — so at 2x a 32-unit pitch, dots 2
   units in from the panel's corner, radius 2. The panel starts at x 420 and
   runs off the sheet; the content block inside it is cut out of the field,
   because the field is never drawn over content. */
const PANEL_X = 420
const PANEL_Y = 48
const CONTENT = { x: 548, y: 96, width: 192, height: 64 }

const DOTS = Array.from({ length: 17 * 5 }, (_, i) => ({
  x: PANEL_X + 2 + (i % 17) * 32,
  y: PANEL_Y + 2 + Math.floor(i / 17) * 32,
})).filter(
  (dot) =>
    dot.x < CONTENT.x - 8 ||
    dot.x > CONTENT.x + CONTENT.width + 8 ||
    dot.y < CONTENT.y - 8 ||
    dot.y > CONTENT.y + CONTENT.height + 8,
)

/**
 * Custom components: the two this product added rather than took from
 * shadcn, each drawn at 2x and measured from its own source.
 *
 * Left, a FileCard in plan: the `w-14 h-18` sheet (56 by 72px) cut to
 * `rounded-md` (8px), a few placeholder rules for its contents, and the type
 * badge that overhangs the right edge by `-right-2` (8px).
 *
 * Right, a DotPattern field behind a panel, with the pitch called out: 16px
 * is the component's default `width` and `height`, and every placement in the
 * design system uses the default. The block in the middle of the panel is
 * content, and the field stops around it.
 */
export function CustomComponentsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={SECTION_FIGURE_VIEWBOX}>
      <g {...LINE}>
        {/* The FileCard's top and bottom edges, run off the left of the
            sheet, so the drawing reads as cropped from a larger one. */}
        <path d="M0 48h960M0 192h960" opacity=".6" strokeDasharray="4 8" />

        {/* 56px, measured over the card. */}
        <path d="M120 30h112" />
        <path d="M120 20v20M232 20v20" />
        <path d="m130 22-10 8 10 8M222 22l10 8-10 8" />

        {/* 72px, measured beside it. */}
        <path d="M88 48v144" />
        <path d="M78 48h20M78 192h20" />
        <path d="m80 58 8-10 8 10M80 182l8 10 8-10" />

        {/* The card: 112x144 at 2x, radius 16 (rounded-md, 8px), p-2 in from
            each edge to the placeholder rules. Its outline stops where the
            badge sits over it. */}
        <path d="M232 152V64a16 16 0 0 0-16-16h-80a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h80a16 16 0 0 0 11.3-4.7" />
        <path
          d="M136 68h40M136 84h24M166 84h24M136 100h40M182 100h24M136 116h24"
          opacity=".7"
        />

        {/* The type badge, hung off the right edge by -right-2. */}
        <rect height="28" rx="8" width="56" x="192" y="152" />

        {/* The panel the field sits behind: its right side runs off the
            sheet. */}
        <path
          d={`M960 ${PANEL_Y}H436a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h524`}
        />

        {/* The content the field stops short of. */}
        <rect
          height={CONTENT.height}
          opacity=".7"
          rx="12"
          width={CONTENT.width}
          x={CONTENT.x}
          y={CONTENT.y}
        />

        {/* 16px, the pitch between two dots. */}
        <path d="M454 20v20M486 20v20" />
        <path d="M430 30h24M510 30h-24" />
        <path d="m444 22 10 8-10 8M496 22l-10 8 10 8" />
      </g>

      <g fill="currentColor">
        {DOTS.map((dot) => (
          <circle cx={dot.x} cy={dot.y} key={`${dot.x}-${dot.y}`} r="2" />
        ))}
      </g>

      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        x="176"
        y="14"
      >
        56px
      </text>
      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        transform="rotate(-90 64 120)"
        x="64"
        y="120"
      >
        72px
      </text>
      <text className="text-xs" fill="currentColor" x="522" y="34">
        16px
      </text>
    </Figure>
  )
}
