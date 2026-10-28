import { createAttributeVisitor } from "../lib/classes.mjs"
import {
  classesOf,
  getAttr,
  isOpaqueClassName,
  jsxName,
  trackUiImports,
} from "../lib/jsx.mjs"

/** These animate from inside src/components/ui, so they are checked by name. */
const SELF_ANIMATED = new Set(["Skeleton"])

const ANIMATED = /^(transition|animate)(-|$)/
const INERT = new Set([
  "transition-none",
  "animate-none",
  "motion-safe",
  "motion-reduce",
])

const motionReduce = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Anything animated must carry a motion-reduce: counterpart on the same element.",
    },
    schema: [],
    messages: {
      primitive:
        "`<{{name}}>` animates from inside the primitive. Add `motion-reduce:animate-none` to its className — the pulse is movement too.",
      missing:
        "`{{cls}}` animates with no reduced-motion escape. Add `motion-reduce:{{fix}}` to the same className. This is not optional and there is no exception for opacity or colour — a user with `prefers-reduced-motion` on has already told the OS that unrequested movement makes them ill.",
    },
  },

  create(context) {
    const imports = trackUiImports()

    const classVisitor = createAttributeVisitor(({ classes }) => {
      const hasEscape = classes.some(({ variants }) =>
        variants.includes("motion-reduce"),
      )
      if (hasEscape) return

      for (const { raw, base, variants, node } of classes) {
        if (!ANIMATED.test(base) || INERT.has(base)) continue
        if (variants.includes("motion-reduce")) continue

        context.report({
          node,
          messageId: "missing",
          data: {
            cls: raw,
            fix: base.startsWith("animate")
              ? "animate-none"
              : "transition-none",
          },
        })
        return
      }
    })

    return {
      ...imports.visitor,
      ...classVisitor,
      JSXOpeningElement(opening) {
        const name = imports.ui(jsxName(opening))
        if (!SELF_ANIMATED.has(name)) return
        // Lint cannot see into a computed className, so it does not guess.
        if (isOpaqueClassName(getAttr(opening, "className"))) return
        const escaped = classesOf(opening).some(({ variants }) =>
          variants.includes("motion-reduce"),
        )
        if (!escaped) {
          context.report({
            node: opening,
            messageId: "primitive",
            data: { name },
          })
        }
      },
    }
  },
}

export default motionReduce
