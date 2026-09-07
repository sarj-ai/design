import { createClassVisitor } from "../lib/classes.mjs"

/**
 * Duration and easing are tokens, from the house rules in
 * .claude/skills/web-animation-design/SKILL.md.
 *
 * Duration:  hover/press 150ms · tooltip, popover, dropdown 200ms ·
 *            dialog and drawer 200–300ms · container morph 250–300ms.
 *            Nothing over 300ms — past that a UI animation stops reading as
 *            feedback and starts reading as latency.
 *
 * Easing:    ease-out-cubic for anything entering or leaving the screen (the
 *            fast start makes it feel like the UI reacted instantly), and
 *            ease-in-out-cubic for an on-screen element resizing or moving.
 *            Both live in globals.css. `ease-in` is banned outright: a slow
 *            start delays visual feedback and makes the interface feel sluggish.
 */

const DURATION = /^duration-(.+)$/
const EASE = /^ease-(.+)$/

const ALLOWED_DURATIONS = new Set(["0", "100", "150", "200", "250", "300"])

const ALLOWED_EASINGS = new Set([
  "ease-out-cubic",
  "ease-in-out-cubic",
  "ease-linear", // constant motion only: marquees, progress, spinners
  "ease-initial",
])

const EASING_SWAP = {
  "ease-out": "ease-out-cubic",
  "ease-in-out": "ease-in-out-cubic",
}

const motionTokens = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Animation duration and easing come from the tokens, capped at 300ms.",
    },
    schema: [],
    messages: {
      duration:
        "`{{cls}}` is not one of the house durations. Use duration-150 (hover, press), duration-200 (tooltip, popover, dropdown), duration-200…300 (dialog, drawer, a container morphing to fit new content). Nothing over 300ms — larger elements animate slower, but never longer than that.",
      easingSwap:
        "`{{cls}}` is the browser's built-in curve. Use `{{swap}}` from globals.css instead — the token is the tuned version, and keeping one curve across the app is what makes separate animations feel like one system.",
      easeIn:
        "`{{cls}}` — ease-in makes the interface feel sluggish, because the slow start delays the visual feedback the user is waiting for. Use ease-out-cubic for anything entering or leaving, ease-in-out-cubic for something moving on screen.",
      arbitraryEasing:
        "`{{cls}}` writes a raw curve in a component. The easing tokens live in globals.css — ease-out-cubic (entering / exiting) and ease-in-out-cubic (moving / resizing).",
      unknownEasing:
        "`{{cls}}` is not a house easing. Use ease-out-cubic (entering / exiting), ease-in-out-cubic (an on-screen element moving or resizing), or ease-linear (constant motion only — marquees, progress, spinners).",
    },
  },

  create(context) {
    return createClassVisitor(({ node, classes }) => {
      for (const { raw, base } of classes) {
        const duration = DURATION.exec(base)
        if (duration) {
          const value = duration[1].replace(/^\[|ms\]?$|\]$/g, "")
          if (!ALLOWED_DURATIONS.has(value)) {
            context.report({
              node,
              messageId: "duration",
              data: { cls: raw },
            })
          }
          continue
        }

        if (!EASE.test(base) || ALLOWED_EASINGS.has(base)) continue

        if (base.startsWith("ease-[")) {
          context.report({
            node,
            messageId: "arbitraryEasing",
            data: { cls: raw },
          })
        } else if (base === "ease-in") {
          context.report({ node, messageId: "easeIn", data: { cls: raw } })
        } else if (EASING_SWAP[base]) {
          context.report({
            node,
            messageId: "easingSwap",
            data: { cls: raw, swap: EASING_SWAP[base] },
          })
        } else {
          context.report({
            node,
            messageId: "unknownEasing",
            data: { cls: raw },
          })
        }
      }
    })
  },
}

export default motionTokens
