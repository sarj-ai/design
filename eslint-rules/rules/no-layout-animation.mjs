import { arbitraryValue, createClassVisitor } from "../lib/classes.mjs"

// The one allowed exception, a ResizeObserver height morph, is marked with an inline disable comment.

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
