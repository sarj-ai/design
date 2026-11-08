import {
  BUTTON_ROLES,
  BUTTON_SIZES,
  CHIP_NOTES,
  DOCS_SECTIONS,
  EMPTY_STATE_RULES,
  EMPTY_VALUES,
  ERROR_RULES,
  FORM_RULES,
  LOADING_RULES,
  MOTION_RULES,
  NO_RESULTS_RULES,
  PAGINATION_RULES,
  PATTERNS,
  SURFACE_CHOICES,
  SURFACE_RULES,
  TABLE_RULES,
  type DocsSection,
  type Rule,
} from "@/lib/design-system/data";
import { foundationsBody } from "@/lib/design-system/foundations-skill";
import {
  COMPONENT_ENTRIES,
  DESIGN_SYSTEM_ITEM,
  componentItem,
  installCommand,
} from "@/lib/design-system/registry-items";
import { registryUrl } from "@/lib/site/registry";

/*
 * The whole design system as one markdown file, written for an agent to load before it builds a
 * Sarj screen. Generated from the same data the /design-system pages render, so a rule changed on
 * the site changes here too — never hand-edit the output, edit data.ts.
 */

function rules(list: Rule[]): string[] {
  return list.map((rule) => `- **${rule.label}** — ${rule.detail}`);
}

function topicsOf(section: DocsSection) {
  return section.groups.flatMap((group) => group.pages);
}

function section(id: string): DocsSection {
  const found = DOCS_SECTIONS.find((item) => item.id === id);
  if (!found) throw new Error(`No design-system section "${id}"`);
  return found;
}

/*
 * Links only ever point into the registry (/r/*): it is the one public path on design.sarj.ai, and
 * the reader of this file is often someone, or an agent, who cannot sign in to the rest of it.
 */
function componentLines(id: string, title: string, description: string) {
  if (!(id in COMPONENT_ENTRIES)) return [`- **${title}** — ${description}`];
  const item = componentItem(id);
  return [
    `- **${title}** — ${description}`,
    `  - Source: ${registryUrl(item)}`,
    `  - Install: \`${installCommand(item)}\``,
  ];
}

/** Joins two data fields as two sentences, whether or not the first already ends in punctuation. */
function sentences(first: string, second: string) {
  return /[.!?:]$/.test(first) ? `${first} ${second}` : `${first}. ${second}`;
}

/** Foundations' own headings start at `##`; under this file's `## Foundations` they sit one level lower. */
function demoted(lines: string[]) {
  return lines.map((line) => (line.startsWith("#") ? `#${line}` : line));
}

const FOUNDATIONS = section("foundations");
const MOTION = section("motion");
const PATTERN_SECTION = section("patterns");
const COMPONENTS = section("product-components");

export const DESIGN_SYSTEM_MD = [
  "---",
  "name: sarj-design-system",
  "description: The whole Sarj design system — tokens, layers, motion, patterns, surfaces and components, plus the lint rules that enforce them. Load before writing any Sarj UI.",
  "---",
  "",
  "# Sarj design system",
  "",
  "- Use the tokens, never a literal colour, size, shadow or z-index.",
  "- Build from the shadcn primitives, never a raw button, input, select or table.",
  "- Sentence case everywhere; never the uppercase class.",
  "- Build only what the ticket names.",
  "",
  "Everything here is published to the public shadcn registry; the docs site itself is private.",
  "",
  `- This file: ${registryUrl(DESIGN_SYSTEM_ITEM)}`,
  `- Install it as a Claude skill: \`${installCommand(DESIGN_SYSTEM_ITEM)}\``,
  "- Each component below is its own registry item — fetch the JSON for its source, or install it with the command beside it.",
  "",

  "## Foundations",
  "",
  FOUNDATIONS.description,
  "",
  ...demoted(foundationsBody()),

  "## Motion",
  "",
  MOTION.description,
  "",
  ...MOTION_RULES.map((rule) => `- **${rule.label}** — ${rule.detail}`),
  "",

  "## Patterns",
  "",
  PATTERN_SECTION.description,
  "",
  ...PATTERNS.flatMap((pattern) => [
    `### ${pattern.title}`,
    "",
    pattern.description,
    "",
    "Must have:",
    "",
    ...rules(pattern.required),
    "",
    ...(pattern.optional.length
      ? ["May have:", "", ...rules(pattern.optional), ""]
      : []),
  ]),
  "### Buttons",
  "",
  ...BUTTON_SIZES.map(
    (note) => `- \`size="${note.size}"\` — ${sentences(note.when, note.why)}`,
  ),
  ...BUTTON_ROLES.map(
    (note) => `- \`variant="${note.variant}"\` (${note.label}) — ${note.when}`,
  ),
  "",
  "### Forms",
  "",
  ...rules(FORM_RULES),
  "",
  "### Tables",
  "",
  ...rules(TABLE_RULES),
  "",
  "### Status chips",
  "",
  ...CHIP_NOTES.map(
    (note) => `- **${note.label}** — \`${note.tone}\`. ${note.why}`,
  ),
  "",
  "### Empty values",
  "",
  ...EMPTY_VALUES.map(
    (note) => `- \`${note.sample}\` — ${sentences(note.when, note.why)}`,
  ),
  "",
  "### Loading",
  "",
  ...rules(LOADING_RULES),
  "",
  "### Empty state",
  "",
  ...rules(EMPTY_STATE_RULES),
  "",
  "### No results",
  "",
  ...rules(NO_RESULTS_RULES),
  "",
  "### Errors",
  "",
  ...rules(ERROR_RULES),
  "",
  "### Pagination",
  "",
  ...rules(PAGINATION_RULES),
  "",

  "## Choosing a surface",
  "",
  ...SURFACE_CHOICES.flatMap((choice) => [
    `### ${choice.title}`,
    "",
    `- **Sits** — ${choice.sits}`,
    `- **Size** — ${choice.size}`,
    `- **Use when** — ${choice.criterion}`,
    `- **Avoid** — ${choice.avoid}`,
    `- **Shape** — ${choice.shape.join("; ")}`,
    "",
  ]),
  "### Rules",
  "",
  ...SURFACE_RULES.map((rule) => `- **${rule.label}** — ${rule.detail}`),
  "",

  "## Components",
  "",
  COMPONENTS.description,
  "",
  ...topicsOf(COMPONENTS).flatMap((topic) =>
    componentLines(topic.id, topic.title, topic.description),
  ),
  "",
].join("\n");
