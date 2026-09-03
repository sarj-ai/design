"use client"

import { Button } from "@/components/ui/button"
import { CallTable } from "@/components/design-system/call-table"

/**
 * The index page as the page itself, not a picture of one.
 *
 * A wireframe of a table teaches nothing a sentence does not, so the content
 * here is the real list table: sortable, searchable, and carrying the same
 * no-results state a reviewer would hit in the product.
 */
export function IndexPagePreview() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-semibold">Calls</span>
          <span className="text-sm text-muted-foreground">
            Every call across your scenarios.
          </span>
        </div>
        <Button size="sm">Start call</Button>
      </div>

      <CallTable />
    </div>
  )
}
