import { jsxAncestors, jsxName, trackUiImports } from "../lib/jsx.mjs"

const HEADERS = new Set([
  "DrawerHeader",
  "SheetHeader",
  "DialogHeader",
  "AlertDialogHeader",
])

const CONTROLS = new Set([
  "Button",
  "Badge",
  "Toggle",
  "ToggleGroupItem",
  "TabsTrigger",
  "DropdownMenuTrigger",
  "TooltipTrigger",
  "InputGroupAddon",
  "Kbd",
])

const isIconName = (name) =>
  !!name && (/Icon$/.test(name) || name === "HugeiconsIcon")

const noHeaderIcon = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Drawer, sheet, dialog and confirm headers carry no icon tile — title, description, Close.",
    },
    schema: [],
    messages: {
      headerIcon:
        "`<{{icon}}>` decorates `<{{header}}>`. A surface header is a title, a description and a Close button — the title already names the thing, and a confirm's words are its warning.",
      media:
        "`<{{name}}>` puts an icon tile in a surface header. Drop it: a header is a title, a description and a Close button.",
    },
  },

  create(context) {
    const imports = trackUiImports()

    return {
      ...imports.visitor,
      JSXElement(element) {
        const opening = element.openingElement
        const local = jsxName(opening)
        const primitive = imports.ui(local)

        if (primitive === "AlertDialogMedia") {
          context.report({
            node: opening,
            messageId: "media",
            data: { name: primitive },
          })
          return
        }

        const tile = primitive === "ItemMedia" || primitive === "Avatar"
        if (!tile && !isIconName(local)) return

        for (const ancestor of jsxAncestors(element)) {
          const name = imports.ui(jsxName(ancestor.openingElement))
          if (CONTROLS.has(name)) return
          if (HEADERS.has(name)) {
            context.report({
              node: opening,
              messageId: tile ? "media" : "headerIcon",
              data: { icon: local, name: local, header: name },
            })
            return
          }
        }
      },
    }
  },
}

export default noHeaderIcon
