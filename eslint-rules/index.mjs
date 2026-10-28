import iconSource from "./rules/icon-source.mjs"
import motionReduce from "./rules/motion-reduce.mjs"
import motionTokens from "./rules/motion-tokens.mjs"
import noArbitraryScale from "./rules/no-arbitrary-scale.mjs"
import noLayoutAnimation from "./rules/no-layout-animation.mjs"
import noPrimitiveOverride from "./rules/no-primitive-override.mjs"
import noRawColor from "./rules/no-raw-color.mjs"
import noShadow from "./rules/no-shadow.mjs"
import useUiPrimitives from "./rules/use-ui-primitives.mjs"
import zIndexTokens from "./rules/z-index-tokens.mjs"
import copyConventions from "./rules/copy-conventions.mjs"
import destructiveVariant from "./rules/destructive-variant.mjs"
import dialogShape from "./rules/dialog-shape.mjs"
import emptyState from "./rules/empty-state.mjs"
import footerActions from "./rules/footer-actions.mjs"
import formLabels from "./rules/form-labels.mjs"
import iconButtonLabel from "./rules/icon-button-label.mjs"
import noHeaderIcon from "./rules/no-header-icon.mjs"
import noNestedCard from "./rules/no-nested-card.mjs"
import noScrollbarStyle from "./rules/no-scrollbar-style.mjs"
import oneOverlay from "./rules/one-overlay.mjs"
import selectPosition from "./rules/select-position.mjs"
import sentenceCase from "./rules/sentence-case.mjs"
import sharedBlocks from "./rules/shared-blocks.mjs"
import surfaceWidth from "./rules/surface-width.mjs"
import tableShape from "./rules/table-shape.mjs"
import typeScale from "./rules/type-scale.mjs"

const plugin = {
  meta: { name: "eslint-plugin-sarj", version: "1.0.0" },
  rules: {
    "no-raw-color": noRawColor,
    "no-arbitrary-scale": noArbitraryScale,
    "no-shadow": noShadow,
    "z-index-tokens": zIndexTokens,
    "use-ui-primitives": useUiPrimitives,
    "no-primitive-override": noPrimitiveOverride,
    "icon-source": iconSource,
    "motion-tokens": motionTokens,
    "motion-reduce": motionReduce,
    "no-layout-animation": noLayoutAnimation,
    "type-scale": typeScale,
    "no-scrollbar-style": noScrollbarStyle,
    "icon-button-label": iconButtonLabel,
    "surface-width": surfaceWidth,
    "one-overlay": oneOverlay,
    "dialog-shape": dialogShape,
    "footer-actions": footerActions,
    "no-header-icon": noHeaderIcon,
    "destructive-variant": destructiveVariant,
    "select-position": selectPosition,
    "form-labels": formLabels,
    "table-shape": tableShape,
    "empty-state": emptyState,
    "shared-blocks": sharedBlocks,
    "no-nested-card": noNestedCard,
    "copy-conventions": copyConventions,
    "sentence-case": sentenceCase,
  },
}

export const recommended = Object.fromEntries(
  Object.keys(plugin.rules).map((name) => [`sarj/${name}`, "error"]),
)

export default plugin
