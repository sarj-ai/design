import {
  attrString,
  getAttr,
  jsxDescendants,
  jsxName,
  textOf,
  trackUiImports,
} from "../lib/jsx.mjs"

/**
 * Cancel, then the verb.
 *
 * Every surface ends the same way: at the trailing edge, Cancel as outline,
 * then one primary whose label names the result — Create persona, Save,
 * Delete webhook. Never Done, OK, Yes, Submit or Got it: those say the
 * dialog is over, not what just happened.
 *
 * Checked here:
 *  - the five dead labels, on any Button or AlertDialog action, anywhere;
 *  - in a Dialog/Sheet/Drawer/AlertDialog/Card footer: Cancel comes first and
 *    is outline, there is one filled button at most, and the two are not
 *    joined in a ButtonGroup — that is for the parts of one control.
 */

const DEAD_LABELS = new Set(["done", "ok", "okay", "yes", "submit", "got it"])
const ACTIONS = new Set(["Button", "AlertDialogAction", "AlertDialogCancel"])
const FOOTERS = new Set([
  "DialogFooter",
  "SheetFooter",
  "DrawerFooter",
  "AlertDialogFooter",
  "CardFooter",
])

const footerActions = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Footers are Cancel (outline) then one verb that names the result — never Done, OK, Yes, Submit or Got it.",
    },
    schema: [],
    messages: {
      deadLabel:
        '"{{label}}" says the surface is over, not what happened. Name the result: "Create persona", "Save", "Delete webhook".',
      cancelLast:
        "Cancel comes first, then the verb — at the trailing edge, the primary is last.",
      cancelVariant:
        'Cancel is `variant="outline"` — the outline secondary standing beside the one primary.',
      twoPrimaries:
        "Two filled buttons in one footer. One primary per surface; everything beside it is outline.",
      buttonGroup:
        "A footer's Cancel and verb are two decisions, not one control. ButtonGroup joins the parts of one control (a pagination cursor, a chip and its ×); lay the footer out with `gap-2`.",
    },
  },

  create(context) {
    const imports = trackUiImports()
    const labelOf = (element) => {
      const { text, dynamic } = textOf(element)
      return dynamic ? null : text
    }

    return {
      ...imports.visitor,
      JSXElement(element) {
        const opening = element.openingElement
        const name = imports.ui(jsxName(opening))

        if (ACTIONS.has(name)) {
          const label = labelOf(element)
          const key = label?.toLowerCase().replace(/[.!]+$/, "")
          if (key && DEAD_LABELS.has(key)) {
            context.report({
              node: opening,
              messageId: "deadLabel",
              data: { label },
            })
          }
          return
        }

        if (!FOOTERS.has(name)) return

        const buttons = []
        for (const child of jsxDescendants(element)) {
          const childName = imports.ui(jsxName(child.openingElement))
          if (childName === "ButtonGroup") {
            context.report({
              node: child.openingElement,
              messageId: "buttonGroup",
            })
          }
          if (ACTIONS.has(childName))
            buttons.push({ element: child, name: childName })
        }

        const isCancel = ({ element: el, name: n }) =>
          n === "AlertDialogCancel" || labelOf(el)?.toLowerCase() === "cancel"
        const variantOf = ({ element: el, name: n }) =>
          attrString(getAttr(el.openingElement, "variant")) ??
          (getAttr(el.openingElement, "variant")
            ? "?"
            : n === "AlertDialogCancel"
              ? "outline"
              : "default")

        const cancelIndex = buttons.findIndex(isCancel)
        if (cancelIndex !== -1) {
          const cancel = buttons[cancelIndex]
          if (cancelIndex !== 0) {
            context.report({
              node: cancel.element.openingElement,
              messageId: "cancelLast",
            })
          }
          const variant = variantOf(cancel)
          if (variant !== "outline" && variant !== "?") {
            context.report({
              node: cancel.element.openingElement,
              messageId: "cancelVariant",
            })
          }
        }

        const filled = buttons.filter((b) => variantOf(b) === "default")
        if (filled.length > 1) {
          context.report({
            node: filled[1].element.openingElement,
            messageId: "twoPrimaries",
          })
        }
      },
    }
  },
}

export default footerActions
