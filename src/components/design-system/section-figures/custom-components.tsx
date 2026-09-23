import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

import { SECTION_FIGURE_VIEWBOX } from "./frame"

/* Both objects are drawn at 2 units to the pixel, so the card and the dot
   lattice share one scale.

   The FileCard's sheet starts at CARD_X. The DotPattern field is 11 columns
   by 5 rows at a 32-unit pitch (16px), centred on the card's height. The
   content panel sits in it on the half-pitch, so the field stops 24 units
   (12px) short of the panel on every side: the dots in rows 1–3, columns 3–7
   are the ones the panel would cover, and they are not drawn. */
const CARD_X = 220
const FIELD_X = 476
const FIELD_Y = 72
const PITCH = 32

const DOTS = Array.from({ length: 11 * 5 }, (_, i) => ({
  col: i % 11,
  row: Math.floor(i / 11),
}))
  .filter(({ col, row }) => row === 0 || row === 4 || col < 3 || col > 7)
  .map(({ col, row }) => ({
    x: FIELD_X + col * PITCH,
    y: FIELD_Y + row * PITCH,
  }))

/**
 * Custom components: the two this product added rather than took from
 * shadcn, side by side at 2x and measured from their own source.
 *
 * Left, a FileCard in plan: the `w-14 h-18` sheet (56 by 72px) cut to
 * `rounded-md` (8px, `--radius-md`), `p-2` in to its placeholder rules, and
 * the type badge hung `-right-2` (8px) past the right edge and `bottom-1.5`
 * (6px) up from the bottom — `ui/file-card-collections.tsx`.
 *
 * Right, a DotPattern field with its pitch called out: 16px is the
 * component's default `width` and `height` (`ui/dot-pattern.tsx`), dots of
 * `cr` 1. A content panel sits in the middle and the field stops around it —
 * "a field of dots behind a panel, never over content" (PLATFORM_COMPONENTS
 * in `lib/design-system/data.ts`).
 */
export function CustomComponentsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={SECTION_FIGURE_VIEWBOX}>
      <g {...LINE}>
        {/* The card's top and bottom edges, run to both edges of the sheet. */}
        <path d="M0 64h960M0 208h960" opacity=".6" strokeDasharray="4 8" />

        {/* 56px, measured over the card. */}
        <path d={`M${CARD_X} 44h112`} />
        <path d={`M${CARD_X} 34v20M${CARD_X + 112} 34v20`} />
        <path
          d={`m${CARD_X + 10} 36-10 8 10 8M${CARD_X + 102} 36l10 8-10 8`}
        />

        {/* 72px, measured beside it. */}
        <path d={`M${CARD_X - 32} 64v144`} />
        <path d={`M${CARD_X - 42} 64h20M${CARD_X - 42} 208h20`} />
        <path
          d={`m${CARD_X - 40} 74 8-10 8 10M${CARD_X - 40} 198l8 10 8-10`}
        />

        {/* The card: 112 x 144, radius 16. Its right edge breaks where the
            badge sits over it, and picks up again on the corner arc. */}
        <path
          d={`M${CARD_X + 112} 168V80a16 16 0 0 0-16-16h-80a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h80a16 16 0 0 0 15.49-12`}
        />

        {/* Placeholder rules, 16 in from the edge (p-2). */}
        <path
          d={`M${CARD_X + 16} 84h40M${CARD_X + 16} 100h24M${CARD_X + 48} 100h24M${CARD_X + 16} 116h48`}
          opacity=".7"
        />

        {/* The type badge: 16 past the right edge, 12 up from the bottom. */}
        <rect height="28" rx="8" width="56" x={CARD_X + 72} y="168" />

        {/* 16px, the pitch between two dots in the field's top row. */}
        <path d={`M${FIELD_X} 34v20M${FIELD_X + PITCH} 34v20`} />
        <path d={`M${FIELD_X - 24} 44h24M${FIELD_X + PITCH + 24} 44h-24`} />
        <path
          d={`m${FIELD_X - 10} 36 10 8-10 8M${FIELD_X + PITCH + 10} 36l-10 8 10 8`}
        />

        {/* The content panel the field stops short of. */}
        <rect
          height="80"
          rx="16"
          width="144"
          x={FIELD_X + 88}
          y={FIELD_Y + 24}
        />
        <path
          d={`M${FIELD_X + 112} ${FIELD_Y + 52}h64M${FIELD_X + 112} ${FIELD_Y + 76}h40`}
          opacity=".7"
        />
      </g>

      {/* The field: dots of radius 2 (cr 1 at 2x). */}
      <g fill="currentColor">
        {DOTS.map((dot) => (
          <circle cx={dot.x} cy={dot.y} key={`${dot.x}-${dot.y}`} r="2" />
        ))}
      </g>

      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        x={CARD_X + 56}
        y="28"
      >
        56px
      </text>
      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        transform={`rotate(-90 ${CARD_X - 48} 136)`}
        x={CARD_X - 48}
        y="136"
      >
        72px
      </text>
      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        x={FIELD_X + PITCH / 2}
        y="28"
      >
        16px
      </text>
    </Figure>
  )
}
