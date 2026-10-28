import { jsxAncestors, jsxName, trackUiImports } from "../lib/jsx.mjs"

// Sees nesting written in one file only; a component that renders its own Dialog from another file is missed.

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
