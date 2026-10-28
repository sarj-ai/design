"use client"

import { RuleList } from "@/components/design-system/rule-list"
import { ListFooter } from "@/components/shared/list-footer"
import { PAGINATION_RULES } from "@/lib/design-system/data"

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
