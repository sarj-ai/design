/**
 * Addresses for the design system.
 *
 * Every topic in `DOCS_SECTIONS` is a real URL rather than a client-side tab,
 * so a page can be sent to someone. There are two shapes:
 *
 *   /design-system                       the overview — every topic listed
 *   /design-system/<section>/<page>      one topic
 *
 * A section is not one of them. It is a shelf in the rail, and clicking it
 * opens the shelf — so `/design-system/<section>` is a 404 rather than a page
 * listing what the rail is already listing one row below.
 *
 * Nested rather than flat because a bare `/design-system/data` does not say
 * whether it is the shadcn shelf or something about tables, and a link is read
 * before it is opened. The section segment answers that in the address bar.
 *
 * Derived from `DOCS_SECTIONS` rather than listed again here: the rail and the
 * routes are the same tree, and two copies of it would drift the first time a
 * topic moved between sections.
 */

import {
  DOCS_SECTIONS,
  type DocsPage,
  type DocsSection,
} from "@/lib/design-system-data"

export const DOCS_ROOT = "/design-system"

/** Topic id → the section it is filed under. */
const SECTION_OF = new Map<string, string>(
  DOCS_SECTIONS.flatMap((section) =>
    section.groups.flatMap((group) =>
      group.pages.map((page) => [page.id, section.id] as const),
    ),
  ),
)

/** Topic id → the topic, for turning a slug back into a title. */
const PAGE_OF = new Map<string, DocsPage>(
  DOCS_SECTIONS.flatMap((section) =>
    section.groups.flatMap((group) =>
      group.pages.map((page) => [page.id, page] as const),
    ),
  ),
)

const SECTION_BY_ID = new Map<string, DocsSection>(
  DOCS_SECTIONS.map((section) => [section.id, section]),
)

/** The URL for one topic. */
export function docsHref(id: string): string {
  const sectionId = SECTION_OF.get(id)

  /* A topic with no section cannot be addressed, so it falls back to the
     overview rather than minting a URL that 404s. */
  return sectionId ? `${DOCS_ROOT}/${sectionId}/${id}` : DOCS_ROOT
}

/** What a URL resolves to. `page` is null on the overview. */
export type DocsLocation = {
  section: DocsSection | null
  page: DocsPage | null
  /** What the rail marks as current: a topic id, or "" on the overview. */
  activeId: string
}

/**
 * Turn the catch-all segments into a location, or null if they name nothing.
 *
 * A null is a 404 rather than a redirect to the overview: a link that silently
 * lands somewhere else is worse than one that says it is broken, because the
 * sender never finds out they sent the wrong thing.
 */
export function resolveDocs(slug?: string[]): DocsLocation | null {
  if (!slug?.length) return { activeId: "", page: null, section: null }

  const [sectionId, pageId, ...rest] = slug
  if (rest.length) return null

  const section = SECTION_BY_ID.get(sectionId)
  if (!section) return null

  /* A section has no page of its own: the rail opens it in place. */
  if (!pageId) return null

  /* The topic has to be under this section, not merely exist: without the
     check, `/design-system/motion/colour` would render the colour page under
     a heading that says Motion. */
  if (SECTION_OF.get(pageId) !== sectionId) return null

  const page = PAGE_OF.get(pageId)
  if (!page) return null

  return { activeId: page.id, page, section }
}

/** Every address the docs answer to, for `generateStaticParams`. */
export function docsParams(): { slug: string[] | undefined }[] {
  return [
    { slug: undefined },
    ...DOCS_SECTIONS.flatMap((section) =>
      section.groups.flatMap((group) =>
        group.pages.map((page) => ({ slug: [section.id, page.id] })),
      ),
    ),
  ]
}
