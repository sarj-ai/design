import { createAttributeVisitor } from "../lib/classes.mjs"
import {
  classesOf,
  getAttr,
  isOpaqueClassName,
  jsxName,
  trackUiImports,
} from "../lib/jsx.mjs"

/**
 * Every animated element carries its own reduced-motion escape. No exceptions.
 *
 * `prefers-reduced-motion` is not a nice-to-have toggle — for users with
 * vestibular disorders, motion sickness, or migraine triggers, movement they
 * did not ask for is a physical symptom, not an aesthetic complaint. The
 * setting is opt-in at the OS level, so anyone who has it on has already told
 * you what they need.
 *
 * It is per-element because a global kill-switch does not exist in Tailwind:
 * `motion-reduce:` compiles to a media query scoped to the class it prefixes.
 *
 * Applies to opacity and colour fades too. "It's only a fade" is the same
 * argument made once per element, and the sum is a page that still moves.
 *
 * `<Skeleton>` pulses from inside the primitive, where no className of ours
 * can see it — so a Skeleton is checked by name, and needs the escape too.
 */

/** Primitives that animate on their own, from inside src/components/ui. */
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
        // One report per element is enough to make the point.
        return
      }
    })

    return {
      ...imports.visitor,
      ...classVisitor,
      JSXOpeningElement(opening) {
        const name = imports.ui(jsxName(opening))
        if (!SELF_ANIMATED.has(name)) return
        /* `className={cellWidth(i)}` may well carry the escape; lint cannot
           see into the function, so it does not guess. */
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
