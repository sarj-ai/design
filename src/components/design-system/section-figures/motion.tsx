import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

import { SECTION_FIGURE_VIEWBOX } from "./frame"

/* The plot: time along, progress up. 0 to 300ms at 2 units per ms (x 180 to
   780), progress 0 to 1 over 136 units (y 207 to 71). */
const X0 = 180
const X1 = 780
const Y0 = 207
const Y1 = 71

/**
 * Motion: both easing curves, plotted over the longest duration allowed.
 *
 * The time axis runs 0 to 300ms — the ceiling in `eslint-rules/rules/
 * motion-tokens.mjs`, "nothing over 300ms" — ticked every 50ms, with a
 * keyframe on each of the six durations the rule allows (its
 * ALLOWED_DURATIONS: 0, 100, 150, 200, 250, 300). 50ms carries a tick and no
 * keyframe, because it is not one of them.
 *
 * Over it, the two curves in globals.css, from their real control points:
 * `--ease-out-cubic` cubic-bezier(0.215, 0.61, 0.355, 1) at full strength with
 * its handles drawn, and `--ease-in-out-cubic` cubic-bezier(0.645, 0.045,
 * 0.355, 1) a step back. `drawer-up` and `hero-in` run exactly this: 0.3s on
 * ease-out-cubic.
 */
export function MotionFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={SECTION_FIGURE_VIEWBOX}>
      <g {...LINE}>
        {/* The plot's edges, run off the sheet: progress 1 and the baseline
            across, 0ms and the 300ms ceiling top to bottom. */}
        <path
          d={`M0 ${Y1}h960M0 ${Y0}h960M${X0} 0v240M${X1} 0v240`}
          opacity=".6"
          strokeDasharray="4 8"
        />

        {/* 300ms, measured over the plot between the two verticals. */}
        <path d={`M${X0} 47H${X1}`} />
        <path d={`M${X0} 37v20M${X1} 37v20`} />
        <path d={`m${X0 + 10} 39-10 8 10 8M${X1 - 10} 39l10 8-10 8`} />

        {/* The time axis, solid from 0 to the ceiling, with a tick every
            50ms. */}
        <path d={`M${X0} ${Y0}H${X1}`} />
        <path d={`M${X0 + 100} ${Y0 - 6}v12`} opacity=".7" />

        {/* ease-in-out-cubic: P1 (0.645, 0.045), P2 (0.355, 1). */}
        <path
          d={`M${X0} ${Y0}C567 200.88 393 ${Y1} ${X1} ${Y1}`}
          opacity=".6"
        />

        {/* ease-out-cubic: P1 (0.215, 0.61), P2 (0.355, 1), and the handles
            from each end to its control point. */}
        <path d={`M${X0} ${Y0}C309 124.04 393 ${Y1} ${X1} ${Y1}`} />
        <path d={`M${X0} ${Y0} 309 124.04M${X1} ${Y1}H393`} opacity=".7" />
      </g>

      <g fill="currentColor">
        <circle cx="309" cy="124.04" r="4" />
        <circle cx="393" cy={Y1} r="4" />

        {/* The six allowed durations — 0, 100, 150, 200, 250, 300ms. */}
        <path
          d={[0, 100, 150, 200, 250, 300]
            .map((ms) => `M${X0 + ms * 2} ${Y0 - 7}l7 7-7 7-7-7z`)
            .join("")}
        />
      </g>

      <g className="text-xs" fill="currentColor">
        <text textAnchor="middle" x={(X0 + X1) / 2} y="33">
          300ms
        </text>
        <text textAnchor="end" x="300" y="116">
          ease-out-cubic
        </text>
        <text x="494" y="152">
          ease-in-out-cubic
        </text>
      </g>
    </Figure>
  )
}
