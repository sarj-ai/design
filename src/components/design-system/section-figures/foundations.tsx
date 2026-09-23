import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

import { SECTION_FIGURE_VIEWBOX } from "./frame"

/**
 * Foundations: the control scale, drawn as rungs. Four buttons stand on one
 * baseline, tallest first, each drawn at 3.5 units to the pixel and labelled
 * with its own height — 36, 32, 28 and 24px, the `lg`, default, `sm` and `xs`
 * sizes in `ui/button.tsx` (`h-9` `h-8` `h-7` `h-6`) and the four
 * `CONTROL_STEPS` in `lib/design-system/data.ts`. A guide runs off each top to
 * the edge: the fixed scale every control sits on, in 4px steps.
 */
export function FoundationsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={SECTION_FIGURE_VIEWBOX}>
      <g {...LINE}>
        {/* The baseline every control stands on, run to both edges. */}
        <path d="M0 176h960" opacity=".6" strokeDasharray="4 8" />

        {/* The four controls. Corners are the real ones at the same scale:
            rounded-lg (10px) on lg and default, radius-md (8px) on sm and
            xs. */}
        <rect height="126" rx="35" width="180" x="48" y="50" />
        <rect height="112" rx="35" width="164" x="248" y="64" />
        <rect height="98" rx="28" width="148" x="432" y="78" />
        <rect height="84" rx="28" width="132" x="600" y="92" />

        {/* Each top, carried off the right edge. Tallest first, so no guide
            crosses a control. */}
        <path
          d="M0 50h960M0 64h960M0 78h960M0 92h960"
          opacity=".5"
          strokeDasharray="4 8"
        />
      </g>

      <g className="text-xs" fill="currentColor" textAnchor="middle">
        <text x="138" y="117">
          36px
        </text>
        <text x="330" y="124">
          32px
        </text>
        <text x="506" y="131">
          28px
        </text>
        <text x="666" y="138">
          24px
        </text>
      </g>
    </Figure>
  )
}
