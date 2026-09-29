/**
 * The Foundations section as one skill file, for the "Copy as skill" button.
 *
 * Built from the same arrays the pages render, so the copy cannot say
 * something the page does not.
 */

import { COLOUR_GROUPS } from "@/lib/design-system/colour-tokens"
import {
  CONTROL_STEPS,
  GLOBAL_RULES,
  LAYER_TOKENS,
  LINT_RULES,
} from "@/lib/design-system/data"

export const FOUNDATIONS_SKILL = [
  "---",
  "name: sarj-foundations",
  "description: The fixed half of the Sarj design system — colour tokens, layers, the global rules, control heights and the ten lint rules. Use before writing any Sarj UI.",
  "---",
  "",
  "# Sarj foundations",
  "",
  "Nothing here is a judgement call. Use the tokens, never a literal.",
  "",
  "## Rules",
  "",
  ...GLOBAL_RULES.map((rule) => `- **${rule.label}** — ${rule.detail}`),
  "",
  "## Colour",
  "",
  ...COLOUR_GROUPS.flatMap((group) => [
    `### ${group.title}`,
    "",
    group.note,
    "",
    ...group.tokens.map(
      (token) => `- \`--${token.name}\`: ${token.value} — ${token.use}`,
    ),
    "",
  ]),
  "## Layering",
  "",
  "Name the layer, never the number.",
  "",
  ...LAYER_TOKENS.map(
    (layer) => `- \`${layer.name}\` (${layer.value}) — ${layer.what}`,
  ),
  "",
  "## Control scale",
  "",
  ...CONTROL_STEPS.map(
    (step) =>
      `- ${step.px}px — button ${step.button}${step.field ? `, field ${step.field}` : ""}. ${step.when}`,
  ),
  "",
  "## Enforced by npm run lint",
  "",
  ...LINT_RULES.map(
    (rule) =>
      `- \`sarj/${rule.id}\` bans ${rule.bans}. Instead: ${rule.instead}`,
  ),
  "",
].join("\n")
