import { jsxDescendants, jsxName, trackUiImports } from "../lib/jsx.mjs"

const BUTTONS = new Set(["Button"])

const emptyState = {
  meta: {
    type: "problem",
    docs: {
      description: "An Empty has a title and at most one action.",
    },
    schema: [],
    messages: {
      twoActions:
        "Two actions in one empty state. Keep the one that changes it — create the first row, clear the filter, or try again. Everything else is reachable from the page once there is something on it.",
      noTitle:
        "`<Empty>` without an `<EmptyTitle>`. The title is the state: “No API keys yet”, No calls match “refund”, “Could not load calls”.",
    },
  },

  create(context) {
    const imports = trackUiImports()

    return {
      ...imports.visitor,
      JSXElement(element) {
        const name = imports.ui(jsxName(element.openingElement))

        if (name === "Empty") {
          const hasTitle = [...jsxDescendants(element)].some(
            (child) =>
              imports.ui(jsxName(child.openingElement)) === "EmptyTitle",
          )
          if (!hasTitle) {
            context.report({
              node: element.openingElement,
              messageId: "noTitle",
            })
          }
          return
        }

        if (name !== "EmptyContent") return
        const buttons = [...jsxDescendants(element)].filter((child) =>
          BUTTONS.has(imports.ui(jsxName(child.openingElement))),
        )
        if (buttons.length > 1) {
          context.report({
            node: buttons[1].openingElement,
            messageId: "twoActions",
          })
        }
      },
    }
  },
}

export default emptyState
