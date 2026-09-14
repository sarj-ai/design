import {
  ArrowDown02Icon,
  ArrowUp02Icon,
  CornerDownLeftIcon,
} from "@hugeicons/core-free-icons"

import { icon } from "@/components/shared/icon"

/**
 * The keys on the picker's hint row. Glyphs rather than the Unicode arrows:
 * `↑`, `↓` and `↵` fall back to another font in Nunito and land off-centre
 * in a keycap, and an SVG sits exactly where `Kbd` puts it.
 */
export const MoveUpKeyIcon = icon(ArrowUp02Icon, "MoveUpKeyIcon")
export const MoveDownKeyIcon = icon(ArrowDown02Icon, "MoveDownKeyIcon")
export const InsertKeyIcon = icon(CornerDownLeftIcon, "InsertKeyIcon")
