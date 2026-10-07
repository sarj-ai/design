import {
  attrString,
  getAttr,
  hasSpread,
  jsxName,
  textOf,
  trackUiImports,
} from "../lib/jsx.mjs"

/**
 * An icon-only button has no name unless you give it one.
 *
 * `<Button size="icon-sm"><CloseIcon /></Button>` reads to a screen reader as
 * "button" and nothing else, because the glyph is the only thing in it. The
 * design system's accessibility foundation says every control is named, and
 * the table rules say it again for row actions: every glyph carries an
 * aria-label, because the glyph is the only name it has.
 *
 * A tooltip is not a name — Radix wires it up as a description. A visible
 * label or a `sr-only` span inside the button is.
 */

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
