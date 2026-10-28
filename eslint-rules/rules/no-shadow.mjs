import { createClassVisitor } from "../lib/classes.mjs"

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
