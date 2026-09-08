import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/data-table"
import { RuleList } from "@/components/design-system/rule-list"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { CALL_ROWS, TABLE_RULES } from "@/lib/design-system-data"

/**
 * The table shape, running, above the rules that describe it.
 *
 * It renders through `DataTable` rather than through `Table` with the class
 * strings written out, because the class strings are the failure: every table
 * that repeats them inline is one nobody can hold in place, and the next table
 * starts from whichever neighbour happened to get copied. The demo is the
 * primitive so that reading this page and using it are the same act.
 *
 * Four columns out of the ten the call list has. The point here is the band,
 * the row height and the end-aligned numbers — a full-width replica of the
 * index page would be that page again, one topic earlier.
 */
export function TableAnatomy() {
  return (
    <div className="flex flex-col gap-8">
      <DataTable>
        <TableBody>
          <DataTableHeaderRow>
            <DataTableHead>Call</DataTableHead>
            <DataTableHead>Customer</DataTableHead>
            {/* The header end-aligns with the digits under it. A number column
                whose label sits at the other edge is the most common way a
                conforming table still reads as unfinished. */}
            <DataTableHead className="w-32 text-end">Duration</DataTableHead>
            <DataTableHead className="w-24 text-end">Cost</DataTableHead>
          </DataTableHeaderRow>

          {CALL_ROWS.slice(0, 4).map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.id}</TableCell>
              <TableCell>{row.customer}</TableCell>
              <TableCell className="text-end tabular-nums">
                {row.duration === null ? (
                  /* The em dash from the empty-cell vocabulary: a call that
                     never connected cannot have a duration, so nothing is
                     missing and nothing is said. */
                  <span className="text-muted-foreground">—</span>
                ) : (
                  formatDuration(row.duration)
                )}
              </TableCell>
              <TableCell className="text-end tabular-nums">
                {row.cost === null ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  `$${row.cost.toFixed(2)}`
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>

      <RuleList rules={TABLE_RULES} />
    </div>
  )
}

/** Minutes and seconds, zero-padded, so the column compares by place value. */
function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`
}
