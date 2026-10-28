import {
  DOCS_SECTIONS,
  type DocsPage,
  type DocsSection,
} from "@/lib/design-system/data"

export const DOCS_ROOT = "/design-system"

const SECTION_OF = new Map<string, string>(
  DOCS_SECTIONS.flatMap((section) =>
    section.groups.flatMap((group) =>
      group.pages.map((page) => [page.id, section.id] as const),
    ),
  ),
)

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

export function docsHref(id: string): string {
  const sectionId = SECTION_OF.get(id)

  return sectionId ? `${DOCS_ROOT}/${sectionId}/${id}` : DOCS_ROOT
}

export function docsPage(id: string): DocsPage | undefined {
  return PAGE_OF.get(id)
}

export function sectionHref(id: string): string {
  return SECTION_BY_ID.has(id) ? `${DOCS_ROOT}/${id}` : DOCS_ROOT
}

type DocsLocation = {
  section: DocsSection | null
  page: DocsPage | null
  activeId: string
}

export function resolveDocs(slug?: string[]): DocsLocation | null {
  if (!slug?.length) return { activeId: "", page: null, section: null }

  const [sectionId, pageId, ...rest] = slug
  if (rest.length) return null

  const section = SECTION_BY_ID.get(sectionId)
  if (!section) return null

  if (!pageId) return { activeId: section.id, page: null, section }

  // The topic must be filed under this section, or /motion/colour would render colour under Motion.
  if (SECTION_OF.get(pageId) !== sectionId) return null

  const page = PAGE_OF.get(pageId)
  if (!page) return null

  return { activeId: page.id, page, section }
}

export function docsParams(): { slug: string[] | undefined }[] {
  return [
    { slug: undefined },
    ...DOCS_SECTIONS.map((section) => ({ slug: [section.id] })),
    ...DOCS_SECTIONS.flatMap((section) =>
      section.groups.flatMap((group) =>
        group.pages.map((page) => ({ slug: [section.id, page.id] })),
      ),
    ),
  ]
}
