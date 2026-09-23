import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

import { SECTION_FIGURE_VIEWBOX } from "./frame"

/**
 * The inventory, running: four primitives from `src/components/ui` standing
 * on one control line, drawn at 3 units to the pixel. The Button is the
 * focal object at full strength; the Input, Switch and Checkbox sit a step
 * back beside it.
 *
 * 32px is the default control height: `h-8` on Button's default size and on
 * Input, both cut to `rounded-lg` (10px, `--radius`). The Switch (32 x
 * 18.4px, `rounded-full`, a `size-4` thumb) and the Checkbox (`size-4`,
 * `rounded-[4px]`) are shorter and centre on the same line — which is what
 * lets any of them stand beside any other without a nudge.
 */
export function ShadcnComponentsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={SECTION_FIGURE_VIEWBOX}>
      <g {...LINE}>
        {/* The row's top and bottom, 96 units apart (32px), run off both
            edges. They double as the dimension's extension lines. */}
        <path d="M0 72h960M0 168h960" opacity=".6" strokeDasharray="4 8" />

        {/* 32px, measured on the row, outside the controls. */}
        <path d="M100 72v96" />
        <path d="M90 72h20M90 168h20" />
        <path d="m92 82 8-10 8 10M92 158l8 10 8-10" />

        {/* Button: 72 x 32px, radius 10px, a label rule across its content
            box (px-2.5). The focal object. */}
        <rect height="96" rx="30" width="216" x="148" y="72" />
        <path d="M188 120h136" />

        {/* Input: the same height and radius, a placeholder and a caret. */}
        <g opacity=".7">
          <rect height="96" rx="30" width="288" x="396" y="72" />
          <path d="M426 120h120" opacity=".7" />
          <path d="M566 100v40" />
        </g>

        {/* Switch: 32 x 18.4px, fully round, checked — the 16px thumb sits
            14px along (translate-x 100% - 2px). */}
        <g opacity=".7">
          <rect height="55.2" rx="27.6" width="96" x="716" y="92.4" />
          <circle cx="785" cy="120" fill="currentColor" r="24" />
        </g>

        {/* Checkbox: 16px, radius 4px, checked. */}
        <g opacity=".7">
          <rect height="48" rx="12" width="48" x="844" y="96" />
          <path d="m856 121 8 8 16-17" />
        </g>
      </g>

      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        transform="rotate(-90 74 120)"
        x="74"
        y="120"
      >
        32px
      </text>
    </Figure>
  )
}
