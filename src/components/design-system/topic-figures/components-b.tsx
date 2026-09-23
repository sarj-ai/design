import { Figure, LINE, type FigureProps } from "@/components/shared/figure"

import { TOPIC_FIGURE_VIEWBOX } from "./frame"

/**
 * The second half of the shadcn inventory's topic tiles. Every subject sits
 * in the same box — about x 52–188, y 84–196 — below and right of the tile's
 * number, so the set reads at one scale.
 */

/** Data: a series standing on its baseline, over the rows it came from. */
function DataFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d="M0 132h240" opacity=".6" strokeDasharray="4 8" />
        <path d="M68 132v-24M92 132v-40M116 132v-32M140 132v-48M164 132v-20" />
        <g opacity=".6">
          <rect height="48" rx="8" width="136" x="52" y="148" />
          <path d="M52 172h136M64 160h48M64 184h64" />
        </g>
      </g>
    </Figure>
  )
}

/** Overlays: a dialog standing over a dimmed page. */
function OverlaysFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <g opacity=".5">
          <rect height="120" rx="10" width="152" x="44" y="76" />
          <path d="M56 92h40M56 184h72" />
        </g>
        <rect height="68" rx="8" width="96" x="72" y="104" />
        <path d="M84 120h48M84 134h64" opacity=".7" />
        <rect height="14" rx="4" width="28" x="128" y="148" />
      </g>
    </Figure>
  )
}

/** Navigation: a breadcrumb trail over a tab row, the current tab marked. */
function NavigationFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <g opacity=".6">
          <path d="M56 112h28M108 112h28M160 112h24" />
          <path d="m93 106 6 6-6 6M145 106l6 6-6 6" />
        </g>
        <path d="M0 164h240" opacity=".6" strokeDasharray="4 8" />
        <path d="M60 148h32M148 148h32" opacity=".6" />
        <path d="M104 148h32" />
        <path d="M100 164h40" strokeWidth="4" />
      </g>
    </Figure>
  )
}

/** Feedback: a toast over the one before it, its time running out. */
function FeedbackFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d="M64 112v-4a8 8 0 0 1 8-8h96a8 8 0 0 1 8 8v4" opacity=".5" />
        <rect height="64" rx="10" width="136" x="52" y="112" />
        <circle cx="76" cy="136" r="10" />
        <path d="m71 136 4 4 7-8" />
        <path d="M96 132h64M96 144h40" opacity=".7" />
        <path d="M62 164h80" />
        <path d="M142 164h36" opacity=".5" />
      </g>
    </Figure>
  )
}

/** Conversation: two turns of a transcript, the reply a voice note. */
function ConversationFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d="M66 88h76a12 12 0 0 1 12 12v16a12 12 0 0 1-12 12H66l-14 8v-36a12 12 0 0 1 14-12Z" />
        <path d="M68 102h64M68 114h40" opacity=".7" />
        <g opacity=".7">
          <path d="M174 148h-76a12 12 0 0 0-12 12v16a12 12 0 0 0 12 12h76l14 8v-36a12 12 0 0 0-14-12Z" />
          <path d="M104 164v8M114 158v20M124 162v12M134 156v24M144 164v8M154 160v16M164 165v6" />
        </g>
      </g>
    </Figure>
  )
}

/** Effects: a sparkle and its echo, over the line they decorate. */
function EffectsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <g {...LINE}>
        <path d="M0 184h240" opacity=".6" strokeDasharray="4 8" />
        <path d="M108 92q4 36 40 40-36 4-40 40-4-36-40-40 36-4 40-40Z" />
        <path
          d="M164 84q2 16 18 18-16 2-18 18-2-16-18-18 16-2 18-18Z"
          opacity=".6"
        />
        <circle cx="168" cy="160" fill="currentColor" opacity=".6" r="3" />
      </g>
    </Figure>
  )
}

/** Topic id → its tile's drawing. */
export const COMPONENTS_B_FIGURES: Record<
  string,
  (props: FigureProps) => React.ReactNode
> = {
  data: DataFigure,
  overlays: OverlaysFigure,
  navigation: NavigationFigure,
  feedback: FeedbackFigure,
  conversation: ConversationFigure,
  effects: EffectsFigure,
}
