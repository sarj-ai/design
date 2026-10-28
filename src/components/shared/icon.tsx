"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

/** No size of its own, so primitives size it through their `[&_svg]:size-4` rules. */
export function icon(glyph: IconSvgElement, displayName: string) {
  const Icon = (
    props: Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon">,
  ) => <HugeiconsIcon icon={glyph} strokeWidth={1.8} {...props} />
  Icon.displayName = displayName
  return Icon
}
