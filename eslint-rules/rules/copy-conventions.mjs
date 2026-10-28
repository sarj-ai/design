import { jsxAncestors, jsxName, textOf, trackUiImports } from "../lib/jsx.mjs"

/** Where "Something went wrong" is the whole message rather than a gloss. */
const TITLES = new Set([
  "AlertTitle",
  "EmptyTitle",
  "DialogTitle",
  "AlertDialogTitle",
  "SheetTitle",
  "DrawerTitle",
  "CardTitle",
])
const HEADINGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"])
// The parts too, since a wrapper (`<Notice>`) often stands in for Alert.
const ALERT_PARTS = new Set(["Alert", "AlertTitle", "AlertDescription"])
const LABELS = new Set(["FieldLabel", "Label", "FieldLegend", "FieldTitle"])

const READ_PROPS = new Set([
  "title",
  "description",
  "label",
  "placeholder",
  "aria-label",
  "heading",
])

const CHECKS = [
  {
    id: "areYouSure",
    test: (s) => /\bare you sure\b/i.test(s),
  },
  {
    id: "wentWrong",
    test: (s, where) =>
      /\bsomething went wrong\b/i.test(s) &&
      (where.title || /^something went wrong[.!]?$/i.test(s.trim())),
  },
  {
    id: "unavailable",
    test: (s) => /^(unavailable|n\/a)$/i.test(s.trim()),
  },
  {
    id: "required",
    test: (s, where) =>
      where.inLabel && /^\*?\s*\(?required\)?$/i.test(s.trim()),
  },
  {
    id: "noneFound",
    test: (s, where) =>
      !where.inAlert && /^no\b[^.]*\bfound\b\.?$/i.test(s.trim()),
  },
]

const copyConventions = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Copy the design system has ruled out: Are you sure, Something went wrong, Unavailable, Required, No … found.",
    },
    schema: [],
    messages: {
      areYouSure:
        "Never “Are you sure”. Name the thing (“Delete Reservations?”), then say what goes with it, what stops, and what is kept. The words are the warning.",
      wentWrong:
        "“Something went wrong” is what a page says when nobody decided. Name what failed (“Could not load calls”), say whether retrying is safe, and offer Try again.",
      unavailable:
        "“{{text}}” names no reason, so nobody can act on it. An empty cell is “—” (cannot exist for this row), “Not set” (nobody filled it in) or “Not analysed” (the system has not produced it yet).",
      required:
        "Never the word “Required”. Mark the minority: an asterisk on the required fields where most are optional, “(optional)” after the label where most are required.",
      noneFound:
        "“{{text}}” — an empty list names the object in sentence case (“No API keys yet”), and a filter that matches nothing quotes the term (No calls match “refund”).",
    },
  },

  create(context) {
    const imports = trackUiImports()

    const placeOf = (element) => {
      const own = element ? jsxName(element.openingElement) : null
      const where = {
        title: !!own && (TITLES.has(imports.ui(own)) || HEADINGS.has(own)),
        inAlert: false,
        inLabel: false,
      }
      if (element) {
        for (const ancestor of [element, ...jsxAncestors(element)]) {
          const name = imports.ui(jsxName(ancestor.openingElement))
          if (ALERT_PARTS.has(name)) where.inAlert = true
          if (LABELS.has(name)) where.inLabel = true
        }
      }
      return where
    }

    const check = (
      node,
      text,
      where = { title: true, inAlert: false, inLabel: false },
    ) => {
      if (!text) return
      for (const { id, test } of CHECKS) {
        if (test(text, where)) {
          context.report({ node, messageId: id, data: { text: text.trim() } })
          return
        }
      }
    }

    return {
      ...imports.visitor,
      // A toast is the whole message, so it is held to the title standard.
      CallExpression(node) {
        const callee = node.callee
        const name =
          callee.type === "Identifier"
            ? callee.name
            : callee.type === "MemberExpression"
              ? callee.object?.name
              : null
        if (name !== "toast") return
        const [first] = node.arguments
        if (first?.type === "Literal" && typeof first.value === "string") {
          check(first, first.value)
        }
      },
      // One report per element, on its whole text, so "No calls found" split across JSXText and {term} reads as one.
      JSXElement(element) {
        const hasOwnText = (element.children ?? []).some(
          (child) =>
            (child.type === "JSXText" && child.value.trim()) ||
            (child.type === "JSXExpressionContainer" &&
              child.expression.type === "Literal"),
        )
        if (!hasOwnText) return
        const { text } = textOf({
          children: element.children.filter((c) => c.type !== "JSXElement"),
        })
        check(element.openingElement, text, placeOf(element))
      },
      JSXAttribute(node) {
        if (!READ_PROPS.has(node.name?.name)) return
        const element = node.parent?.parent
        const where = {
          title: node.name.name === "title" || node.name.name === "heading",
          inAlert: placeOf(element?.type === "JSXElement" ? element : null)
            .inAlert,
          inLabel: false,
        }
        const value = node.value
        if (value?.type === "Literal" && typeof value.value === "string") {
          check(node, value.value, where)
        } else if (
          value?.type === "JSXExpressionContainer" &&
          value.expression.type === "Literal" &&
          typeof value.expression.value === "string"
        ) {
          check(node, value.expression.value, where)
        }
      },
    }
  },
}

export default copyConventions
