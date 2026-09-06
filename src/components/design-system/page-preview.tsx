"use client"

import { CallTable } from "@/components/design-system/call-table"

/**
 * The index page as the page itself, not a picture of one.
 *
 * A wireframe of a table teaches nothing a sentence does not, so the content
 * here is the real list table: sortable, searchable, and carrying the same
 * no-results state a reviewer would hit in the product.
 *
 * No title and description over it. On a real route those come from the shell,
 * so here they were a caption on a demo rather than part of the pattern being
 * shown — and the topic's own heading already says what this is.
 */
export function IndexPagePreview() {
  return <CallTable />
}
