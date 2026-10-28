import * as React from "react"

import { Table, TableHead, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

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
