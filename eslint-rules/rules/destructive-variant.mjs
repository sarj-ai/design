import {
  attrString,
  getAttr,
  jsxAncestors,
  jsxName,
  textOf,
  trackUiImports,
} from "../lib/jsx.mjs"

/**
 * Red is for destroying.
 *
 * `variant="destructive"` goes on the button that deletes, removes, revokes,
 * disconnects — and on nothing else. Transfer, retry, archive and create
 * anyway are primary or outline: red on an action that can be undone trains
 * people to stop reading red. A row's delete is ghost with
 * `text-destructive`, never the filled variant — a column of red buttons is
 * the loudest thing on the page and the least likely to be pressed.
 */

const DESTROYING = new Set([
  "delete",
  "remove",
  "revoke",
  "disconnect",
  "deactivate",
  "release",
  "discard",
  "erase",
  "purge",
  "uninstall",
  "unlink",
  "detach",
  "terminate",
  "reset",
  "clear",
  "leave",
  "end",
  "cancel",
])

const destructiveVariant = {
  meta: {
    type: "problem",
    docs: {
      description:
        'variant="destructive" only on an action that destroys, and never on a row action.',
    },
    schema: [],
    messages: {
      notDestroying:
        '"{{label}}" does not destroy anything, so it is not red. Red is only for delete, remove, revoke, disconnect, deactivate, release, discard — undoable actions (archive, stop, retry, transfer) are primary or outline.',
      inRow:
        'A row action is never the filled destructive variant. Write `variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive"` and let the confirm carry the red.',
    },
  },

  create(context) {
    const imports = trackUiImports()

    return {
      ...imports.visitor,
      JSXElement(element) {
        const opening = element.openingElement
        const name = imports.ui(jsxName(opening))
        if (name !== "Button" && name !== "AlertDialogAction") return
        if (attrString(getAttr(opening, "variant")) !== "destructive") return

        for (const ancestor of jsxAncestors(element)) {
          if (imports.ui(jsxName(ancestor.openingElement)) === "TableCell") {
            context.report({ node: opening, messageId: "inRow" })
            return
          }
        }

        const { text, dynamic } = textOf(element)
        if (!text || dynamic) return
        const verb = text.toLowerCase().split(/\s+/)[0]
        if (!DESTROYING.has(verb)) {
          context.report({
            node: opening,
            messageId: "notDestroying",
            data: { label: text },
          })
        }
      },
    }
  },
}

export default destructiveVariant
