import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

import { SECTION_FIGURE_VIEWBOX } from "./frame"

/**
 * The inventory: four primitives in plan, side by side on one control row —
 * a Button, an Input, a Switch and a Checkbox — drawn at 2x their real size.
 *
 * 32px is the default height in `src/components/ui`: `h-8` on Button's
 * default size, on Input, and on SelectTrigger's default (`CONTROL_STEPS` in
 * `lib/design-system/data.ts`). The Switch (32 x 18.4) and the Checkbox
 * (`size-4`, `rounded-[4px]`) are smaller and sit centred in that row, which
 * is what lets any of them stand beside any other without a nudge.
 */
export function ShadcnComponentsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={SECTION_FIGURE_VIEWBOX}>
      <g {...LINE}>
        {/* The row's top and bottom, run off both edges wherever no control
            already draws them. */}
        <path
          d="M0 72h960M0 136h960"
          opacity=".6"
          strokeDasharray="4 8"
        />

        {/* 32px, measured on the row. */}
        <path d="M112 72v64" />
        <path d="M102 72h20M102 136h20" />
        <path d="m104 82 8-10 8 10M104 126l8 10 8-10" />

        {/* Button: 32 tall, `rounded-lg` (10px), a label in it. */}
        <rect height="64" rx="20" width="144" x="160" y="72" />
        <path d="M200 104h64" opacity=".7" />

        {/* Input: the same height and radius, a placeholder and a caret. */}
        <rect height="64" rx="20" width="224" x="336" y="72" />
        <path d="M364 104h96" opacity=".5" />
        <path d="M476 88v32" opacity=".7" />

        {/* Switch: 32 x 18.4, centred in the row, thumb on. */}
        <rect height="37" rx="18.5" width="64" x="592" y="85.5" />
        <circle cx="637.5" cy="104" fill="currentColor" r="12" />

        {/* Checkbox: 16px, 4px radius, checked. */}
        <rect height="32" rx="8" width="32" x="688" y="88" />
        <path d="m696 104 6 6 12-12" />
      </g>

      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        transform="rotate(-90 86 104)"
        x="86"
        y="104"
      >
        32px
      </text>
    </Figure>
  )
}
