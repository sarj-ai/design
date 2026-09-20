import { cn } from "@/lib/utils"

/**
 * The drawings in the nav panels.
 *
 * One per menu, in the register the reference uses: a technical drawing of the
 * thing the menu opens, in hairlines, with the measurement that actually
 * governs it called out. Not an icon blown up, and not a picture of a feature
 * — a plan of it.
 *
 * Each one is drawn at 2x (520x320 user units for a ~260px cell) so a
 * `text-xs` label lands at about 7px on screen. That is what keeps the numbers
 * reading as annotation rather than as copy, without an off-scale type size.
 *
 * Every stroke is `currentColor`, so the cell owns the colour and can lift the
 * whole drawing on hover with one class.
 */

type FigureProps = { className?: string }

/* Hairlines, one weight, round ends: a drawing, not a diagram. */
const LINE = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

function Figure({
  children,
  className,
}: FigureProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("w-full", className)}
      fill="none"
      viewBox="0 0 520 320"
    >
      {children}
    </svg>
  )
}

/**
 * The index: an app window, measured. 1400px is `max-w-350`, the width every
 * page in the lab is laid out at, so the callout is the page's own spec.
 */
export function MockupsFigure({ className }: FigureProps) {
  return (
    <Figure className={className}>
      <g {...LINE}>
        {/* Dimension line over the frame, ticked and arrowed at both ends. */}
        <path d="M68 44h384" />
        <path d="M68 34v20M452 34v20" />
        <path d="m78 36-10 8 10 8M442 36l10 8-10 8" />

        {/* The window: rail, header rule, two cards, a row under them. */}
        <rect height="224" rx="20" width="384" x="68" y="76" />
        <path d="M148 76v224M148 124h304" />
        <rect height="88" rx="12" width="120" x="176" y="148" />
        <rect height="88" rx="12" width="120" x="312" y="148" />
        <path d="M176 264h248" opacity=".5" />
        <path d="M92 104h32M92 128h32M92 152h20" opacity=".7" />

        {/* Guides running off both edges, so the drawing reads as cropped out
            of a larger sheet rather than centred in a box. */}
        <path
          d="M0 76h68M452 76h68M0 300h68M452 300h68"
          opacity=".6"
          strokeDasharray="4 8"
        />
      </g>

      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        x="260"
        y="24"
      >
        1400px
      </text>
    </Figure>
  )
}

/**
 * A reel: the 1920x1080 canvas with its two dimensions called out, and the
 * timeline under it. The keyframes are rhombuses, which is the one shape the
 * logo already repeats.
 */
export function ReelsFigure({ className }: FigureProps) {
  return (
    <Figure className={className}>
      <g {...LINE}>
        <path d="M84 44h320" />
        <path d="M84 34v20M404 34v20" />
        <path d="m94 36-10 8 10 8M394 36l10 8-10 8" />

        {/* The canvas, and inside it the shape every beat is made of: a line
            of type against a shot. */}
        <rect height="180" rx="8" width="320" x="84" y="64" />
        <path d="M116 128h120M116 156h72" opacity=".7" />
        <rect height="88" opacity=".7" rx="6" width="96" x="276" y="112" />

        <path d="M436 64v180" />
        <path d="M426 64h20M426 244h20" />
        <path d="m428 74 8-10 8 10M428 234l8 10 8-10" />

        {/* The timeline: four keyframes and the playhead between them. */}
        <path d="M84 284h320" opacity=".6" />
        <path d="M236 264v40" />
        <path
          d="m116 277 7 7-7 7-7-7zM200 277l7 7-7 7-7-7zM284 277l7 7-7 7-7-7zM368 277l7 7-7 7-7-7z"
          fill="currentColor"
        />
      </g>

      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        x="244"
        y="24"
      >
        1920
      </text>
      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        transform="rotate(90 470 154)"
        x="470"
        y="154"
      >
        1080
      </text>
    </Figure>
  )
}

/**
 * The system: a specimen on its own guides, and the corner radius every
 * surface in the product is cut to. 10px is `--radius` in globals.css.
 */
export function SystemFigure({ className }: FigureProps) {
  return (
    <Figure className={className}>
      <g {...LINE}>
        {/* Cap, x-height, baseline, descender — the four lines the type sits
            on, run to both edges. */}
        <path
          d="M0 142h520M0 168h520M0 232h520M0 260h520"
          opacity=".6"
          strokeDasharray="4 8"
        />

        {/* x-height, measured. */}
        <path d="M296 168v64" />
        <path d="M286 168h20M286 232h20" />

        {/* The radius token, drawn as the corner it cuts. */}
        <path d="M356 232v-40a20 20 0 0 1 20-20h40" />
        <path d="M356 172h20M416 172v20" opacity=".6" strokeDasharray="4 8" />
      </g>

      <text
        className="fill-current text-9xl font-semibold"
        x="88"
        y="232"
      >
        Aa
      </text>

      <text className="text-xs" fill="currentColor" x="16" y="136">
        cap
      </text>
      <text className="text-xs" fill="currentColor" x="16" y="226">
        baseline
      </text>
      <text
        className="text-xs"
        fill="currentColor"
        textAnchor="middle"
        transform="rotate(90 322 200)"
        x="322"
        y="200"
      >
        x-height
      </text>
      <text className="text-xs" fill="currentColor" x="428" y="166">
        10px
      </text>
    </Figure>
  )
}
