import { RuleList } from "@/components/design-system/rule-list"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PAGINATION_RULES } from "@/lib/design-system-data"

/**
 * The row that sits under a table, and the rules it follows.
 *
 * Two controls on one line: the page size at the start, the cursor at the end.
 * They are one decision — "how much of this list do I want in front of me" —
 * so they share a row rather than sitting at opposite ends of the page.
 *
 * No page numbers. A list that is being written to while it is read cannot
 * promise that page four holds the same rows twice, and a numbered control
 * makes exactly that promise.
 */
export function PaginationPreview() {
  return (
    <div className="flex flex-col gap-8">
      {/* A muted inset, not a bordered box: the pane already puts this in a
          Card, and the row is a specimen rather than a surface of its own. */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select defaultValue="25">
            <SelectTrigger className="w-20" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* `w-auto mx-0` undoes the primitive's centred full-width block: it
            defaults to standing alone under a page, and here it is one half of
            a row that has something at its other end. */}
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <RuleList rules={PAGINATION_RULES} />
    </div>
  )
}
