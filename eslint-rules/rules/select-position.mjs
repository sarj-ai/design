import {
  attrString,
  getAttr,
  hasSpread,
  jsxName,
  trackUiImports,
} from "../lib/jsx.mjs"

/**
 * A Select opens as a popover under its trigger.
 *
 * The primitive's default, `item-aligned`, lays the list over the trigger so
 * the chosen item sits where the value was — and on a short list near the
 * foot of a drawer it jumps the whole menu up the screen. The platform opens
 * every Select as `position="popper"`, below the trigger, like every other
 * popover.
 */

const selectPosition = {
  meta: {
    type: "problem",
    docs: { description: 'Every SelectContent is position="popper".' },
    schema: [],
    messages: {
      position:
        '`<SelectContent>` without `position="popper"`. Every Select opens below its trigger like the other popovers; add `position="popper"` (and `align="end"` when the trigger sits at the end of a row).',
    },
  },

  create(context) {
    const imports = trackUiImports()

    return {
      ...imports.visitor,
      JSXOpeningElement(opening) {
        if (imports.ui(jsxName(opening)) !== "SelectContent") return
        if (hasSpread(opening)) return
        const attr = getAttr(opening, "position")
        if (
          attr &&
          (attrString(attr) === "popper" || attrString(attr) === null)
        )
          return
        context.report({ node: opening, messageId: "position" })
      },
    }
  },
}

export default selectPosition
