/**
 * Generate registry.json from the mockups index.
 *
 *   npm run registry
 *
 * Why this is generated and not hand-written: a registry item has to list every
 * file the mockup actually needs, and that list changes every time someone adds
 * an import. Written by hand it goes stale silently — a consumer runs the
 * install and gets a screen that does not compile. So the item is derived from
 * the real import graph: start at the route, follow every local import, and
 * whatever it reaches is what ships.
 *
 * shadcn's own `ui/*` primitives are not copied. They are listed as
 * registryDependencies so the consumer's own CLI installs them from wherever
 * their components.json points — a mockup should not overwrite a shipped
 * Button with this repo's copy of it.
 *
 * The tokens are derived the same way, and for the same reason: a screen that
 * installs without the custom properties it is styled against renders with
 * `bg-primary-tint` resolving to nothing, and nobody finds out until they look.
 *
 * The walk itself lives in lib/import-graph.mjs, shared with `npm run thumbs`.
 */

import { existsSync, writeFileSync } from "node:fs"
import path from "node:path"

import { ROOT, SRC, collect, read, readMockups } from "./lib/import-graph.mjs"

/**
 * One folder for everything this repo installs.
 *
 * Without it a mockup scatters into the consumer's own tree — `icon.tsx` at
 * the root of their components directory, a data file loose in their lib —
 * and a month later nobody can tell which files came from here. shadcn
 * rewrites each file's `@/` imports to wherever its target puts it, so the
 * namespace costs nothing: the installed components still find each other.
 */
const NAMESPACE = "sarj"

/**
 * The custom properties a stock shadcn project already defines.
 *
 * Everything else this repo puts in `:root` is something it added on top, so
 * a consumer will not have it and it has to travel with the item. Listing the
 * stock names rather than the added ones keeps the split honest: add a token
 * to globals.css and it ships automatically, instead of being forgotten here.
 */
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
])

/**
 * Where a file lands in the consumer's project.
 *
 * The `@components`/`@lib` placeholders resolve to whatever that project's
 * components.json calls those directories, so the mockup keeps its folder
 * rather than being flattened into one — the components import each other by
 * relative path and would break.
 */
function placement(file) {
  const rel = path.relative(SRC, file).split(path.sep).join("/")

  if (rel.startsWith("app/")) {
    /* Deliberately not `~/`-prefixed. shadcn joins a `~/` target to the
       project root verbatim, which drops the route beside the app directory
       rather than inside it in any project that keeps its router under src/ —
       a file Next never reads. A bare target goes through the framework
       resolver instead, which lands it at src/app/… where there is a src
       directory and app/… where there is not. */
    return { type: "registry:page", target: rel }
  }
  if (rel === "lib/utils.ts") {
    /* The one exception. This is shadcn's own `cn`, and every ui primitive
       the consumer installs from their own registry imports it from the root
       lib alias — namespace it and their Button stops compiling. */
    return { type: "registry:lib", target: "@lib/utils.ts" }
  }
  if (rel.startsWith("lib/")) {
    return {
      type: "registry:lib",
      target: `@lib/${NAMESPACE}/${rel.slice("lib/".length)}`,
    }
  }
  if (rel.startsWith("hooks/")) {
    return {
      type: "registry:hook",
      target: `@hooks/${NAMESPACE}/${rel.slice("hooks/".length)}`,
    }
  }
  return {
    type: "registry:component",
    target: `@components/${NAMESPACE}/${rel.slice("components/".length)}`,
  }
}

/**
 * Every custom property this repo declares, read out of globals.css.
 *
 * Read rather than copied: a second copy of the palette in this script drifts
 * the first time someone retunes a colour, and the failure is the silent kind
 * — a consumer installs a screen tinted a shade nothing here uses any more.
 */
function readTokens() {
  const css = read(path.join(SRC, "app", "globals.css"))

  const declarations = (header) => {
    /* Every block with this header, not just the first — the stacking scale
       is a second `:root` further down the file, next to the @utility rules
       that read it, and reading only the first silently drops all nine
       layers. */
    const entries = []

    for (let start = css.indexOf(header); start !== -1;) {
      /* Only the block's own closing brace sits at the start of a line — the
         nested at-rules inside it are all indented. */
      const end = css.indexOf("\n}", start)
      const body = css.slice(start, end === -1 ? undefined : end)

      entries.push(
        ...[...body.matchAll(/^\s*--([a-z0-9-]+):\s*([^;]+);/gm)].map(
          ([, name, value]) => [name, value.trim()],
        ),
      )

      start = end === -1 ? -1 : css.indexOf(header, end)
    }

    if (!entries.length) throw new Error(`No tokens in ${header.trim()}`)

    return Object.fromEntries(entries)
  }

  return {
    root: declarations(":root {"),
    theme: declarations("@theme inline {"),
  }
}

/**
 * The added tokens a mockup actually reaches for.
 *
 * Only what it uses ships. A screen that never tints a surface has no business
 * pushing four tint pairs into somebody else's globals.css, and a consumer
 * reading the diff should be able to tell which of them the design needed.
 */
