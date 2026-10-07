import { jsxAncestors, jsxName, trackUiImports } from "../lib/jsx.mjs"

/**
 * One overlay at a time.
 *
 * A confirm may sit on anything, and a popover, menu or select may open inside
 * anything. Nothing else stacks: a drawer that needs a new thing goes one level
 * deeper inside itself, with Back, and returns with it selected. A dialog on a
 * drawer on a page is three things to close, in an order the reader has to
 * remember.
 *
 * This sees nesting written in one file — a Dialog in a SheetContent's JSX. A
 * component that renders its own Dialog and is dropped into a drawer from
 * another file is still the same mistake; lint just cannot see across files.
 */

const STACKING = new Set(["Dialog", "Sheet", "Drawer"])
const CONTENT = new Set([
  "DialogContent",
  "SheetContent",
  "DrawerContent",
  "AlertDialogContent",
])

const oneOverlay = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Only a confirm (AlertDialog) or a popover may open on top of another overlay.",
    },
    schema: [],
    messages: {
      stacked:
        "`<{{inner}}>` opens on top of `<{{outer}}>`. One overlay at a time — only a confirm (AlertDialog) or a popover may stack. A drawer that needs a new thing goes one level deeper inside itself, with Back.",
    },
  },

  create(context) {
    const imports = trackUiImports()

    return {
      ...imports.visitor,
      JSXElement(element) {
        const inner = imports.ui(jsxName(element.openingElement))
        if (!STACKING.has(inner)) return

        for (const ancestor of jsxAncestors(element)) {
          const outer = imports.ui(jsxName(ancestor.openingElement))
          if (CONTENT.has(outer)) {
            context.report({
              node: element.openingElement,
              messageId: "stacked",
              data: { inner, outer },
            })
            return
          }
        }
      },
    }
  },
}

export default oneOverlay
