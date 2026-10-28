import type { FigureProps } from "@/components/shared/figure"

import { FoundationsFigure } from "./foundations"
import { MotionFigure } from "./motion"
import { PatternsFigure } from "./patterns"

export const SECTION_FIGURES: Record<
  string,
  (props: FigureProps) => React.ReactNode
> = {
  foundations: FoundationsFigure,
  motion: MotionFigure,
  patterns: PatternsFigure,
}
