import {
  ArrowDown02Icon,
  ArrowUp02Icon,
  CornerDownLeftIcon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"

/** SVG, not ↑ ↓ ↵: those fall back to another font in Nunito and sit off-centre in a keycap. */
export const MoveUpKeyIcon = icon(ArrowUp02Icon, "MoveUpKeyIcon")
export const MoveDownKeyIcon = icon(ArrowDown02Icon, "MoveDownKeyIcon")
export const InsertKeyIcon = icon(CornerDownLeftIcon, "InsertKeyIcon")
