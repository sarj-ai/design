import * as React from "react"

import { Table, TableHead, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

/**
 * The table shape the platform-consistency pass settled on, taken verbatim
 * from `vnagar/platform-consistency` in `bulbul`:
 *
 *  - a bordered, radiused container with no padding of its own, so the header
 *    band reaches the edge instead of floating inside an inset;
 *  - a shaded header row that stays shaded on hover, so the band reads as
 *    chrome rather than a row you can click;
 *  - header labels at full-strength foreground and semibold, not muted;
 *  - a fixed 40px row on 16px cell padding, so rows do not grow with their
 *    content and the header lines up with the body.
 *
 * On that branch only `call-activity-table.tsx` had been brought across — the
 * trunk assignments and provisioned tables were still on plain `<TableHead>`
 * inside a `rounded-md border`. All three use it here.
 */
export function DataTable({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table className={cn("[&_td]:h-10 [&_td]:px-4 [&_th]:px-4", className)}>
        {children}
      </Table>
    </div>
  )
}

export function DataTableHeaderRow({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TableRow className="bg-muted/50 hover:bg-muted/50">{children}</TableRow>
  )
}

export function DataTableHead({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <TableHead className={cn("font-semibold text-foreground", className)}>
      {children}
    </TableHead>
  )
}
