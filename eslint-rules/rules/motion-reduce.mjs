import { createAttributeVisitor } from "../lib/classes.mjs"

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
 */

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
      missing:
        "`{{cls}}` animates with no reduced-motion escape. Add `motion-reduce:{{fix}}` to the same className. This is not optional and there is no exception for opacity or colour — a user with `prefers-reduced-motion` on has already told the OS that unrequested movement makes them ill.",
    },
  },

  create(context) {
    return createAttributeVisitor(({ classes }) => {
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
  },
}

export default motionReduce
