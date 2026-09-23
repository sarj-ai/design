import type { FigureProps } from "@/components/shared/figure"

import { CustomComponentsFigure } from "./custom-components"
import { FoundationsFigure } from "./foundations"
import { MotionFigure } from "./motion"
import { PatternsFigure } from "./patterns"
import { ShadcnComponentsFigure } from "./components"

/** The drawing each section card carries, by section id. */
export const SECTION_FIGURES: Record<string, (props: FigureProps) => React.ReactNode> = {
  foundations: FoundationsFigure,
  motion: MotionFigure,
  patterns: PatternsFigure,
  "custom-components": CustomComponentsFigure,
  components: ShadcnComponentsFigure,
}
