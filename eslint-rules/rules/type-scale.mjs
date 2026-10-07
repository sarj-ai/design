import { createClassVisitor } from "../lib/classes.mjs"

/**
 * One typeface, three weights.
 *
 * Two faces, both tokens: Nunito (`font-sans`, set globally, so usually
 * written only to step back out of a mono block) and Geist Mono
 * (`font-mono`, for code, IDs and JSON). A serif or an arbitrary family is a
 * third face, and `fontFamily` in a style prop is one out of lint's sight.
 *
 * The type scale uses three weights: `font-semibold` for page and section
 * titles, `font-medium` for card/dialog/drawer titles and labels,
 * `font-normal` for body. Bold, black, light and thin are not on it.
 */

const FAMILY = /^font-(serif|\[.*\])$/
const WEIGHT = /^font-(thin|extralight|light|bold|extrabold|black)$/

const typeScale = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Two typefaces (Nunito, Geist Mono) and three weights — no serif, no arbitrary family, no bold/black/light/thin.",
    },
    schema: [],
    messages: {
      family:
        "`{{cls}}` is a third typeface. The system has two: Nunito (global — write nothing, or `font-sans` to leave a mono block) and `font-mono` for code and IDs.",
      weight:
        "`{{cls}}` is off the type scale. Three weights: `font-semibold` (page and section titles), `font-medium` (card, dialog and drawer titles, labels), `font-normal` (body).",
      style:
        "`fontFamily` in a style prop. Nunito is set globally; `font-mono` is the one other face.",
    },
  },

  create(context) {
    const classes = createClassVisitor(({ node, classes }) => {
      for (const { raw, base } of classes) {
        if (FAMILY.test(base)) {
          context.report({ node, messageId: "family", data: { cls: raw } })
        } else if (WEIGHT.test(base)) {
          context.report({ node, messageId: "weight", data: { cls: raw } })
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
          if ((prop.key?.name ?? prop.key?.value) === "fontFamily") {
            context.report({ node: prop, messageId: "style" })
          }
        }
      },
    }
  },
}

export default typeScale
