"use client"

import { RuleList } from "@/components/design-system/rule-list"
import { ListFooter } from "@/components/shared/list-footer"
import { PAGINATION_RULES } from "@/lib/design-system/data"

/**
 * The row that sits under a table, and the rules it follows.
 *
 * The count and the page size at the start, the cursor at the end — the
 * product's scenarios list, as the shared ListFooter block.
 *
 * No page numbers. A list that is being written to while it is read cannot
 * promise that page four holds the same rows twice, and a numbered control
 * makes exactly that promise. First is a cursor move, back to the start.
 */
export function PaginationPreview() {
  return (
    <div className="flex flex-col gap-8">
      <ListFooter
        from={1}
        shown={10}
        total={12}
        noun="scenarios"
        pageSize={10}
      />
      <RuleList rules={PAGINATION_RULES} />
    </div>
  )
}
