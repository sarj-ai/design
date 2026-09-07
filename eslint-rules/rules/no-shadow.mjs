import { createClassVisitor } from "../lib/classes.mjs"

/**
 * Sarj mockups are flat. Only the shadcn primitives cast a shadow.
 *
 * Depth in this design system comes from `ring-1 ring-foreground/10` and from
 * surface tokens (`bg-card` on `bg-background`, `bg-muted` insets) — not from a
 * drop shadow. The primitives that genuinely float (Dialog, Popover, Sheet,
 * DropdownMenu) already carry their own shadow, so hand-written ones only ever
 * add a second, mismatched elevation language.
 *
 * `shadow-none` stays legal: removing a shadow is always in the flat direction.
 */

const SHADOW = /^-?(shadow|drop-shadow|inset-shadow|text-shadow)(-.+)?$/
const REMOVERS = new Set([
  "shadow-none",
  "drop-shadow-none",
  "inset-shadow-none",
  "text-shadow-none",
])

const noShadow = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Only src/components/ui may cast a shadow — everything else is flat.",
    },
    schema: [],
    messages: {
      shadow:
        "`{{cls}}` — mockups outside src/components/ui are flat. For a raised surface use `<Card>` (it ships `ring-1 ring-foreground/10`); for an inset panel use `bg-muted rounded-lg p-4`. If it genuinely floats, it is an overlay — use Dialog, Sheet, Popover, or DropdownMenu, which bring their own elevation.",
    },
  },

  create(context) {
    return createClassVisitor(({ node, classes }) => {
      for (const { raw, base } of classes) {
        if (!SHADOW.test(base) || REMOVERS.has(base)) continue
        context.report({ node, messageId: "shadow", data: { cls: raw } })
      }
    })
  },
}

export default noShadow
