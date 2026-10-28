import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

import { SECTION_FIGURE_VIEWBOX } from "./frame"

/* 3.5 units to the pixel. */
const SCALE = 3.5
const BASELINE = 183

/* Must match the button heights in ui/button.tsx and CONTROL_STEPS in lib/design-system/data.ts. */
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

export function FoundationsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={SECTION_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d={`M0 ${BASELINE}h960`} opacity=".6" strokeDasharray="4 8" />
        <path
          d={CONTROLS.map((c) => `M0 ${c.top}h960`).join("")}
          opacity=".5"
          strokeDasharray="4 8"
        />

        {CONTROLS.map((c) => (
          <g key={c.px}>
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
            <text key={c.px} transform={`rotate(-90 ${x} ${y})`} x={x} y={y}>
              {c.px}px
            </text>
          )
        })}
      </g>
    </Figure>
  )
}
