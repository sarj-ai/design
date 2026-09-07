import { arbitraryValue, createClassVisitor } from "../lib/classes.mjs"

/**
 * Animate transform and opacity. Nothing else.
 *
 * Those two are the only properties the browser can hand to the compositor:
 * they skip layout and paint entirely and run on the GPU. Animating `width`,
 * `height`, `padding`, or `top` forces a layout recalculation on every frame,
 * for the animated element *and* everything that reflows around it — which is
 * exactly the jank people describe as "it feels cheap".
 *
 * `transition-all` is the common way this happens by accident: it opts every
 * animatable property in, including ones that were never meant to move, so a
 * class change somewhere unrelated starts animating a layout property.
 *
 * One exception, from the house rules: a container morphing to fit new content
 * may animate `height`, and only on a wrapper measuring its child with a
 * ResizeObserver. It is allowed because switching a settings section is a rare
 * interaction, not a 100×/day one. Mark it explicitly:
 *
 *   // eslint-disable-next-line sarj/no-layout-animation -- ResizeObserver container morph
 */

const LAYOUT_PROPERTY =
  /\b(width|height|padding|margin|top|right|bottom|left|inset|inline-size|block-size|flex-basis|gap|font-size|border-width|all)\b/

const noLayoutAnimation = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Only transform and opacity may animate — layout properties cause per-frame reflow.",
    },
    schema: [],
    messages: {
      transitionAll:
        "`transition-all` animates every property that changes, including layout ones, so an unrelated class change starts causing per-frame reflow. Name what actually moves: transition-transform, transition-opacity, or transition-colors.",
      layoutProperty:
        "`{{cls}}` animates a layout property, which forces the browser to recalculate layout on every frame for this element and everything that reflows around it. Animate transform and opacity instead — a size change is usually `scale`, a position change is usually `translate`. The one exception is a container morphing to fit new content: animate `height` on a ResizeObserver wrapper and disable this rule on that line with a reason.",
    },
  },

  create(context) {
    return createClassVisitor(({ node, classes }) => {
      for (const { raw, base } of classes) {
        if (base === "transition-all") {
          context.report({ node, messageId: "transitionAll" })
          continue
        }
        if (!base.startsWith("transition-")) continue

        const arbitrary = arbitraryValue(base)
        const target = arbitrary ?? base.slice("transition-".length)
        if (LAYOUT_PROPERTY.test(target)) {
          context.report({
            node,
            messageId: "layoutProperty",
            data: { cls: raw },
          })
        }
      }
    })
  },
}

export default noLayoutAnimation
