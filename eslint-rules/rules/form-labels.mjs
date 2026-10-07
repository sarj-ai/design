import { classesOf, jsxName, trackUiImports } from "../lib/jsx.mjs"

/**
 * A field's label is full strength.
 *
 * Above the control, `text-sm font-medium`, at `text-foreground`. Never
 * muted: at `text-muted-foreground` it clears AA by 0.04 and can no longer be
 * told from its own description, which is the same size in the same grey.
 * The same goes for a group's legend.
 *
 * The one muted thing a label may hold is the "(optional)" marker, in a span
 * of its own — that span is not the label, so it is not checked.
 */

const LABELS = new Set(["FieldLabel", "Label", "FieldLegend", "FieldTitle"])
const MUTED = /^text-muted-foreground(\/\d+)?$/

const formLabels = {
  meta: {
    type: "problem",
    docs: {
      description: "Field labels and legends are never muted.",
    },
    schema: [],
    messages: {
      muted:
        "`{{cls}}` on `<{{name}}>`. A label is full-strength `text-foreground` — muted, it is the same grey as its own description and fails AA. Say less important with the description, not the label. The “(optional)” marker goes in its own muted span inside the label.",
    },
  },

  create(context) {
    const imports = trackUiImports()

    return {
      ...imports.visitor,
      JSXOpeningElement(opening) {
        const name = imports.ui(jsxName(opening))
        if (!LABELS.has(name)) return
        for (const { raw, base, variants, node } of classesOf(opening)) {
          if (MUTED.test(base) && variants.length === 0) {
            context.report({
              node,
              messageId: "muted",
              data: { cls: raw, name },
            })
          }
        }
      },
    }
  },
}

export default formLabels
