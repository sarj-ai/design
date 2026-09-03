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

/**
 * The one table every reference list on this page is built from.
 *
 * Nearly all of them are the same three things — a specimen, its name, and
 * what it is for — and they had drifted into five different two-column grids
 * that each aligned slightly differently. One component means one row height,
 * one header treatment, and one place to change any of it.
 *
 * Cells take nodes, not strings, so a live demo sits in a column beside the
 * prose rather than in a separate block underneath it.
 */

export type ReferenceColumn = {
  header: string
  /**
   * A literal width class — Tailwind only emits a utility it can see spelled
   * out. Leave it off the column that should take the remaining width.
   */
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
      {/* Fixed layout, because the widths above are the whole point: with the
          default auto layout a long cell quietly widens its column and every
          table on the page ends up with its own proportions. */}
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
                  /* `whitespace-normal` undoes the primitive's nowrap, which
                     is right for a data row and wrong here — it lets prose
                     push a column past the width declared for it. */
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

/**
 * A name in the column that names things — but only when the name is something
 * you type: a token, a class, a variant, a component. Mono is what says "this
 * is a literal", so spending it on an English word spends it for nothing.
 */
export function ReferenceName({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-sm">{children}</span>
}

/** The same column when the name is a word rather than a literal. */
export function ReferenceLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium">{children}</span>
}

/** The prose column. Muted, because the name and the specimen lead. */
export function ReferenceNote({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm leading-relaxed text-muted-foreground">
      {children}
    </span>
  )
}
