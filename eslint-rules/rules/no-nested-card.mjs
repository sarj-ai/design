import { jsxAncestors, jsxName, trackUiImports } from "../lib/jsx.mjs"

/**
 * A Card never sits inside a Card.
 *
 * Two rings, two paddings, two radii, one thing — the inner edge says "this
 * is separate" about something that is not. Inside a card, separate with a
 * `bg-muted` inset, an `ItemSeparator` or a `Separator`.
 */

const noNestedCard = {
  meta: {
    type: "problem",
    docs: { description: "A Card never sits inside a Card." },
    schema: [],
    messages: {
      nested:
        "`<Card>` inside a `<Card>`: two edges around one thing. Inside a card, separate with a `bg-muted` inset, `Separator` or `ItemSeparator`.",
    },
  },

  create(context) {
    const imports = trackUiImports()

    return {
      ...imports.visitor,
      JSXElement(element) {
        if (imports.ui(jsxName(element.openingElement)) !== "Card") return
        for (const ancestor of jsxAncestors(element)) {
          if (imports.ui(jsxName(ancestor.openingElement)) === "Card") {
            context.report({
              node: element.openingElement,
              messageId: "nested",
            })
            return
          }
        }
      },
    }
  },
}

export default noNestedCard
