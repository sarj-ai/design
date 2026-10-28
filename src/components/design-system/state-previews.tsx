import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table"
import { ErrorState } from "@/components/design-system/error-state"
import { NoResultsIcon, SourceIcon } from "@/components/design-system/icons"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"

const COLUMNS = ["Source", "Type", "Size", "Added"]

export function LoadingPreview() {
  return (
    <DataTable>
      <TableBody>
        <DataTableHeaderRow>
          {COLUMNS.map((column) => (
            <DataTableHead key={column}>{column}</DataTableHead>
          ))}
        </DataTableHeaderRow>

        {[0, 1, 2, 3, 4].map((row) => (
          <TableRow key={row}>
            {COLUMNS.map((column, index) => (
              <TableCell key={column}>
                <Skeleton
                  className={cellWidth(index)}
                  /* The primitive pulses, so the reduced-motion escape is added here. */
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  )
}

/** Fixed rather than random so the skeleton does not reshuffle on every render. */
function cellWidth(index: number) {
  const widths = ["h-4 w-40", "h-4 w-20", "h-4 w-14", "h-4 w-24"]
  return `${widths[index]} motion-reduce:animate-none`
}

export function EmptyStatePreview() {
  return (
    <div className="rounded-lg border">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SourceIcon />
          </EmptyMedia>
          <EmptyTitle>No sources yet</EmptyTitle>
          <EmptyDescription>
            Upload a document, a spreadsheet or a link and the agent can answer
            from it during a call.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm">Add a source</Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

export function NoResultsPreview() {
  return (
    <DataTable>
      <TableBody>
        <DataTableHeaderRow>
          {COLUMNS.map((column) => (
            <DataTableHead key={column}>{column}</DataTableHead>
          ))}
        </DataTableHeaderRow>

        <TableRow className="hover:bg-transparent">
          <TableCell className="h-auto! py-8" colSpan={COLUMNS.length}>
            <Empty className="p-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <NoResultsIcon />
                </EmptyMedia>
                <EmptyTitle>No sources match “gulf dialect”</EmptyTitle>
                <EmptyDescription>
                  Quoting the term back is how a reader spots the typo without
                  scrolling up to the field.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size="sm" variant="outline">
                  Clear filters
                </Button>
              </EmptyContent>
            </Empty>
          </TableCell>
        </TableRow>
      </TableBody>
    </DataTable>
  )
}

export function ErrorStatePreview() {
  return (
    <div className="rounded-lg border">
      <ErrorState onRetry={() => {}} title="Could not load sources" />
    </div>
  )
}
