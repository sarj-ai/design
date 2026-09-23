import { Figure, type FigureProps, LINE } from "@/components/shared/figure"

import { TOPIC_FIGURE_VIEWBOX } from "./frame"

/* Every tile draws inside the same box — x 50 to 190, y 78 to 190 — so the
   Patterns grid reads as one set. */

/* A page title with its one action, over a stack of object rows. */
function IndexPageFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <path {...LINE} d="M50 88h52" />
      <rect {...LINE} height="18" rx="4" width="38" x="152" y="79" />
      {[106, 134, 162].map((y) => (
        <g key={y}>
          <rect {...LINE} height="24" rx="5" width="140" x="50" y={y} />
          <circle {...LINE} cx="64" cy={y + 12} opacity=".6" r="5" />
          <path {...LINE} d={`M76 ${y + 12}h60`} opacity=".6" />
        </g>
      ))}
    </Figure>
  )
}

/* One container, one header band, one row height. */
function TablesFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <rect {...LINE} height="112" rx="6" width="140" x="50" y="78" />
      <path {...LINE} d="M50 100h140" />
      <path {...LINE} d="M50 122h140M50 144h140M50 166h140" opacity=".5" />
      <path {...LINE} d="M98 78v112M146 78v112" opacity=".5" />
    </Figure>
  )
}

/* Page size on the left, prev and next on the right, under the rows. */
function PaginationFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <path
        {...LINE}
        d="M50 82h140M50 104h140M50 126h140M50 148h140"
        opacity=".5"
      />
      <rect {...LINE} height="20" rx="4" width="40" x="50" y="168" />
      <path {...LINE} d="M76 176l4 4 4-4" opacity=".6" />
      <rect {...LINE} height="20" rx="4" width="20" x="146" y="168" />
      <path {...LINE} d="M158 173l-5 5 5 5" />
      <rect {...LINE} height="20" rx="4" width="20" x="170" y="168" />
      <path {...LINE} d="M178 173l5 5-5 5" />
    </Figure>
  )
}

/* Skeleton rows in the shape of what is coming. */
function LoadingFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      {[84, 112, 140, 168].map((y) => (
        <g key={y}>
          <circle {...LINE} cx="58" cy={y + 6} opacity=".6" r="8" />
          <rect {...LINE} height="12" rx="6" width="76" x="76" y={y} />
          <rect
            {...LINE}
            height="12"
            rx="6"
            width="28"
            x="162"
            y={y}
            opacity=".5"
          />
        </g>
      ))}
    </Figure>
  )
}

/* An empty frame and the one action that fills it. */
function EmptyStateFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <rect
        {...LINE}
        height="112"
        rx="8"
        strokeDasharray="4 8"
        width="140"
        x="50"
        y="78"
      />
      <path {...LINE} d="M98 122h44" opacity=".6" />
      <rect {...LINE} height="22" rx="5" width="48" x="96" y="138" />
      <path {...LINE} d="M120 144v10M115 149h10" />
    </Figure>
  )
}

/* A filter chip over a result with no rows under its header. */
function NoResultsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <rect {...LINE} height="20" rx="10" width="64" x="50" y="78" />
      <path {...LINE} d="M62 88h28" opacity=".6" />
      <path {...LINE} d="M99 85l6 6M105 85l-6 6" />
      <rect {...LINE} height="80" rx="6" width="140" x="50" y="110" />
      <path {...LINE} d="M50 130h140" opacity=".6" />
    </Figure>
  )
}

/* A warning mark, and the retry under it. */
function ErrorStateFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <path {...LINE} d="M120 82l36 62H84z" />
      <path {...LINE} d="M120 104v18M120 132v1" />
      <path {...LINE} d="M134 176a14 14 0 1 1-14-14" opacity=".6" />
      <path {...LINE} d="M114 156l6 6-6 6" opacity=".6" />
    </Figure>
  )
}

/** Topic id → its tile's drawing. */
export const PATTERNS_B_FIGURES: Record<
  string,
  (props: FigureProps) => React.ReactNode
> = {
  "index-page": IndexPageFigure,
  tables: TablesFigure,
  pagination: PaginationFigure,
  loading: LoadingFigure,
  "empty-state": EmptyStateFigure,
  "no-results": NoResultsFigure,
  "error-state": ErrorStateFigure,
}
