import {
  classesOf,
  getAttr,
  jsxAncestors,
  jsxName,
  trackUiImports,
} from "../lib/jsx.mjs"

/**
 * One table shape: one container, one header band, one row height.
 *
 *  - Header labels are full strength — semibold at foreground. A column name
 *    is what the reader scans by; muting it makes them hunt.
 *  - The header band is `bg-muted/50` and stays shaded on hover. Without
 *    `hover:bg-muted/50` the header lights up under the pointer and reads as a
 *    row you can click.
 *  - Sorting is a ghost Button inside the TableHead, never an onClick on the
 *    cell — a `<th>` with a click handler has no focus, no role and no key.
 *
 * `DataTable`, `DataTableHeaderRow` and `DataTableHead` in
 * src/components/shared/data-table.tsx already do all three.
 */

const MUTED = /^text-muted-foreground(\/\d+)?$/
const BAND = /^bg-muted(\/\d+)?$/

const tableShape = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Table headers are full strength, the header band stays shaded on hover, and sorting is a Button.",
    },
    schema: [],
    messages: {
      mutedHead:
        "`{{cls}}` on `<TableHead>`. Header labels are full strength — semibold at foreground. Use `DataTableHead` from @/components/shared/data-table.",
      bandHover:
        "The header band is `{{band}}` but goes blank on hover. Add `hover:{{band}}` so it never reads as a clickable row — or use `DataTableHeaderRow` from @/components/shared/data-table.",
      clickableHead:
        '`onClick` on `<TableHead>`. Sorting is a ghost Button inside the head (`variant="ghost" size="sm"` with the sort icon at `data-icon="inline-end"`) — a clickable `<th>` has no focus, no role and no key.',
    },
  },

  create(context) {
    const imports = trackUiImports()

    return {
      ...imports.visitor,
      JSXElement(element) {
        const opening = element.openingElement
        const name = imports.ui(jsxName(opening))

        if (name === "TableHead") {
          if (getAttr(opening, "onClick")) {
            context.report({ node: opening, messageId: "clickableHead" })
          }
          for (const { raw, base, variants, node } of classesOf(opening)) {
            if (MUTED.test(base) && variants.length === 0) {
              context.report({
                node,
                messageId: "mutedHead",
                data: { cls: raw },
              })
            }
          }
          return
        }

        if (name !== "TableRow") return
        const inHeader = [...jsxAncestors(element)].some(
          (a) => imports.ui(jsxName(a.openingElement)) === "TableHeader",
        )
        if (!inHeader) return

        const classes = classesOf(opening)
        const band = classes.find(
          ({ base, variants }) => BAND.test(base) && variants.length === 0,
        )
        if (!band) return
        const held = classes.some(
          ({ base, variants }) =>
            base === band.base &&
            variants.length === 1 &&
            variants[0] === "hover",
        )
        if (!held) {
          context.report({
            node: band.node,
            messageId: "bandHover",
            data: { band: band.base },
          })
        }
      },
    }
  },
}

export default tableShape
