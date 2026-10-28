import { linearIssueUrl } from "@/lib/site/linear"
import { MOCKUPS, searchMockups, surfaceLabel } from "@/lib/site/mockups-data"
import { DEFAULT_CWD } from "@/lib/site/registry"
import thumbnails from "@/lib/site/thumbnails.json"

import registryJson from "../../../registry.json"

/* Lives in site/registry.ts so index cards can use it without bundling the registry. */
export { DEFAULT_CWD }

type RegistryFile = {
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

/* Cast: inference reads the generated JSON as a union, and optional `cssVars` widens it into something unreadable. */
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
  page: string
  thumbnail: string | null
  registry: string
  item: RegistryItem | null
}

/** The origin is passed in so a localhost server hands out localhost URLs, not production ones. */
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

/** `yes n` is load-bearing: unattended, shadcn's per-file overwrite prompts otherwise go unanswered and nothing is written. */
export function installCommand(
  design: Design,
  cwd: string = DEFAULT_CWD,
): string {
  return `yes n | npx shadcn@latest add ${design.registry} --cwd ${cwd} --yes`
}

export function addedTokens() {
  const light: Record<string, string> = {}
  const theme: Record<string, string> = {}
  const css: Record<string, Record<string, string>> = {}

  for (const item of ITEMS) {
    Object.assign(light, item.cssVars?.light ?? {})
    Object.assign(theme, item.cssVars?.theme ?? {})

    for (const [selector, block] of Object.entries(item.css ?? {})) {
      /* Merge, don't replace: every item declares its own `:root`. */
      css[selector] = { ...(css[selector] ?? {}), ...block }
    }
  }

  return { light, theme, css }
}
