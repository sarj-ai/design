import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

import { SECTION_FIGURE_VIEWBOX } from "./frame"

/**
 * Motion: the curve and the clock.
 *
 * On the left, `--ease-out-cubic` — cubic-bezier(0.215, 0.61, 0.355, 1) in
 * globals.css — plotted on its unit square from the real control points, with
 * both handles drawn. On the right, the time axis at 1.6 units per ms: the
 * six durations `motion-tokens` allows (0, 100, 150, 200, 250, 300 — its
 * ALLOWED_DURATIONS) as keyframes, and the 300ms ceiling the Duration rule
 * sets, measured and run off both edges of the sheet.
 */
export function MotionFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={SECTION_FIGURE_VIEWBOX}>
      <g {...LINE}>
        {/* The unit square, 136 units a side: time along, progress up. Its
            baseline runs off the left edge and on into the time axis. */}
        <path d="M96 32v136h136" />
        <path d="M0 32h960M232 0v200M96 0v200" opacity=".5" strokeDasharray="4 8" />
        <path d="M0 168h960" opacity=".6" strokeDasharray="4 8" />

        {/* ease-out-cubic, exact: P1 (0.215, 0.61), P2 (0.355, 1), scaled
            onto the square. The handles run from each end to its point. */}
        <path d="M96 168C125.24 85.04 144.28 32 232 32" />
        <path d="M96 168 125.24 85.04M232 32h-87.72" opacity=".7" />
        <circle cx="125.24" cy="85.04" fill="currentColor" r="4" />
        <circle cx="144.28" cy="32" fill="currentColor" r="4" />

        {/* The time axis, 0 to 300ms at 1.6 units per ms, and dashed past it:
            nothing may run there. */}
        <path d="M320 168h480" />

        {/* The six allowed durations — 0, 100, 150, 200, 250, 300ms. */}
        <path
          d="m320 161 7 7-7 7-7-7zM480 161l7 7-7 7-7-7zM560 161l7 7-7 7-7-7zM640 161l7 7-7 7-7-7zM720 161l7 7-7 7-7-7zM800 161l7 7-7 7-7-7z"
          fill="currentColor"
        />

        {/* The ceiling, run off the top and bottom of the sheet. */}
        <path d="M800 0v200" opacity=".6" strokeDasharray="4 8" />

        {/* 300ms, measured from zero to the ceiling. */}
        <path d="M320 112h480" />
        <path d="M320 102v20M800 102v20" />
        <path d="m330 104-10 8 10 8M790 104l10 8-10 8" />
      </g>

      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        x="560"
        y="98"
      >
        300ms
      </text>
      <text className="text-xs" fill="currentColor" x="96" y="194">
        ease-out-cubic
      </text>
      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        x="320"
        y="194"
      >
        0
      </text>
    </Figure>
  )
}
