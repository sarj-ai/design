import { collectStrings, parseClasses } from "../lib/classes.mjs"

/**
 * Don't reach past a primitive to restyle the box it owns.
 *
 * `<Button className="h-10 rounded-md px-4">` does not customise the button, it
 * forks it: the override freezes while the primitive keeps evolving, and the
 * two drift until this one button no longer matches any other button in the
 * app. If a primitive needs to look different, it needs a `variant` or a
 * `size`, not a className.
 *
 * Deliberately narrow. It polices only the primitives that own their own
 * geometry, and only the properties they own:
 *
 *  - Colour is not checked here at all. `bg-primary-tint` on an `<Item>` is the
 *    sanctioned selected-row surface, and `text-muted-foreground` on a
 *    `<TableCell>` is the sanctioned secondary text. Tokens are the vocabulary;
 *    `sarj/no-raw-color` already catches the colours that aren't tokens.
 *  - Layout wrappers (ScrollArea, CollapsibleContent, TabsContent, Dialog and
 *    Sheet content) are not checked. They exist to be laid out — `h-60` on a
 *    ScrollArea is required, not a violation.
 *
 * Layout on any primitive stays legal: col-span, w-full, max-w-*, flex, grid,
 * gap-*, mx-auto, items-*, justify-*, self-*, and every margin.
 */

const PADDING = /^p[xytrbles]?-/
const RADIUS = /^rounded(-|$)/
/** `h-full`/`h-auto`/`h-fit` size to a parent; a fixed `h-9` overrides the primitive. */
const FIXED_HEIGHT = /^h-(\d|\[|px$)/
const BORDER = /^border(-\d|-\[|$)/
const TEXT_SIZE = /^text-(xs|sm|base|lg|xl|[2-9]xl|\[)/
const FONT_WEIGHT =
  /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/

/**
 * Primitives that own their geometry, and which of it they own.
 * Everything not listed here is a layout wrapper and goes unchecked.
 */
const OWNED = {
  Card: { padding: true, radius: true, border: true },
  CardHeader: { padding: true },
  CardContent: { padding: true },
  CardFooter: { padding: true },
  Button: { padding: true, radius: true, height: true },
  Badge: { padding: true, radius: true, height: true },
  Input: { padding: true, radius: true, height: true },
  Textarea: { padding: true, radius: true },
  SelectTrigger: { padding: true, radius: true, height: true },
  InputGroup: { padding: true, radius: true, height: true },
}

/** Primitives with a fixed rung on the type ladder. */
const TYPE_ROLE = new Set([
  "CardTitle",
  "CardDescription",
  "DialogTitle",
  "DialogDescription",
  "SheetTitle",
  "SheetDescription",
  "DrawerTitle",
  "DrawerDescription",
  "AlertTitle",
  "AlertDescription",
])

const ADVICE = {
  Card: 'Card sets its padding from --card-spacing (16px, or 12px with size="sm") and uses `ring-1 ring-foreground/10` rather than a border. Pick one card size per view and let it be.',
  CardHeader:
    "Card owns the padding for its whole header/content/footer stack.",
  CardContent:
    "Card owns the padding for its whole header/content/footer stack.",
  CardFooter:
    "Card owns the padding for its whole header/content/footer stack.",
  Button:
    "Use the size prop — xs | sm | default | lg, plus icon-xs | icon-sm | icon | icon-lg.",
  Badge: "Badge is already a pill: rounded-4xl, h-5, text-xs.",
  Input: "Use the size prop, or wrap it in InputGroup when it needs an addon.",
  Textarea: "Set rows to change its size.",
  SelectTrigger: "Use the size prop — sm | default.",
  InputGroup: "InputGroup sizes itself around the input it wraps.",
}

const noPrimitiveOverride = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Do not override the padding, radius, or height that a primitive owns.",
    },
    schema: [],
    messages: {
      geometry:
        "`{{cls}}` overrides the {{property}} `<{{name}}>` owns. {{advice}} Your className is for layout only — if it genuinely needs to look different, that is a variant, not a class.",
      typography:
        "`{{cls}}` resizes or reweights `<{{name}}>`, which has a fixed rung on the type ladder (CardTitle is text-base font-medium). Three levels max on one surface, stepping down one property at a time — and 'less important' is text-muted-foreground, not a smaller font.",
    },
  },

  create(context) {
    /** Local JSX names imported from @/components/ui/*. */
    const primitives = new Set()

    return {
      ImportDeclaration(node) {
        if (!/^@\/components\/ui\//.test(node.source.value)) return
        for (const spec of node.specifiers) {
          if (spec.local?.name) primitives.add(spec.local.name)
        }
      },

      JSXOpeningElement(node) {
        const name = node.name?.type === "JSXIdentifier" ? node.name.name : null
        if (!name || !primitives.has(name)) return

        const owned = OWNED[name]
        const hasTypeRole = TYPE_ROLE.has(name)
        if (!owned && !hasTypeRole) return

        const classAttr = node.attributes.find(
          (attr) =>
            attr.type === "JSXAttribute" && attr.name?.name === "className",
        )
        if (!classAttr) return

        for (const entry of collectStrings(classAttr.value)) {
          for (const { raw, base } of parseClasses(entry.value)) {
            const geometry =
              (owned?.padding && PADDING.test(base) && "padding") ||
              (owned?.radius && RADIUS.test(base) && "radius") ||
              (owned?.height && FIXED_HEIGHT.test(base) && "height") ||
              (owned?.border && BORDER.test(base) && "edge")

            if (geometry) {
              context.report({
                node: entry.node,
                messageId: "geometry",
                data: {
                  cls: raw,
                  name,
                  property: geometry,
                  advice: ADVICE[name] ?? "",
                },
              })
            } else if (
              hasTypeRole &&
              (TEXT_SIZE.test(base) || FONT_WEIGHT.test(base))
            ) {
              context.report({
                node: entry.node,
                messageId: "typography",
                data: { cls: raw, name },
              })
            }
          }
        }
      },
    }
  },
}

export default noPrimitiveOverride
