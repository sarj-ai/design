import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table"
import { RuleList } from "@/components/design-system/rule-list"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { CALL_ROWS, TABLE_RULES } from "@/lib/design-system/data"

export function TableAnatomy() {
  return (
    <div className="flex flex-col gap-8">
      <DataTable>
        <TableBody>
          <DataTableHeaderRow>
            <DataTableHead>Call</DataTableHead>
            <DataTableHead>Customer</DataTableHead>
            <DataTableHead className="w-32 text-end">Duration</DataTableHead>
            <DataTableHead className="w-24 text-end">Cost</DataTableHead>
          </DataTableHeaderRow>

          {CALL_ROWS.slice(0, 4).map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.id}</TableCell>
              <TableCell>{row.customer}</TableCell>
              <TableCell className="text-end tabular-nums">
                {row.duration === null ? (
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

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`
}
