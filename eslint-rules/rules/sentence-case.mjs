import { createClassVisitor } from "../lib/classes.mjs"
import { jsxName, textOf, trackUiImports } from "../lib/jsx.mjs"

/**
 * Sentence case, everywhere a reader reads a name.
 *
 * Title Case and ALL CAPS are the two loudest tells that a screen was
 * generated rather than designed. The product writes "Create persona", "API
 * keys", "No API keys yet" — one capitalisation across every title, label,
 * tab and button, so the reader never has to wonder whether "Call Flow" and
 * "call flow" are different things.
 *
 *  - The `uppercase` class is banned. The one sanctioned use is a reel's
 *    `Kicker`, which carries its own disable comment.
 *  - Literal text in a title, label, tab, button or heading where every word
 *    after the first is capitalised is Title Case. Acronyms (API, SIP, URL)
 *    and words with a digit are skipped; proper nouns are the reader's call,
 *    so write them as an expression (`{"Google Calendar"}`) to opt out.
 */

const NAMED = new Set([
  "Button",
  "CardTitle",
  "DialogTitle",
  "SheetTitle",
  "DrawerTitle",
  "AlertDialogTitle",
  "AlertTitle",
  "EmptyTitle",
  "FieldLabel",
  "FieldLegend",
  "FieldTitle",
  "Label",
  "TabsTrigger",
  "TableHead",
  "ItemTitle",
  "DropdownMenuItem",
  "DropdownMenuLabel",
  "SelectItem",
  "BreadcrumbPage",
  "BreadcrumbLink",
])
const HEADINGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"])

const SMALL = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "for",
  "from",
  "in",
  "into",
  "of",
  "on",
  "or",
  "per",
  "the",
  "to",
  "via",
  "vs",
  "with",
])

/** True when every word after the first starts with a capital. */
export function isTitleCase(text) {
  const words = text.match(/[A-Za-z][A-Za-z'’]*/g) ?? []
  if (words.length < 2) return false
  const rest = words
    .slice(1)
    .filter((w) => w.length > 1 && w !== w.toUpperCase())
    .filter((w) => !SMALL.has(w.toLowerCase()))
  if (rest.length === 0) return false
  return rest.every((w) => /^[A-Z]/.test(w))
}

const sentenceCase = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Sentence case for every title, label, tab and button; never the uppercase class.",
    },
    schema: [],
    messages: {
      uppercase:
        "`{{cls}}` shouts. Sentence case everywhere — the only uppercase in the system is a reel's Kicker. A label that needs to stand out takes `font-medium` or `text-muted-foreground`, not capitals.",
      titleCase:
        '“{{text}}” is Title Case. Write it in sentence case: “{{fixed}}”. If a word is a proper noun, pass the string as an expression ({"…"}) to say so.',
    },
  },

  create(context) {
    const imports = trackUiImports()

    return {
      ...imports.visitor,
      ...createClassVisitor(({ node, classes }) => {
        for (const { raw, base } of classes) {
          if (base === "uppercase") {
            context.report({ node, messageId: "uppercase", data: { cls: raw } })
          }
        }
      }),
      JSXElement(element) {
        const local = jsxName(element.openingElement)
        if (!NAMED.has(imports.ui(local)) && !HEADINGS.has(local)) return

        /* Only the element's own literal text: an expression is data, and
           data (a customer's name, a scenario title) keeps its own case. */
        const own = (element.children ?? []).filter((c) => c.type === "JSXText")
        const { text } = textOf({ children: own })
        if (!text || !isTitleCase(text)) return

        const [first, ...rest] = text.split(" ")
        const fixed = [
          first,
          ...rest.map((w) =>
            w.length > 1 && w === w.toUpperCase() ? w : w.toLowerCase(),
          ),
        ].join(" ")

        context.report({
          node: element.openingElement,
          messageId: "titleCase",
          data: { text, fixed },
        })
      },
    }
  },
}

export default sentenceCase
