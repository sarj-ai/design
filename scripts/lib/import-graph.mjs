/**
 * The index, and the import graph behind each mockup on it.
 *
 * Two scripts need exactly this and must not disagree about it: `npm run
 * registry` publishes the files a mockup reaches, and `npm run thumbs`
 * fingerprints the same files to know when a screenshot has gone stale. Two
 * copies of the walk would drift, and both failures are silent — a consumer
 * installs a screen that does not compile, or a reviewer trusts a thumbnail of
 * a design that no longer exists.
 */

import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import process from "node:process"

export const ROOT = process.cwd()
export const SRC = path.join(ROOT, "src")

/** Packages that come with the framework, never a registry dependency. */
const FRAMEWORK = new Set(["react", "react-dom"])

export function read(file) {
  return readFileSync(file, "utf8")
}

/** Every module specifier in a file — covers import, export-from and type-only. */
function specifiers(code) {
  return [...code.matchAll(/from\s+"([^"]+)"/g)].map((match) => match[1])
}

/** The npm package a bare specifier belongs to, scope included. */
function packageName(specifier) {
  const parts = specifier.split("/")
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
}

/** Resolve a local specifier to a file on disk, trying the usual extensions. */
function resolve(specifier, fromFile) {
  const base = specifier.startsWith("@/")
    ? path.join(SRC, specifier.slice(2))
    : path.resolve(path.dirname(fromFile), specifier)

  for (const candidate of [
    base,
    `${base}.tsx`,
    `${base}.ts`,
    path.join(base, "index.tsx"),
    path.join(base, "index.ts"),
  ]) {
    if (existsSync(candidate) && !candidate.endsWith(path.sep)) {
      try {
        if (readFileSync(candidate)) return candidate
      } catch {
        /* a directory — keep looking */
      }
    }
  }

  return null
}

/** Walk every local import reachable from an entry, collecting what it needs. */
export function collect(entry) {
  const files = new Set()
  const registryDependencies = new Set()
  const dependencies = new Set()
  const queue = [entry]

  while (queue.length) {
    const file = queue.shift()
    if (files.has(file)) continue
    files.add(file)

    for (const specifier of specifiers(read(file))) {
      if (specifier.startsWith("@/components/ui/")) {
        registryDependencies.add(specifier.slice("@/components/ui/".length))
        continue
      }

      if (specifier.startsWith("@/") || specifier.startsWith(".")) {
        const resolved = resolve(specifier, file)
        if (resolved) queue.push(resolved)
        else console.warn(`  ! unresolved import ${specifier} in ${file}`)
        continue
      }

      if (
        specifier.startsWith("next/") ||
        FRAMEWORK.has(packageName(specifier))
      ) {
        continue
      }

      dependencies.add(packageName(specifier))
    }
  }

  return { files, registryDependencies, dependencies }
}

/**
 * The mockups on the index, in the order they are listed there.
 *
 * The index is the source of truth for which mockups exist and what they are
 * called, so nothing generated from it can drift from the cards on the landing
 * page.
 */
export function readMockups() {
  const source = read(path.join(SRC, "lib/mockups-data.ts"))

  const entries = [
    ...source.matchAll(
      /href:\s*"\/([^"]+)",\s*\n\s*title:\s*"([^"]+)",\s*\n\s*meta:\s*"[^"]*",\s*\n(?:\s*surface:\s*(?:"[^"]*"|null),\s*\n)?\s*description:\s*\n?\s*"([^"]+)"/g,
    ),
  ]

  if (!entries.length) throw new Error("No mockups found in mockups-data.ts")

  return entries.map(([, slug, title, description]) => {
    /* `registryEntry` is per-entry, so it is read from that entry's own block
       rather than from the file. */
    const start = source.indexOf(`href: "/${slug}"`)
    const next = source.indexOf('href: "/', start + 1)
    const block = source.slice(start, next === -1 ? undefined : next)
    const override = block.match(/registryEntry:\s*"([^"]+)"/)

    return { slug, title, description, registryEntry: override?.[1] }
  })
}

/** A mockup's route file, which is what a reader sees and what gets shot. */
export function routeFile(slug) {
  const file = path.join(SRC, "app", slug, "page.tsx")
  if (!existsSync(file)) throw new Error(`No route for /${slug}`)
  return file
}
