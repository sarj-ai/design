import { createClassVisitor } from "../lib/classes.mjs"

/**
 * No scrollbar, anywhere — and so nothing to style.
 *
 * globals.css hides every bar: the page's, every `overflow-auto` panel's and
 * the ScrollArea primitive's. Everything still scrolls. A `scrollbar-*` class
 * or a `::-webkit-scrollbar` variant in a component either restyles a bar
 * nobody can see or re-hides one that is already hidden.
 */

const SCROLLBAR_STYLE = new Set([
  "scrollbarWidth",
  "scrollbarColor",
  "scrollbarGutter",
])

const noScrollbarStyle = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Scrollbars are hidden globally — never style or hide one in a component.",
    },
    schema: [],
    messages: {
      scrollbar:
        "`{{cls}}` styles a scrollbar. globals.css already hides every bar in the workspace (and everything still scrolls), so there is nothing to style — delete it.",
      style:
        "`{{key}}` in a style prop. globals.css already hides every scrollbar; delete it.",
    },
  },

  create(context) {
    const classes = createClassVisitor(({ node, classes }) => {
      for (const { raw, base, variants } of classes) {
        if (
          /^scrollbar(-|$)/.test(base) ||
          variants.some((v) => v.includes("scrollbar"))
        ) {
          context.report({ node, messageId: "scrollbar", data: { cls: raw } })
        }
      }
    })

    return {
      ...classes,
      JSXAttribute(node) {
        classes.JSXAttribute(node)
        if (node.name?.name !== "style") return
        const expr = node.value?.expression
        if (expr?.type !== "ObjectExpression") return
        for (const prop of expr.properties) {
          const key = prop.key?.name ?? prop.key?.value
          if (SCROLLBAR_STYLE.has(key)) {
            context.report({ node: prop, messageId: "style", data: { key } })
          }
        }
      },
    }
  },
}

export default noScrollbarStyle
