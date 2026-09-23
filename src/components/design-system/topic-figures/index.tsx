import type { FigureProps } from "@/components/shared/figure"

import { COMPONENTS_A_FIGURES } from "./components-a"
import { COMPONENTS_B_FIGURES } from "./components-b"
import { CUSTOM_COMPONENTS_FIGURES } from "./custom-components"
import { FOUNDATIONS_FIGURES } from "./foundations"
import { MOTION_FIGURES } from "./motion"
import { PATTERNS_A_FIGURES } from "./patterns-a"
import { PATTERNS_B_FIGURES } from "./patterns-b"

/** The drawing on each topic's tile, by topic id. A topic with none shows a
    bare tile. */
export const TOPIC_FIGURES: Record<
  string,
  (props: FigureProps) => React.ReactNode
> = {
  ...FOUNDATIONS_FIGURES,
  ...MOTION_FIGURES,
  ...PATTERNS_A_FIGURES,
  ...PATTERNS_B_FIGURES,
  ...CUSTOM_COMPONENTS_FIGURES,
  ...COMPONENTS_A_FIGURES,
  ...COMPONENTS_B_FIGURES,
}
