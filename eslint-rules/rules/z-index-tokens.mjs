import { createClassVisitor } from "../lib/classes.mjs"

/**
 * Stacking order is a design decision, so it gets a name — not a number.
 *
 * `z-50` tells the next reader nothing about what this element is supposed to
 * sit above. When two people both reach for 50 the layering becomes a race, and
 * the usual fix is someone typing `z-[9999]`. Naming the layer makes the
 * intent reviewable and the conflicts obvious.
 *
 * The scale lives in src/app/globals.css.
 */

const Z_UTILITY = /^-?z-(.+)$/

const LAYERS = {
  "z-base": "normal flow",
  "z-raised": "sticky table header, hover lift",
  "z-sticky": "sticky page toolbar / filter bar",
  "z-nav": "app sidebar, top nav",
  "z-overlay": "scrim behind a panel",
  "z-modal": "dialog, sheet, drawer content",
  "z-popover": "popover or select opened from inside a modal",
  "z-toast": "toasts",
  "z-tooltip": "always on top",
}

const LAYER_LIST = Object.entries(LAYERS)
  .map(([name, use]) => `${name} (${use})`)
  .join(" · ")

const zIndexTokens = {
  meta: {
    type: "problem",
    docs: {
      description:
        "z-index comes from the named stacking scale in globals.css, not a bare number.",
    },
    schema: [],
    messages: {
      rawZIndex:
        "`{{cls}}` picks a stacking number by hand. Name the layer instead — {{layers}}. `z-modal` is 50, the same value the shadcn overlays use, so anything that must sit above a dialog is `z-popover` or higher.",
    },
  },

  create(context) {
    return createClassVisitor(({ node, classes }) => {
      for (const { raw, base } of classes) {
        if (!Z_UTILITY.test(base)) continue
        // `z-auto` is a reset, not a layer choice.
        if (base === "z-auto" || base in LAYERS) continue

        context.report({
          node,
          messageId: "rawZIndex",
          data: { cls: raw, layers: LAYER_LIST },
        })
      }
    })
  },
}

export default zIndexTokens
