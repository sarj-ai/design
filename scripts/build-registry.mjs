import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createJiti } from "jiti";

import { ROOT, SRC, collect, read, readMockups } from "./lib/import-graph.mjs";

/*
 * The design system's own items are described in TypeScript (src/lib/design-system), so load it
 * through jiti — already installed with Tailwind — with the `@/` alias the app uses.
 */
const jiti = createJiti(import.meta.url, { alias: { "@": SRC } });
const { DESIGN_SYSTEM_MD } = await jiti.import(
  path.join(SRC, "lib/design-system/design-system-md.ts"),
);
const { DOCS_SECTIONS } = await jiti.import(
  path.join(SRC, "lib/design-system/data.ts"),
);
const {
  COMPONENT_ENTRIES,
  DESIGN_SYSTEM_ITEM,
  DESIGN_SYSTEM_TARGET,
  componentItem,
} = await jiti.import(path.join(SRC, "lib/design-system/registry-items.ts"));

const NAMESPACE = "sarj";

// List the stock names, not the added ones, so a token added to globals.css ships automatically.
const STOCK_TOKENS = new Set([
  "radius",
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
]);

function placement(file) {
  const rel = path.relative(SRC, file).split(path.sep).join("/");

  if (rel.startsWith("app/")) {
    /* Not `~/`-prefixed: shadcn joins a `~/` target to the project root verbatim, so it misses src/app.
       Route groups are stripped: they never reach a URL. */
    return { type: "registry:page", target: rel.replace(/\([^/]+\)\//g, "") };
  }
  if (rel === "lib/utils.ts") {
    // shadcn's own `cn`: the consumer's primitives import it from the root lib alias, so it is not namespaced.
    return { type: "registry:lib", target: "@lib/utils.ts" };
  }
  if (rel.startsWith("lib/")) {
    return {
      type: "registry:lib",
      target: `@lib/${NAMESPACE}/${rel.slice("lib/".length)}`,
    };
  }
  if (rel.startsWith("hooks/")) {
    return {
      type: "registry:hook",
      target: `@hooks/${NAMESPACE}/${rel.slice("hooks/".length)}`,
    };
  }
  return {
    type: "registry:component",
    target: `@components/${NAMESPACE}/${rel.slice("components/".length)}`,
  };
}

function readTokens() {
  const css = read(path.join(SRC, "app", "globals.css"));

  const declarations = (header) => {
    // Every `:root` block, not just the first: the z-layer scale is a second one further down.
    const entries = [];

    for (let start = css.indexOf(header); start !== -1;) {
      // Only the block's own closing brace sits at column 0; nested at-rules are indented.
      const end = css.indexOf("\n}", start);
      const body = css.slice(start, end === -1 ? undefined : end);

      entries.push(
        ...[...body.matchAll(/^\s*--([a-z0-9-]+):\s*([^;]+);/gm)].map(
          ([, name, value]) => [name, value.trim()],
        ),
      );

      start = end === -1 ? -1 : css.indexOf(header, end);
    }

    if (!entries.length) throw new Error(`No tokens in ${header.trim()}`);

    return Object.fromEntries(entries);
  };

  return {
    root: declarations(":root {"),
    theme: declarations("@theme inline {"),
  };
}

function tokensFor(files, tokens) {
  const source = [...files].map(read).join("\n");

  return Object.keys(tokens.root)
    .filter((name) => !STOCK_TOKENS.has(name))
    .filter((name) =>
      name.startsWith("z-")
        ? new RegExp(`\\b${name}\\b`).test(source)
        : new RegExp(`(?:--|[a-z]-)${name}\\b`).test(source),
    );
}

// Z-layers and the chart ramp go as plain CSS, not cssVars: shadcn re-declares those inside @theme
// as self-references (`--z-overlay: var(--z-overlay)`).
function styling(names, tokens) {
  const light = {};
  const theme = {};
  const css = {};
  const root = {};

  for (const name of names) {
    if (name.startsWith("z-") || name.startsWith("chart-")) {
      root[`--${name}`] = tokens.root[name];
    } else {
      light[name] = tokens.root[name];
    }

    if (name.startsWith("z-")) {
      css[`@utility ${name}`] = { "z-index": `var(--${name})` };
    }

    // The Tailwind alias still goes through cssVars; shadcn does not duplicate it.
    const alias = `color-${name}`;
    if (tokens.theme[alias]) theme[alias] = tokens.theme[alias];
  }

  if (Object.keys(root).length) css[":root"] = root;

  const cssVars = {};
  if (Object.keys(theme).length) cssVars.theme = theme;
  if (Object.keys(light).length) cssVars.light = light;

  return { cssVars, css };
}

function entryFor({ slug, registryEntry }) {
  const rel = registryEntry ?? `app/(mockups)/${slug}/page.tsx`;

  const entry = path.join(SRC, ...rel.split("/"));
  if (!existsSync(entry)) throw new Error(`No entry for /${slug}: src/${rel}`);
  return entry;
}

const tokens = readTokens();

/** One installable block: an entry file and everything it imports, with the tokens those files use. */
function blockItem({ name, title, description, entry }) {
  const { files, registryDependencies, dependencies } = collect(entry);
  const { cssVars, css } = styling(tokensFor(files, tokens), tokens);

  const tokenCount =
    Object.keys(cssVars.light ?? {}).length +
    Object.keys(css[":root"] ?? {}).length;
  console.log(
    `${name}: ${files.size} files, ${registryDependencies.size} ui, ${dependencies.size} deps, ${tokenCount} tokens`,
  );

  return {
    name,
    type: "registry:block",
    title,
    description,
    dependencies: [...dependencies].sort(),
    registryDependencies: [...registryDependencies].sort(),
    files: [...files].sort().map((file) => ({
      path: path.relative(ROOT, file).split(path.sep).join("/"),
      ...placement(file),
    })),
    ...(Object.keys(cssVars).length ? { cssVars } : {}),
    ...(Object.keys(css).length ? { css } : {}),
  };
}

const mockupItems = readMockups().map((mockup) =>
  blockItem({
    name: mockup.slug,
    title: mockup.title,
    description: mockup.description,
    entry: entryFor(mockup),
  }),
);

/* Every Components topic's demo, so someone who cannot open the docs site can still get the source. */
const topics = new Map(
  DOCS_SECTIONS.flatMap((section) =>
    section.groups.flatMap((group) => group.pages),
  ).map((page) => [page.id, page]),
);

const componentItems = Object.entries(COMPONENT_ENTRIES).map(([id, rel]) => {
  const topic = topics.get(id);
  if (!topic)
    throw new Error(
      `COMPONENT_ENTRIES names "${id}", which is not a docs topic`,
    );
  const entry = path.join(SRC, ...rel.split("/"));
  if (!existsSync(entry)) throw new Error(`No entry for ${id}: src/${rel}`);
  return blockItem({
    name: componentItem(id),
    title: topic.title,
    description: topic.description,
    entry,
  });
});

/* The whole-system markdown, written to a file so shadcn build can embed it, and installed as a skill. */
const skillPath = path.join(ROOT, "registry", DESIGN_SYSTEM_ITEM, "SKILL.md");
mkdirSync(path.dirname(skillPath), { recursive: true });
writeFileSync(
  skillPath,
  DESIGN_SYSTEM_MD.endsWith("\n") ? DESIGN_SYSTEM_MD : `${DESIGN_SYSTEM_MD}\n`,
);
console.log(
  `${DESIGN_SYSTEM_ITEM}: ${DESIGN_SYSTEM_MD.length} characters of markdown`,
);

const designSystemItem = {
  name: DESIGN_SYSTEM_ITEM,
  type: "registry:item",
  title: "Sarj design system",
  description:
    "The whole Sarj design system as one markdown file — tokens, layers, motion, patterns, surfaces, components and the lint rules — installed as a Claude skill.",
  files: [
    {
      path: path.relative(ROOT, skillPath).split(path.sep).join("/"),
      type: "registry:file",
      target: DESIGN_SYSTEM_TARGET,
    },
  ],
};

const items = [designSystemItem, ...componentItems, ...mockupItems];

// shadcn rewrites `@/` imports by basename, so two shipped files sharing one compile against the wrong file.
function clashes(item) {
  const byBasename = new Map();

  for (const file of item.files) {
    const basename = file.path.split("/").pop();
    byBasename.set(basename, [...(byBasename.get(basename) ?? []), file.path]);
  }

  return [...byBasename.values()].filter((paths) => paths.length > 1);
}

for (const item of items) {
  if (item.type !== "registry:block") continue;
  for (const paths of clashes(item)) {
    console.warn(
      `  ! ${item.name}: ${paths.length} files named ${paths[0].split("/").pop()} — shadcn resolves imports by basename and will wire one of these to the other:\n      ${paths.join("\n      ")}`,
    );
  }
}

writeFileSync(
  path.join(ROOT, "registry.json"),
  `${JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "design-lab",
      homepage: "https://design.sarj.ai",
      items,
    },
    null,
    2,
  )}\n`,
);

console.log(`\nWrote registry.json — ${items.length} items`);
