import { classesOf, jsxName, trackUiImports } from "../lib/jsx.mjs"

/**
 * Four widths and the screen: confirm 384, dialog 448, drawer 448, record 1024.
 *
 * The surfaces decision (/design-system/product-components/surfaces) fixes one
 * width per surface so a reader learns the shape once. Two things break it:
 *
 *  - An unprefixed `max-w-*`. The primitives set their width at `sm:`, and a
 *    class with no breakpoint loses to one with a breakpoint — so
 *    `max-w-md` on a DialogContent does nothing and every dialog stays at
 *    the primitive's default. Always `sm:max-w-*`.
 *  - A width that is not one of the four. A 512px dialog is not a fifth
 *    surface, it is a dialog someone resized.
 */

const ALLOWED = {
  AlertDialogContent: {
    widths: new Set(["max-w-sm"]),
    say: "A confirm is 384px — `sm:max-w-sm`, which is the primitive's default, so usually write nothing.",
  },
  DialogContent: {
    widths: new Set(["max-w-md"]),
    say: "A dialog is 448px — `sm:max-w-md`. More than four fields, tabs, steps or a scroll is a drawer or a page, not a wider dialog.",
  },
  SheetContent: {
    widths: new Set(["max-w-md", "max-w-5xl"]),
    say: "A drawer is 448px (`sm:max-w-md`); a record opened from a list is 1024px (`sm:max-w-5xl`).",
  },
  DrawerContent: {
    widths: new Set(["max-w-md", "max-w-5xl"]),
    say: "A drawer is 448px (`sm:max-w-md`); a record opened from a list is 1024px (`sm:max-w-5xl`).",
  },
}

const BREAKPOINT = /^(sm|md|lg|xl|2xl)$/

/* Sheet and Drawer set their width as `data-[side=right]:sm:max-w-sm`, whose
   attribute selector outranks a plain `sm:max-w-md` — so on those two the
   width only lands with `!`. Dialog sets a bare `sm:max-w-sm` and needs none. */
const NEEDS_IMPORTANT = new Set(["SheetContent", "DrawerContent"])

const surfaceWidth = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Overlay widths come from the surfaces decision: confirm 384, dialog 448, drawer 448, record 1024 — always at sm:.",
    },
    schema: [],
    messages: {
      unprefixed:
        "`{{cls}}` has no breakpoint, so the primitive's own `sm:max-w-*` wins and this does nothing. Write `sm:{{base}}`. {{say}}",
      notImportant:
        "`{{cls}}` loses to the primitive's `data-[side=right]:sm:max-w-sm`, which has the higher specificity — the panel stays 384px. Write `{{cls}}!`.",
      offScale:
        "`{{cls}}` is not one of the surface widths. {{say}} See /design-system/product-components/surfaces.",
    },
  },

  create(context) {
    const imports = trackUiImports()

    return {
      ...imports.visitor,
      JSXOpeningElement(opening) {
        const primitive = imports.ui(jsxName(opening))
        const allowed = ALLOWED[primitive]
        if (!allowed) return

        for (const { raw, base, variants, node } of classesOf(opening)) {
          if (!/^max-w-/.test(base) || base === "max-w-none") continue
          /* `max-w-[calc(100%-2rem)]`, `max-w-full`: the mobile gutter, which
             the primitive sets too. Not a surface width. */
          if (/^max-w-(full|screen|\[)/.test(base)) continue

          const atBreakpoint = variants.some((v) => BREAKPOINT.test(v))
          if (!atBreakpoint) {
            context.report({
              node,
              messageId: "unprefixed",
              data: { cls: raw, base, say: allowed.say },
            })
          } else if (!allowed.widths.has(base)) {
            context.report({
              node,
              messageId: "offScale",
              data: { cls: raw, say: allowed.say },
            })
          } else if (
            NEEDS_IMPORTANT.has(primitive) &&
            !raw.endsWith("!") &&
            !base.startsWith("!")
          ) {
            context.report({
              node,
              messageId: "notImportant",
              data: { cls: raw },
            })
          }
        }
      },
    }
  },
}

export default surfaceWidth
