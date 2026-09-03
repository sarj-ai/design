/**
 * The `sarj` ESLint plugin — the design system, enforced.
 *
 * These rules are the machine-checkable half of AGENTS.md and
 * .claude/skills/sarj-mockup/SKILL.md. Everything they catch is something that
 * looks fine in the one mockup you are building and wrong in the app it is
 * supposed to belong to: a colour that dies on the theme flip, a hand-rolled
 * button with no focus ring, a 400ms transition that reads as latency.
 *
 * Local plugin, zero dependencies — nothing to install.
 */

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

const plugin = {
  meta: { name: "eslint-plugin-sarj", version: "1.0.0" },
  rules: {
    // Tokens
    "no-raw-color": noRawColor,
    "no-arbitrary-scale": noArbitraryScale,
    "no-shadow": noShadow,
    "z-index-tokens": zIndexTokens,
    // shadcn primitives
    "use-ui-primitives": useUiPrimitives,
    "no-primitive-override": noPrimitiveOverride,
    // Icons
    "icon-source": iconSource,
    // Motion
    "motion-tokens": motionTokens,
    "motion-reduce": motionReduce,
    "no-layout-animation": noLayoutAnimation,
  },
}

/** Everything on, at error. Applied to authored UI only — see eslint.config.mjs. */
export const recommended = Object.fromEntries(
  Object.keys(plugin.rules).map((name) => [`sarj/${name}`, "error"]),
)

export default plugin
