import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

import { SECTION_FIGURE_VIEWBOX } from "./frame"

/* 3.5 units to the pixel. The baseline sits as far above the sheet's bottom
   as the tallest control's top sits below its top, so the air is even. */
const SCALE = 3.5
const BASELINE = 183

/* The four control heights — `h-9` `h-8` `h-7` `h-6` on `lg`, default, `sm`
   and `xs` in `ui/button.tsx`, and the four `CONTROL_STEPS` in
   `lib/design-system/data.ts`. Corners are the real ones at the same scale:
   `rounded-lg` (10px) on lg and default, `radius-md` (8px) on sm and xs. */
const CONTROLS = [
  { px: 36, x: 116, width: 160, radius: 10 },
  { px: 32, x: 352, width: 144, radius: 10 },
  { px: 28, x: 572, width: 128, radius: 8 },
  { px: 24, x: 776, width: 112, radius: 8 },
].map((control) => {
  const height = control.px * SCALE
  const top = BASELINE - height
  return { ...control, height, top, dim: control.x - 20 }
})

/**
 * Foundations: the control scale, drawn as an elevation. Four buttons stand
 * on one baseline, tallest first, centred on the sheet. Each height is
 * measured on a dimension line beside it, outside the shape, and a guide runs
 * off each real top to both edges — the fixed scale every control sits on,
 * in 4px steps.
 */
export function FoundationsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={SECTION_FIGURE_VIEWBOX}>
      <g {...LINE}>
        {/* The baseline every control stands on, and each control's top, run
            to both edges. */}
        <path d={`M0 ${BASELINE}h960`} opacity=".6" strokeDasharray="4 8" />
        <path
          d={CONTROLS.map((c) => `M0 ${c.top}h960`).join("")}
          opacity=".5"
          strokeDasharray="4 8"
        />

        {CONTROLS.map((c) => (
          <g key={c.px}>
            {/* The control, and its label as a rule at its centre. */}
            <rect
              height={c.height}
              rx={c.radius * SCALE}
              width={c.width}
              x={c.x}
              y={c.top}
            />
            <path
              d={`M${c.x + c.width * 0.3} ${c.top + c.height / 2}h${c.width * 0.4}`}
              opacity=".5"
            />

            {/* Its height, on a dimension line beside it. */}
            <path d={`M${c.dim} ${c.top}V${BASELINE}`} />
            <path
              d={`M${c.dim - 10} ${c.top}h20M${c.dim - 10} ${BASELINE}h20`}
            />
            <path
              d={`m${c.dim - 8} ${c.top + 10} 8-10 8 10M${c.dim - 8} ${BASELINE - 10}l8 10 8-10`}
            />
          </g>
        ))}
      </g>

      <g className="text-xs" fill="currentColor" textAnchor="middle">
        {CONTROLS.map((c) => {
          const x = c.dim - 22
          const y = (c.top + BASELINE) / 2
          return (
            <text
              key={c.px}
              transform={`rotate(-90 ${x} ${y})`}
              x={x}
              y={y}
            >
              {c.px}px
            </text>
          )
        })}
      </g>
    </Figure>
  )
}
