import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/data-table"
import {
  NoResultsIcon,
  RetryIcon,
  SourceIcon,
  WarningIcon,
} from "@/components/design-system/icons"
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

/**
 * The four states an index page has that are not the populated one.
 *
 * All four render at the same width and inside the same container the real
 * table uses, because that is the claim each of them is making: nothing about
 * the page moves between states except what is inside the rows. A preview that
 * floated each state on the page background would demonstrate the opposite.
 */

/** The four columns the demos share, so the four states are the same table. */
const COLUMNS = ["Source", "Type", "Size", "Added"]

/**
 * Loading — the table's own shape, with the cells not arrived yet.
 *
 * Same column count, same 40px rows, same band. The skeleton is not a picture
 * of a table, it is the table, which is the only way the page does not jump
 * when the data lands.
 */
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
                {/* Varied widths, because a column of identical bars reads as
                    a loading graphic rather than as rows of text arriving. */}
                <Skeleton
                  className={cellWidth(index)}
                  /* The primitive pulses; the escape is ours to add wherever
                     it is used, and opacity is not an exception. */
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  )
}

/** A believable text width per column, fixed rather than random so the
    skeleton does not reshuffle on every render. */
function cellWidth(index: number) {
  const widths = ["h-4 w-40", "h-4 w-20", "h-4 w-14", "h-4 w-24"]
  return `${widths[index]} motion-reduce:animate-none`
}

/**
 * Empty — nothing here yet, and the one action that changes it.
 *
 * The description says what a row would be. It is the only place a reader who
 * has not seen the feature finds out what the list is for, and leaving it at
 * "No items" spends the whole state saying something the heading already said.
 */
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

/**
 * No results — the collection has rows, this filter does not.
 *
 * Inside the table's container, band and all. Dropping the header would drop
 * the columns, and with them the evidence that a filter is what is doing this
 * rather than an account with nothing in it.
 */
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
          {/* The one place a cell is not 40px: it is holding a state, not a
              row, so it spans the columns rather than pretending to be one. */}
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

/**
 * Error — name what failed, and offer the retry.
 *
 * "Something went wrong" is what a page says when nobody decided which page it
 * was, and it is the sentence a shared root boundary produces by default. The
 * title here names the collection, so a reader who has three tabs open knows
 * which one is broken.
 */
export function ErrorStatePreview() {
  return (
    <div className="rounded-lg border">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <WarningIcon />
          </EmptyMedia>
          <EmptyTitle>Could not load sources</EmptyTitle>
          <EmptyDescription>
            The request timed out. Nothing was changed, so retrying is safe.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" variant="outline">
            <RetryIcon />
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
