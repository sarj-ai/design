import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BACKDROP_ROWS } from "@/lib/mockups/custom-toasts-data";

/** The Scenarios index the toasts land on. Long enough to scroll rows under the glass. */
export function ScenariosIndex() {
  return (
    <div className="flex flex-col gap-6 p-6 pb-40">
      <PageHeader
        description="Every call flow your agents run."
        title="Scenarios"
      />
      <DataTable>
        <TableHeader>
          <DataTableHeaderRow>
            <DataTableHead>Name</DataTableHead>
            <DataTableHead>Status</DataTableHead>
            <DataTableHead className="text-end">Calls</DataTableHead>
            <DataTableHead>Last call</DataTableHead>
          </DataTableHeaderRow>
        </TableHeader>
        <TableBody>
          {BACKDROP_ROWS.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>
                {row.live ? (
                  <Badge className="bg-success-tint text-success-tint-foreground">
                    Live
                  </Badge>
                ) : (
                  <Badge variant="secondary">Paused</Badge>
                )}
              </TableCell>
              <TableCell className="text-end tabular-nums">
                {row.calls.toLocaleString("en-US")}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.lastCall}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>
    </div>
  );
}
