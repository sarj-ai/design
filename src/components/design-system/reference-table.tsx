import * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type ReferenceColumn = {
  header: string
  /** A literal width class: Tailwind only emits utilities it sees spelled out. Omit on the column that takes the remaining width. */
  width?: string
}

export type ReferenceRow = {
  key: string
  cells: React.ReactNode[]
}

export function ReferenceTable({
  columns,
  rows,
}: {
  columns: ReferenceColumn[]
  rows: ReferenceRow[]
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      {/* table-fixed so a long cell cannot widen its column past the declared width. */}
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {columns.map((column) => (
              <TableHead
                className={cn(
                  "h-11 px-4 text-xs font-medium text-muted-foreground",
                  column.width,
                )}
                key={column.header}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key}>
              {row.cells.map((cell, index) => (
                <TableCell
                  /* `whitespace-normal` undoes the primitive's nowrap so prose stays inside the declared width. */
                  className="px-4 py-3.5 align-top whitespace-normal"
                  key={columns[index]?.header ?? index}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function ReferenceName({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-sm">{children}</span>
}

export function ReferenceLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium">{children}</span>
}

export function ReferenceNote({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm leading-relaxed text-muted-foreground">
      {children}
    </span>
  )
}
