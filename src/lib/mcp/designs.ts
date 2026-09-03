/**
 * Every mockup, as one record an agent working in another repo can act on.
 *
 * Answering "install the design for DES-173" needs both of this repo's
 * sources and neither is enough alone. The index knows which Linear ticket a
 * mockup answers and what surface it redesigns; the generated registry knows
 * what installing it actually does — which files, which primitives, which
 * tokens. They join on the slug, which is the one identifier everything here
 * already keys off.
 */

import { linearIssueUrl } from "@/lib/linear"
import { MOCKUPS, searchMockups, surfaceLabel } from "@/lib/mockups-data"
import thumbnails from "@/lib/thumbnails.json"

import registryJson from "../../../registry.json"

/**
 * Where bulbul keeps its frontend package.
 *
 * shadcn resolves every alias from the nearest components.json, so pointing
 * `--cwd` at the package is what keeps an install inside `@sarj/app` rather
 * than scattering files across the monorepo root.
 */
export const DEFAULT_CWD = "typescript/packages/app"

export type RegistryFile = {
  path: string
  type: string
  target: string
}

export type RegistryItem = {
  name: string
  title: string
  description: string
  dependencies: string[]
  registryDependencies: string[]
  files: RegistryFile[]
  cssVars?: {
    theme?: Record<string, string>
    light?: Record<string, string>
  }
  css?: Record<string, Record<string, string>>
}

/* Cast rather than trust inference: TypeScript reads the generated file as a
   union of the shapes it happens to contain, and `cssVars` is optional, so
   every item that carries one would widen the type into something nothing can
   be read off. */
const ITEMS = (registryJson as unknown as { items: RegistryItem[] }).items

const FINGERPRINTS: Record<string, string> = thumbnails.fingerprints

export type Design = {
  slug: string
  title: string
  description: string
  /** Shape and state, e.g. "Drawer · in progress". */
  meta: string
  surface: string
  tickets: { id: string; url: string }[]
  /** The live mockup, for a reader who wants to look before installing. */
  page: string
  thumbnail: string | null
  /** The registry item, which is also the install URL. */
  registry: string
  item: RegistryItem | null
}

/**
 * The join, done once per request against the origin the request arrived on.
 *
 * The origin is passed in rather than read from a constant so that a server
 * running on localhost hands out localhost URLs. An install command that
 * silently points at production is the kind of thing you only notice after
 * wondering why your edits had no effect.
 */
export function designs(origin: string): Design[] {
  return MOCKUPS.map((mockup) => {
    const slug = mockup.href.replace(/^\//, "")
    const fingerprint = FINGERPRINTS[slug]

    return {
      slug,
      title: mockup.title,
      description: mockup.description,
      meta: mockup.meta,
      surface: surfaceLabel(mockup.surface),
      tickets: mockup.tickets.map((id) => ({ id, url: linearIssueUrl(id) })),
      page: `${origin}/${slug}`,
      thumbnail: fingerprint
        ? `${origin}/thumbs/${slug}.webp?v=${fingerprint}`
        : null,
      registry: `${origin}/r/${slug}.json`,
      item: ITEMS.find((item) => item.name === slug) ?? null,
    }
  })
}

export function getDesign(slug: string, origin: string): Design | undefined {
  return designs(origin).find((design) => design.slug === slug)
}

/**
 * Resolve whatever an engineer said into designs.
 *
 * A Linear identifier and a slug are exact and win outright — asked for
 * DES-173 you want DES-173, not the four designs that mention it in passing.
 * Everything else falls through to the same weighted search the index uses,
 * so the MCP and the landing page rank alike.
 */
export function findDesigns(query: string, origin: string): Design[] {
  const all = designs(origin)
  const needle = query.trim().toLowerCase()
  if (!needle) return all

  const exact = all.filter(
    (design) =>
      design.slug === needle ||
      design.tickets.some((ticket) => ticket.id.toLowerCase() === needle),
  )
  if (exact.length) return exact

  const ranked = searchMockups(query)
  return ranked.flatMap((mockup) => {
    const slug = mockup.href.replace(/^\//, "")
    const design = all.find((entry) => entry.slug === slug)
    return design ? [design] : []
  })
}

/**
 * The command that installs a design.
 *
 * One command, because the whole point is that nobody assembles it by hand.
 *
 * The `yes n` is load-bearing, not decoration. shadcn asks before touching any
 * file the project already has, once per file, and a mockup lists every
 * primitive it uses — so an unattended run meets a dozen prompts, answers none
 * of them, and exits having written nothing. Answering no to all of them is
 * the behaviour you want anyway: keep the consumer's components, write only
 * what is new.
 */
export function installCommand(
  design: Design,
  cwd: string = DEFAULT_CWD,
): string {
  return `yes n | npx shadcn@latest add ${design.registry} --cwd ${cwd} --yes`
}

/**
 * Everything this repo's designs need on top of a stock shadcn palette.
 *
 * Derived by unioning what the items carry rather than re-reading globals.css:
 * a token no design uses is a token nobody installing a design needs.
 */
export function addedTokens() {
  const light: Record<string, string> = {}
  const theme: Record<string, string> = {}
  const css: Record<string, Record<string, string>> = {}

  for (const item of ITEMS) {
    Object.assign(light, item.cssVars?.light ?? {})
    Object.assign(theme, item.cssVars?.theme ?? {})

    for (const [selector, block] of Object.entries(item.css ?? {})) {
      /* Merge the block rather than replace it: every item that uses a
         stacking layer declares its own `:root`, and assigning them over each
         other keeps only the last item's layers. */
      css[selector] = { ...(css[selector] ?? {}), ...block }
    }
  }

  return { light, theme, css }
}
