import { collectStrings, parseClasses } from "../lib/classes.mjs"

/**
 * Sixty-one primitives are installed. Almost nothing needs to be built.
 *
 * A hand-rolled `<button>` gets the brand's colour but not its focus ring, its
 * disabled state, its icon sizing, its hover timing, or its dark-mode pairing —
 * and every one of those drifts a little further with each new mockup. The
 * primitive is not a shortcut, it is the definition of what the component is.
 */

const RAW_ELEMENTS = {
  button:
    "`<Button>` from @/components/ui/button — sizes xs | sm | default | lg, plus icon-xs | icon-sm | icon | icon-lg",
  input:
    "`<Input>` from @/components/ui/input, or `<InputGroup>` when it needs an addon",
  textarea: "`<Textarea>` from @/components/ui/textarea",
  select:
    "`<Select>` from @/components/ui/select, or `<NativeSelect>` for a plain one",
  table: "the `<Table>` family from @/components/ui/table",
  dialog: "`<Dialog>` from @/components/ui/dialog",
  progress: "`<Progress>` from @/components/ui/progress",
  hr: "`<Separator>` from @/components/ui/separator",
}

/** A div with a radius, an edge, and padding is a Card with extra steps. */
const RADIUS = /^rounded(-|$)/
const EDGE = /^(border|ring)(-|$)/
const PADDING = /^p[xytrbles]?-/

/**
 * `<Item asChild><button …>` is the idiomatic shadcn pattern, not a hand-rolled
 * button: asChild merges the primitive's props onto the child, so the child
 * *has* to be a raw element. Swapping in `<Button>` there would nest two
 * buttons. Skip any raw element whose parent primitive carries asChild.
 */
function isAsChildTarget(node) {
  const parentElement = node.parent?.parent
  if (parentElement?.type !== "JSXElement") return false
  return (parentElement.openingElement?.attributes ?? []).some(
    (attr) => attr.type === "JSXAttribute" && attr.name?.name === "asChild",
  )
}

const useUiPrimitives = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Build from the shadcn primitives in src/components/ui — never hand-roll one.",
    },
    schema: [],
    messages: {
      rawElement:
        "`<{{element}}>` duplicates an installed primitive. Use {{replacement}}. Anything genuinely missing: `npx shadcn@latest add <name>`.",
      rebuiltCard:
        'This `<div className="{{classes}}">` rebuilds `<Card>` — radius, edge, and padding. Import Card, CardHeader, CardTitle, CardDescription, CardContent instead; Card owns its own padding via --card-spacing and uses `ring-1 ring-foreground/10`, so you write neither.',
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = node.name?.type === "JSXIdentifier" ? node.name.name : null
        if (!name) return

        const replacement = RAW_ELEMENTS[name]
        if (replacement) {
          if (isAsChildTarget(node)) return
          context.report({
            node: node.name,
            messageId: "rawElement",
            data: { element: name, replacement },
          })
          return
        }

        if (name !== "div") return

        const classAttr = node.attributes.find(
          (attr) =>
            attr.type === "JSXAttribute" && attr.name?.name === "className",
        )
        if (!classAttr) return

        const bases = collectStrings(classAttr.value)
          .flatMap(({ value }) => parseClasses(value))
          .map(({ base }) => base)

        const hasRadius = bases.some((b) => RADIUS.test(b))
        const hasEdge = bases.some((b) => EDGE.test(b))
        const hasPadding = bases.some((b) => PADDING.test(b))

        if (hasRadius && hasEdge && hasPadding) {
          context.report({
            node: classAttr,
            messageId: "rebuiltCard",
            data: {
              classes: bases
                .filter(
                  (b) => RADIUS.test(b) || EDGE.test(b) || PADDING.test(b),
                )
                .join(" "),
            },
          })
        }
      },
    }
  },
}

export default useUiPrimitives