function tokensFor(files, tokens) {
  const source = [...files].map(read).join("\n")

  return Object.keys(tokens.root)
    .filter((name) => !STOCK_TOKENS.has(name))
    .filter((name) =>
      /* A z-layer is worn as its own utility class; everything else is a
         colour, reached through a utility prefix or a var() reference. */
      name.startsWith("z-")
        ? new RegExp(`\\b${name}\\b`).test(source)
        : new RegExp(`(?:--|[a-z]-)${name}\\b`).test(source),
    )
}

/**
 * The `cssVars` and `css` an item carries, from the tokens it uses.
 *
 * Most colours go through `cssVars`: `light` writes the value into the
 * consumer's `:root` and `theme` registers the Tailwind alias, so
 * `bg-primary-tint` becomes a real utility there rather than a class that does
 * nothing. shadcn leaves a property the consumer already defines alone, so
 * this never restyles an app it is installed into.
 *
 * Two families cannot go that way. shadcn re-declares the stacking scale and
 * the chart ramp inside `@theme` as `--z-overlay: var(--z-overlay)` and
 * `--chart-6: var(--chart-6)` — properties defined as themselves, which is
 * junk in somebody's design system and was found by installing this into
 * bulbul rather than by reading the CLI. Both are written as plain CSS
 * instead: the value in `:root`, and for a layer the `@utility` block that
 * reads it, which is what makes `z-overlay` a utility rather than a variable
 * nothing consults.
 */
function styling(names, tokens) {
  const light = {}
  const theme = {}
  const css = {}
  const root = {}

  for (const name of names) {
    if (name.startsWith("z-") || name.startsWith("chart-")) {
      root[`--${name}`] = tokens.root[name]
    } else {
      light[name] = tokens.root[name]
    }

    if (name.startsWith("z-")) {
      css[`@utility ${name}`] = { "z-index": `var(--${name})` }
    }

    /* The Tailwind alias still comes through cssVars — it is what turns the
       property into a utility, and shadcn does not duplicate it. */
    const alias = `color-${name}`
    if (tokens.theme[alias]) theme[alias] = tokens.theme[alias]
  }

  if (Object.keys(root).length) css[":root"] = root

  const cssVars = {}
  if (Object.keys(theme).length) cssVars.theme = theme
  if (Object.keys(light).length) cssVars.light = light

  return { cssVars, css }
}

/**
 * Where a mockup's item starts following imports.
 *
 * The route by default, so a screen ships with the chrome it is drawn inside.
 * A mockup whose deliverable is a single component says so with
 * `registryEntry` in the index, and the item is that component plus whatever
 * it imports — no route file, no shell, nothing the consumer already has.
 */
function entryFor({ slug, registryEntry }) {
  const rel = registryEntry ?? `app/${slug}/page.tsx`

  const entry = path.join(SRC, ...rel.split("/"))
  if (!existsSync(entry)) throw new Error(`No entry for /${slug}: src/${rel}`)
  return entry
}

const tokens = readTokens()

const items = readMockups().map((mockup) => {
  const { files, registryDependencies, dependencies } = collect(
    entryFor(mockup),
  )
  const { cssVars, css } = styling(tokensFor(files, tokens), tokens)

  const tokenCount =
    Object.keys(cssVars.light ?? {}).length +
    Object.keys(css[":root"] ?? {}).length
  console.log(
    `${mockup.slug}: ${files.size} files, ${registryDependencies.size} ui, ${dependencies.size} deps, ${tokenCount} tokens`,
  )

  return {
    name: mockup.slug,
    type: "registry:block",
    title: mockup.title,
    description: mockup.description,
    dependencies: [...dependencies].sort(),
    registryDependencies: [...registryDependencies].sort(),
    files: [...files].sort().map((file) => ({
      path: path.relative(ROOT, file).split(path.sep).join("/"),
      ...placement(file),
    })),
    ...(Object.keys(cssVars).length ? { cssVars } : {}),
    ...(Object.keys(css).length ? { css } : {}),
  }
})

/**
 * Files an item ships that share a basename.
 *
 * shadcn rewrites each installed file's `@/` imports to wherever the target
 * put it, and it matches by basename — so an item carrying both
 * `drawer/icons.tsx` and `list/icons.tsx` installs fine and then compiles
 * against the wrong one. The screen looks installed and is not.
 *
 * This cannot be fixed from here, only reported: the resolution is to give the
 * files distinct names in the mockup itself. Warn rather than throw, so one
 * mockup with a clash does not block publishing the other twelve.
 */
function clashes(item) {
  const byBasename = new Map()

  for (const file of item.files) {
    const basename = file.path.split("/").pop()
    byBasename.set(basename, [...(byBasename.get(basename) ?? []), file.path])
  }

  return [...byBasename.values()].filter((paths) => paths.length > 1)
}

for (const item of items) {
  for (const paths of clashes(item)) {
    console.warn(
      `  ! ${item.name}: ${paths.length} files named ${paths[0].split("/").pop()} — shadcn resolves imports by basename and will wire one of these to the other:\n      ${paths.join("\n      ")}`,
    )
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
)

console.log(`\nWrote registry.json — ${items.length} items`)
