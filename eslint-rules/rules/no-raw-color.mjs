import {
  arbitraryValue,
  collectStrings,
  createClassVisitor,
} from "../lib/classes.mjs"

/**
 * Every colour in this repo is a semantic token from src/app/globals.css.
 *
 * A literal colour is not just a style preference — it is invisible breakage.
 * `bg-[#392868]` and `text-gray-500` do not follow the `.dark` class and do not
 * follow `.dark`, so the mockup silently
 * looks wrong in two of the three themes this repo ships.
 */

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose"

const COLOR_UTILITIES =
  "bg|text|border|ring|ring-offset|fill|stroke|from|via|to|decoration|outline|accent|caret|divide|placeholder|shadow"

/** `text-gray-500`, `bg-red-500/40`, `border-slate-200` */
const RAW_PALETTE = new RegExp(
  `^-?(${COLOR_UTILITIES})-(${PALETTE})-\\d{2,3}(\\/\\d{1,3})?$`,
)

/** `bg-white`, `text-black` — but never `bg-tailwind-black`, which is a token. */
const RAW_BW = new RegExp(
  `^-?(${COLOR_UTILITIES})-(white|black)(\\/\\d{1,3})?$`,
)

/** A colour literal anywhere in a string: #hex, oklch(), rgb(), hsl(), lab()… */
const COLOR_LITERAL =
  /#[0-9a-fA-F]{3,8}\b|\b(?:oklch|oklab|rgba?|hsla?|lab|lch|color-mix)\s*\(/

const COLOR_STYLE_KEYS = new Set([
  "color",
  "background",
  "backgroundColor",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderInlineColor",
  "borderBlockColor",
  "outlineColor",
  "textDecorationColor",
  "caretColor",
  "accentColor",
  "fill",
  "stroke",
  "boxShadow",
  "textShadow",
])

/** JSX props that take a raw colour — Recharts and friends. */
const COLOR_PROPS = new Set([
  "fill",
  "stroke",
  "color",
  "backgroundColor",
  "borderColor",
  "activeFill",
])

const noRawColor = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Use the semantic colour tokens from globals.css — never a hex, colour function, or raw Tailwind palette class.",
    },
    schema: [],
    messages: {
      rawPalette:
        "`{{cls}}` is a raw Tailwind palette colour. Use a semantic token instead — bg-primary, bg-primary-tint, text-muted-foreground, border-border, bg-destructive, bg-success, bg-warning, chart-1…6.",
      rawBlackWhite:
        "`{{cls}}` hardcodes a colour that does not flip with the theme. Use the surface token and its paired foreground — bg-background/text-foreground, bg-card/text-card-foreground, bg-primary/text-primary-foreground.",
      arbitraryColor:
        "`{{cls}}` embeds a colour literal. Every colour lives in globals.css — use the semantic token name.",
      literalInStyle:
        "Colour literal `{{value}}` in a style prop. Inline colours skip dark mode entirely — move it to a token class.",
      colorStyleKey:
        "`style={{ {{key}}: … }}` sets colour from JavaScript. Use a token class (bg-*, text-*, border-*) so the theme can override it. The style prop is for dynamic geometry only.",
      colorProp:
        "`{{prop}}={{value}}` is a raw colour. Chart and SVG colours come from the purple ramp — use `var(--color-chart-1)` … `var(--color-chart-6)`.",
    },
  },

  create(context) {
    const reportClass = ({ node, classes }) => {
      for (const { raw, base } of classes) {
        if (RAW_PALETTE.test(base)) {
          context.report({ node, messageId: "rawPalette", data: { cls: raw } })
          continue
        }
        if (RAW_BW.test(base)) {
          context.report({
            node,
            messageId: "rawBlackWhite",
            data: { cls: raw },
          })
          continue
        }
        const arbitrary = arbitraryValue(base)
        if (arbitrary && COLOR_LITERAL.test(arbitrary)) {
          context.report({
            node,
            messageId: "arbitraryColor",
            data: { cls: raw },
          })
        }
      }
    }

    const classVisitor = createClassVisitor(reportClass)

    return {
      ...classVisitor,

      JSXAttribute(node) {
        // Keep the className scan — this handler shadows the shared one.
        classVisitor.JSXAttribute(node)

        const name = node.name?.name

        if (name === "style") {
          const expression = node.value?.expression
          if (expression?.type === "ObjectExpression") {
            for (const prop of expression.properties) {
              if (prop.type !== "Property") continue
              const key = prop.key?.name ?? prop.key?.value
              if (COLOR_STYLE_KEYS.has(key)) {
                context.report({
                  node: prop,
                  messageId: "colorStyleKey",
                  data: { key },
                })
              }
            }
          }
          // Catch colours hidden in values and CSS custom properties too.
          for (const { node: strNode, value } of collectStrings(node.value)) {
            if (COLOR_LITERAL.test(value)) {
              context.report({
                node: strNode,
                messageId: "literalInStyle",
                data: { value },
              })
            }
          }
          return
        }

        if (COLOR_PROPS.has(name)) {
          for (const { node: strNode, value } of collectStrings(node.value)) {
            if (COLOR_LITERAL.test(value)) {
              context.report({
                node: strNode,
                messageId: "colorProp",
                data: { prop: name, value },
              })
            }
          }
        }
      },
    }
  },
}

export default noRawColor
