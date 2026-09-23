import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

import { TOPIC_FIGURE_VIEWBOX } from "./frame"

/**
 * FileCard: a sheet with its corner turned, a few lines of text, and the
 * badge that names what kind of source it is.
 */
function FileCardFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d="M0 196h240" opacity=".6" strokeDasharray="4 8" />
        <path d="M94 76h52l26 26v94H94z" />
        <path d="M146 76v26h26" opacity=".7" />
        <path d="M108 124h50M108 138h50M108 152h32" opacity=".5" />
        <rect height="24" rx="6" width="48" x="76" y="164" />
      </g>
    </Figure>
  )
}

/**
 * DotPattern: a field of dots running off the sheet, stopping at the panel
 * it sits behind — never over it.
 */
function DotPatternFigure({ className }: FigureProps) {
  const dots: string[] = []
  for (let x = 8; x < 240; x += 16) {
    for (let y = 8; y < 240; y += 16) {
      if (x < 64 && y < 48) continue
      if (x > 72 && x < 188 && y > 84 && y < 188) continue
      dots.push(`M${x} ${y}h.01`)
    }
  }
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d={dots.join("")} opacity=".5" strokeWidth="4" />
        <rect height="88" rx="8" width="100" x="80" y="92" />
      </g>
    </Figure>
  )
}

/** Topic id → its tile's drawing. */
export const CUSTOM_COMPONENTS_FIGURES: Record<
  string,
  (props: FigureProps) => React.ReactNode
> = {
  "file-card": FileCardFigure,
  "dot-pattern": DotPatternFigure,
}
