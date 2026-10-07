import {
  classesOf,
  jsxAncestors,
  jsxName,
  trackUiImports,
} from "../lib/jsx.mjs"

/**
 * A dialog is a short task on one screen.
 *
 * Up to four fields, or an action that needs a few answers before it runs.
 * Anything that scrolls, grows rows, or has tabs or steps is a drawer or a
 * page — and a dialog whose body needs to scroll was a drawer. So inside a
 * DialogContent: no Tabs, no Stepper, no ScrollArea, and no overflow scroll.
 *
 * AlertDialogContent is held to the same, and harder: a confirm is a sentence
 * and two buttons.
 */

const BANNED_INSIDE = {
  Tabs: "Tabs in a dialog are several screens pretending to be one. Several views of one object is a page with tabs; settings that grow are a drawer.",
  Stepper:
    "Steps in a dialog are the creation flow squeezed into 448px. Creating in steps is a page: one question a screen, full screen.",
  ScrollArea:
    "A dialog whose body needs to scroll was a drawer — 448px from the right, full height, only the body scrolls.",
}

const SCROLL = /^overflow(-y)?-(auto|scroll)$/
const DIALOGS = new Set(["DialogContent", "AlertDialogContent"])

const dialogShape = {
  meta: {
    type: "problem",
    docs: {
      description:
        "A dialog never scrolls and never has tabs or steps — that is a drawer or a page.",
    },
    schema: [],
    messages: {
      banned: "`<{{name}}>` inside `<{{dialog}}>`. {{why}}",
      scrolls:
        "`{{cls}}` makes the dialog scroll. A dialog is never taller than its content — one that needs to scroll was a drawer (SheetContent, `sm:max-w-md`), where only the body scrolls.",
    },
  },

  create(context) {
    const imports = trackUiImports()

    const enclosingDialog = (element, includeSelf) => {
      if (includeSelf) {
        const self = imports.ui(jsxName(element.openingElement))
        if (DIALOGS.has(self)) return self
      }
      for (const ancestor of jsxAncestors(element)) {
        const name = imports.ui(jsxName(ancestor.openingElement))
        if (DIALOGS.has(name)) return name
        /* A drawer or popover opened from the dialog is its own surface. */
        if (name === "SheetContent" || name === "PopoverContent") return null
      }
      return null
    }

    return {
      ...imports.visitor,
      JSXElement(element) {
        const opening = element.openingElement
        const name = imports.ui(jsxName(opening))

        const why = BANNED_INSIDE[name]
        if (why) {
          const dialog = enclosingDialog(element, false)
          if (dialog) {
            context.report({
              node: opening,
              messageId: "banned",
              data: { name, dialog, why },
            })
          }
        }

        const scroll = classesOf(opening).find(
          ({ base, variants }) => SCROLL.test(base) && variants.length === 0,
        )
        if (scroll && enclosingDialog(element, true)) {
          context.report({
            node: scroll.node,
            messageId: "scrolls",
            data: { cls: scroll.raw },
          })
        }
      },
    }
  },
}

export default dialogShape
