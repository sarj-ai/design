import {
  attrString,
  getAttr,
  hasSpread,
  jsxName,
  textOf,
  trackUiImports,
} from "../lib/jsx.mjs"

// A tooltip is not a name (Radix wires it as a description); a visible label or `sr-only` span is.

const ICON_SIZE = /^icon(-|$)/

const iconButtonLabel = {
  meta: {
    type: "problem",
    docs: {
      description:
        "An icon-only Button needs an aria-label — the glyph is the only name it has.",
    },
    schema: [],
    messages: {
      unnamed:
        '`<Button size="{{size}}">` has no name. Add `aria-label="…"` naming what it does ("Close", "Delete webhook"), or a visible label. A tooltip does not count — it is a description, not a name.',
    },
  },

  create(context) {
    const imports = trackUiImports()

    return {
      ...imports.visitor,
      JSXElement(element) {
        const opening = element.openingElement
        if (imports.ui(jsxName(opening)) !== "Button") return

        const size = attrString(getAttr(opening, "size"))
        if (!size || !ICON_SIZE.test(size)) return
        if (hasSpread(opening)) return
        if (
          getAttr(opening, "aria-label") ||
          getAttr(opening, "aria-labelledby") ||
          getAttr(opening, "title")
        ) {
          return
        }

        const { text, dynamic } = textOf(element)
        if (text || dynamic) return

        context.report({ node: opening, messageId: "unnamed", data: { size } })
      },
    }
  },
}

export default iconButtonLabel
