import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

import { TOPIC_FIGURE_VIEWBOX } from "./frame"

/* Every motion tile draws inside one box: x 60 to 200, y 76 to 196. */
const L = 60
const R = 200
const T = 76
const B = 196

/**
 * Easing: `--ease-out-cubic`, cubic-bezier(0.215, 0.61, 0.355, 1), plotted
 * from its real control points with its handles drawn.
 */
function EasingFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d={`M0 ${T}h240M0 ${B}h240`} opacity=".6" strokeDasharray="4 8" />
        <path d={`M${L} ${B}C90.1 122.8 109.7 ${T} ${R} ${T}`} />
        <path d={`M${L} ${B} 90.1 122.8M${R} ${T}H109.7`} opacity=".6" />
      </g>
      <g fill="currentColor">
        <circle cx="90.1" cy="122.8" r="4" />
        <circle cx="109.7" cy={T} r="4" />
      </g>
    </Figure>
  )
}

/**
 * Duration: a 0 to 300ms timeline with a keyframe on each duration
 * `eslint-rules/rules/motion-tokens.mjs` allows — 0, 100, 150, 200, 250,
 * 300 — and the 300ms ceiling run off the sheet.
 */
function DurationFigure({ className }: FigureProps) {
  const x = (ms: number) => L + (ms * (R - L)) / 300
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d={`M${R} 0v240`} opacity=".6" strokeDasharray="4 8" />
        <path d={`M${L} 160H${R}`} />
        <path d={`M${L} 124H${R}M${L} 116v16`} opacity=".6" />
        <path d={`m${R - 8} 118 8 6-8 6`} opacity=".6" />
      </g>
      <path
        d={[0, 100, 150, 200, 250, 300]
          .map((ms) => `M${x(ms)} 153l7 7-7 7-7-7z`)
          .join("")}
        fill="currentColor"
      />
      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        x="130"
        y="112"
      >
        300ms
      </text>
    </Figure>
  )
}

/**
 * What may animate: a box, and the same box moved (transform) and faded
 * (opacity) — the only two properties the compositor takes.
 */
function AnimatableFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d={`M0 ${B}h240`} opacity=".6" strokeDasharray="4 8" />
        <rect height="60" rx="8" width="60" x={L} y={B - 60} />
        <rect
          height="60"
          opacity=".5"
          rx="8"
          width="60"
          x={R - 60}
          y={B - 60}
        />
        <path d="M90 116h72m-8-6 8 6-8 6" opacity=".7" />
      </g>
    </Figure>
  )
}

/**
 * Reduced motion: the same element twice — above it moves, below it holds
 * where it started. Each carries its own escape.
 */
function ReducedMotionFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d={`M${L} 0v240`} opacity=".6" strokeDasharray="4 8" />
        <rect height="40" rx="6" width="40" x={L} y={T} />
        <rect height="40" opacity=".5" rx="6" width="40" x={R - 40} y={T} />
        <path d="M110 96h36m-8-6 8 6-8 6" opacity=".7" />
        <rect height="40" rx="6" width="40" x={L} y={B - 40} />
      </g>
    </Figure>
  )
}

/**
 * Performance: frame times as bars, every one under the frame budget.
 */
function MotionPerformanceFigure({ className }: FigureProps) {
  const bars = [52, 64, 44, 70, 58, 48]
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d="M0 116h240" opacity=".6" strokeDasharray="4 8" />
        <path d={`M${L} ${B}H${R}`} />
        {bars.map((h, i) => (
          <rect
            height={h}
            key={i}
            opacity=".6"
            rx="2"
            width="12"
            x={L + 8 + i * 24}
            y={B - h}
          />
        ))}
      </g>
    </Figure>
  )
}

/** Topic id → its tile's drawing. */
export const MOTION_FIGURES: Record<
  string,
  (props: FigureProps) => React.ReactNode
> = {
  easing: EasingFigure,
  duration: DurationFigure,
  animatable: AnimatableFigure,
  "reduced-motion": ReducedMotionFigure,
  "motion-performance": MotionPerformanceFigure,
}
