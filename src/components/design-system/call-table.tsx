"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/data-table"
import {
  CompletedIcon,
  FailedIcon,
  InboundIcon,
  OutboundIcon,
  RowMenuIcon,
  RunningIcon,
  ScheduledIcon,
  SearchIcon,
  SortAscIcon,
  SortDescIcon,
  SortableIcon,
} from "@/components/design-system/icons"
import {
  CALL_ROWS,
  type CallRow,
  LANGUAGE_NAMES,
} from "@/lib/design-system-data"
import { cn } from "@/lib/utils"

/** The state column, and the only coloured chip in the row. */
const STATUS = {
  completed: {
    Icon: CompletedIcon,
    label: "Completed",
    tone: "bg-success-tint text-success-tint-foreground",
  },
  failed: {
    Icon: FailedIcon,
    label: "Failed",
    tone: "bg-destructive-tint text-destructive-tint-foreground",
  },
  in_progress: {
    Icon: RunningIcon,
    label: "In progress",
    tone: "bg-warning-tint text-warning-tint-foreground",
  },
  scheduled: {
    Icon: ScheduledIcon,
    label: "Scheduled",
    tone: "bg-primary-tint text-primary-tint-foreground",
  },
}

type SortField = "cost" | "duration" | "started"

/**
 * The list table the platform settled on, wired up enough to be poked at:
 * sorting actually sorts, and the search field actually filters, because a
 * table prototype that does neither cannot answer what a sorted column or an
 * emptied filter looks like.
 */
export function CallTable() {
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState<{
    field: SortField
    order: "asc" | "desc"
  }>({ field: "started", order: "desc" })

  const rows = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matched = needle
      ? CALL_ROWS.filter((row) =>
          [row.id, row.customer, row.scenario].some((field) =>
            field.toLowerCase().includes(needle),
          ),
        )
      : CALL_ROWS

    /* Nulls last in both directions — a call with no duration has not got a
       small duration, and floating them to the top of an ascending sort puts
       the rows with nothing to compare where the comparison starts. */
    return [...matched].sort((a, b) => {
      const left = a[sort.field]
      const right = b[sort.field]
      if (left === null) return right === null ? 0 : 1
      if (right === null) return -1
      const delta = left > right ? 1 : left < right ? -1 : 0
      return sort.order === "asc" ? delta : -delta
    })
  }, [query, sort])

  function toggle(field: SortField) {
    setSort((current) =>
      current.field === field
        ? { field, order: current.order === "asc" ? "desc" : "asc" }
        : { field, order: "desc" },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* The control row: one line above the table, never inside it. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <InputGroup className="w-full sm:w-72">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search calls"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search calls"
            value={query}
          />
        </InputGroup>
        <span className="text-sm text-muted-foreground">
          {rows.length} of {CALL_ROWS.length} calls
        </span>
      </div>

      <DataTable>
        <TableHeader>
          <DataTableHeaderRow>
            <DataTableHead>Customer</DataTableHead>
            <DataTableHead>Call</DataTableHead>
            <DataTableHead>Status</DataTableHead>
            <DataTableHead>Direction</DataTableHead>
            <DataTableHead>Scenario</DataTableHead>
            <DataTableHead>Language</DataTableHead>
            <SortableHead
              field="duration"
              label="Duration"
              numeric
              onSort={toggle}
              sort={sort}
            />
            <SortableHead
              field="cost"
              label="Cost"
              numeric
              onSort={toggle}
              sort={sort}
            />
            <SortableHead
              field="started"
              label="Started"
              onSort={toggle}
              sort={sort}
            />
            <DataTableHead className="text-end">Actions</DataTableHead>
          </DataTableHeaderRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                className="text-center text-muted-foreground"
                colSpan={10}
              >
                No calls match “{query}”.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => <CallTableRow key={row.id} row={row} />)
          )}
        </TableBody>
      </DataTable>
    </div>
  )
}

