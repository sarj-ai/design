"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

/**
 * Wraps a HugeIcons glyph into the call shape the rest of the repo uses —
 * `<CloseIcon />` — so the shadcn primitives keep sizing it through their own
 * `[&_svg]:size-4` rules and nothing needs a size prop.
 *
 * Every mockup keeps its icons in its own `icons.tsx` built from this. Import
 * the glyph once, name it for what it does in that screen, and the screen reads
 * in verbs rather than in icon-set trivia.
 */
export function icon(glyph: IconSvgElement, displayName: string) {
  const Icon = (
    props: Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon">,
  ) => <HugeiconsIcon icon={glyph} strokeWidth={1.8} {...props} />
  Icon.displayName = displayName
  return Icon
}
