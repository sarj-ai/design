import { Figure, type FigureProps, LINE } from "@/components/shared/figure"

import { TOPIC_FIGURE_VIEWBOX } from "./frame"

/*
 * Every subject sits in the same box — x 48–192, y 84–196 — so the grid
 * reads as one set: same scale, same margins, same weight.
 */

/* A primary and an outline button on one shared baseline. */
function ButtonsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <path {...LINE} d="M0 156H240" opacity={0.5} strokeDasharray="4 8" />
      <rect {...LINE} height={32} rx={10} width={68} x={52} y={124} />
      <rect
        fill="currentColor"
        height={32}
        opacity={0.12}
        rx={10}
        width={68}
        x={52}
        y={124}
      />
      <path {...LINE} d="M72 140H100" />
      <rect
        {...LINE}
        height={32}
        opacity={0.6}
        rx={10}
        width={68}
        x={128}
        y={124}
      />
      <path {...LINE} d="M148 140H176" opacity={0.6} />
    </Figure>
  )
}

/* Two label-over-field stacks and the button that saves them. */
function FormsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <path {...LINE} d="M56 88H92" opacity={0.6} />
      <rect {...LINE} height={26} rx={8} width={128} x={56} y={98} />
      <path {...LINE} d="M56 140H104" opacity={0.6} />
      <rect {...LINE} height={26} rx={8} width={128} x={56} y={150} />
      <rect
        {...LINE}
        height={20}
        opacity={0.6}
        rx={7}
        width={44}
        x={140}
        y={188}
      />
    </Figure>
  )
}

/* The same page three ways: a pop-up, a drawer, a row opened inline. */
function SurfacesFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <rect
        {...LINE}
        height={64}
        opacity={0.6}
        rx={6}
        width={40}
        x={48}
        y={108}
      />
      <rect {...LINE} height={24} rx={4} width={24} x={56} y={128} />
      <rect
        {...LINE}
        height={64}
        opacity={0.6}
        rx={6}
        width={40}
        x={100}
        y={108}
      />
      <path {...LINE} d="M122 108V172" />
      <rect
        {...LINE}
        height={64}
        opacity={0.6}
        rx={6}
        width={40}
        x={152}
        y={108}
      />
      <path {...LINE} d="M152 128H192M152 152H192" />
    </Figure>
  )
}

/* Three steps joined by a line, and the one screen they fill. */
function MultiStepCreateFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <path {...LINE} d="M76 96H164" opacity={0.6} />
      <circle cx={76} cy={96} fill="currentColor" r={6} />
      <circle {...LINE} cx={120} cy={96} r={6} />
      <circle {...LINE} cx={164} cy={96} opacity={0.6} r={6} />
      <rect {...LINE} height={72} rx={10} width={144} x={48} y={124} />
      <path {...LINE} d="M64 146H124M64 166H148" opacity={0.6} />
    </Figure>
  )
}

/* A tab strip with the first view underlined, over the panel it shows. */
function TabsFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <path {...LINE} d="M0 112H240" opacity={0.5} strokeDasharray="4 8" />
      <path {...LINE} d="M56 98H84" />
      <path {...LINE} d="M104 98H128M148 98H176" opacity={0.6} />
      <path {...LINE} d="M52 112H88" strokeWidth={4} />
      <rect
        {...LINE}
        height={64}
        opacity={0.6}
        rx={10}
        width={144}
        x={48}
        y={128}
      />
    </Figure>
  )
}

/* The page stays in view behind a panel on its trailing edge. */
function DrawerFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <rect
        {...LINE}
        height={112}
        opacity={0.5}
        rx={10}
        width={144}
        x={48}
        y={84}
      />
      <path {...LINE} d="M64 106H108M64 126H100" opacity={0.5} />
      <path
        {...LINE}
        d="M136 84H182A10 10 0 0 1 192 94V186A10 10 0 0 1 182 196H136Z"
      />
      <path {...LINE} d="M148 104H176M148 124H180M148 144H168" opacity={0.6} />
    </Figure>
  )
}

/* Vertical steps, each on a line of its own. */
function StepperFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <path {...LINE} d="M76 98V182" opacity={0.6} />
      <circle cx={76} cy={92} fill="currentColor" r={6} />
      <circle {...LINE} cx={76} cy={140} fill="var(--card)" r={6} />
      <circle
        {...LINE}
        cx={76}
        cy={188}
        fill="var(--card)"
        opacity={0.6}
        r={6}
      />
      <path {...LINE} d="M96 92H160M96 140H176" />
      <path {...LINE} d="M96 188H148" opacity={0.6} />
    </Figure>
  )
}

/* Three cards; the picked one gets a second edge and nothing else. */
function SelectionFigure({ className }: FigureProps) {
  return (
    <Figure className={className} viewBox={TOPIC_FIGURE_VIEWBOX}>
      <rect
        {...LINE}
        height={72}
        opacity={0.6}
        rx={8}
        width={40}
        x={48}
        y={104}
      />
      <rect {...LINE} height={72} rx={8} width={40} x={100} y={104} />
      <rect {...LINE} height={80} rx={12} width={48} x={96} y={100} />
      <rect
        {...LINE}
        height={72}
        opacity={0.6}
        rx={8}
        width={40}
        x={152}
        y={104}
      />
    </Figure>
  )
}

/** Topic id → its tile's drawing. */
export const PATTERNS_A_FIGURES: Record<
  string,
  (props: FigureProps) => React.ReactNode
> = {
  buttons: ButtonsFigure,
  forms: FormsFigure,
  surfaces: SurfacesFigure,
  "multi-step-create": MultiStepCreateFigure,
  tabs: TabsFigure,
  drawer: DrawerFigure,
  stepper: StepperFigure,
  selection: SelectionFigure,
}