function CallTableRow({ row }: { row: CallRow }) {
  const status = STATUS[row.status]
  const DirectionIcon = row.direction === "inbound" ? InboundIcon : OutboundIcon

  return (
    <TableRow>
      {/* The anchor column, and the only one carrying weight. One line: a
          two-line cell grows the row past the fixed 40px and the header stops
          lining up with the body, which is the whole point of the height. */}
      <TableCell className="font-medium">{row.customer}</TableCell>
      <TableCell className="text-muted-foreground">{row.id}</TableCell>

      <TableCell>
        <Badge className={status.tone} variant="secondary">
          <status.Icon />
          {status.label}
          {row.cause ? <span className="opacity-70">– {row.cause}</span> : null}
        </Badge>
      </TableCell>

      {/* Categories, not states: neutral, separated by their icon. */}
      <TableCell>
        <Badge className="bg-muted text-muted-foreground" variant="secondary">
          <DirectionIcon />
          {row.direction}
        </Badge>
      </TableCell>

      <TableCell>
        <Badge
          className="max-w-44 truncate bg-muted text-muted-foreground"
          variant="secondary"
        >
          {row.scenario}
        </Badge>
      </TableCell>

      <TableCell>
        <LanguageChip languages={row.languages} />
      </TableCell>

      <TableCell className="text-end tabular-nums">
        {row.duration === null ? (
          <NotApplicable />
        ) : (
          formatDuration(row.duration)
        )}
      </TableCell>

      <TableCell className="text-end tabular-nums">
        {row.cost === null ? <NotApplicable /> : `$${row.cost.toFixed(2)}`}
      </TableCell>

      <TableCell className="text-muted-foreground">{row.started}</TableCell>

      <TableCell className="text-end">
        <Button
          aria-label={`Actions for ${row.id}`}
          size="icon-sm"
          variant="ghost"
        >
          <RowMenuIcon />
        </Button>
      </TableCell>
    </TableRow>
  )
}

/**
 * One chip per language: the two-letter code, with the full name in a tooltip.
 *
 * Taken from `LanguageChip` in the app (`app/src/components/language-chip.tsx`)
 * rather than reinvented. Neutral because a language is a category and not a
 * state, and the code rather than the name because spelling each one out costs
 * a column of width for a value the reader recognises at a glance — a row can
 * carry three at once. The name is what assistive tech reads, so the chip is
 * never just two unexplained letters.
 */
function LanguageChip({ languages }: { languages: string[] }) {
  return (
    <span className="flex flex-wrap items-center gap-1">
      {languages.map((code) => (
        <Tooltip key={code}>
          <TooltipTrigger asChild>
            <Badge
              className="bg-muted text-muted-foreground"
              variant="secondary"
            >
              <span aria-label={LANGUAGE_NAMES[code]}>{code}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{LANGUAGE_NAMES[code]}</TooltipContent>
        </Tooltip>
      ))}
    </span>
  )
}

/**
 * A number that does not exist yet. An em dash rather than 0 or a blank: zero
 * is a measurement, and a blank cell reads as a rendering fault.
 */
function NotApplicable() {
  return <span className="text-muted-foreground">—</span>
}

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

function SortableHead({
  field,
  label,
  numeric,
  onSort,
  sort,
}: {
  field: SortField
  label: string
  numeric?: boolean
  onSort: (field: SortField) => void
  sort: { field: SortField; order: "asc" | "desc" }
}) {
  const active = sort.field === field
  const Icon = !active
    ? SortableIcon
    : sort.order === "asc"
      ? SortAscIcon
      : SortDescIcon

  return (
    <DataTableHead className={cn(numeric && "text-end")}>
      {/* A Button, not an onClick on the cell: bulbul's version puts the
          handler on the <th>, which sorts by mouse and is unreachable by
          keyboard — the same defect the consistency pass fixed on a
          copy-to-clipboard cell. The -mx-2.5 cancels the button's own padding
          so the label still sits on the cell's 16px edge, and a margin is the
          one thing a primitive lets you set from outside. */}
      <Button
        className="-mx-2.5 font-semibold"
        onClick={() => onSort(field)}
        size="sm"
        variant="ghost"
      >
        {label}
        <Icon
          className={cn(!active && "text-muted-foreground opacity-50")}
          data-icon="inline-end"
        />
      </Button>
    </DataTableHead>
  )
}
