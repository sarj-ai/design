import { arbitraryValue, createClassVisitor } from "../lib/classes.mjs"

/**
 * Spacing, radius, and type sizes come off the scale — never an arbitrary value.
 *
 * `gap-[13px]` and `rounded-[10px]` are the difference between a mockup that
 * reads as built and one that reads as assembled: they land half a step off
 * every neighbouring element and quietly break the 4px rhythm.
 *
 * Viewport-relative values are allowed through, because `max-h-[86vh]` has no
 * scale equivalent. So are `var(--…)` values, which are tokens by definition.
 */

const SPACING =
  "p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y|inset|inset-x|inset-y|top|right|bottom|left|start|end|w|h|size|min-w|min-h|max-w|max-h|basis|translate-x|translate-y|scroll-m|scroll-p"

const RADIUS =
  "rounded|rounded-t|rounded-r|rounded-b|rounded-l|rounded-s|rounded-e|rounded-tl|rounded-tr|rounded-br|rounded-bl|rounded-ss|rounded-se|rounded-es|rounded-ee"

const TYPE = "text|leading|tracking"

const SPACING_RE = new RegExp(`^-?(${SPACING})-\\[`)
const RADIUS_RE = new RegExp(`^-?(${RADIUS})-\\[`)
const TYPE_RE = new RegExp(`^-?(${TYPE})-\\[`)

/** Values with no equivalent on the scale — let these through. */
const ESCAPE_HATCH =
  /\b\d*\.?\d+(vh|vw|dvh|dvw|svh|svw|lvh|lvw|vmin|vmax|%)|var\(--/

/** A colour in a `text-[…]`; no-raw-color owns that message. */
const COLOR_LITERAL =
  /#[0-9a-fA-F]{3,8}\b|\b(?:oklch|oklab|rgba?|hsla?|lab|lch|color-mix)\s*\(/

const noArbitraryScale = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Spacing, radius, and type sizes must come from the scale, not an arbitrary [value].",
    },
    schema: [],
    messages: {
      spacing:
        "`{{cls}}` is off the 4px scale. Use a scale step — gap-2 (8px), gap-3 (12), gap-4 (16), gap-6 (24), gap-8 (32) — and the same padding on every card in a view.",
      radius:
        "`{{cls}}` bypasses the radius scale. Use rounded-sm | md | lg | xl | 2xl | 3xl | 4xl, all derived from --radius in globals.css.",
      type: "`{{cls}}` sets a one-off type size. Use text-xs | sm | base | lg | xl | 2xl…, never smaller than text-xs. Say 'less important' with text-muted-foreground rather than a smaller font.",
    },
  },

  create(context) {
    return createClassVisitor(({ node, classes }) => {
      for (const { raw, base } of classes) {
        const value = arbitraryValue(base)
        if (value === null || ESCAPE_HATCH.test(value)) continue

        if (SPACING_RE.test(base)) {
          context.report({ node, messageId: "spacing", data: { cls: raw } })
        } else if (RADIUS_RE.test(base)) {
          context.report({ node, messageId: "radius", data: { cls: raw } })
        } else if (TYPE_RE.test(base) && !COLOR_LITERAL.test(value)) {
          context.report({ node, messageId: "type", data: { cls: raw } })
        }
      }
    })
  },
}

export default noArbitraryScale
