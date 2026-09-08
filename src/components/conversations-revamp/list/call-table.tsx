"use client"

import type { ReactNode } from "react"

import { DataTableHeaderRow } from "@/components/data-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  COLUMN_HELP,
  COLUMN_LABELS,
  type CallRow,
  type ColumnId,
  type ColumnSetting,
} from "@/lib/conversations-revamp-list-data"
import {
  AgentOutcomeBadge,
  DirectionChip,
  OutcomeBadge,
  ScenarioChip,
  StatusBadge,
} from "@/components/conversations-revamp/list/status-badges"
import { StatusHelp } from "@/components/conversations-revamp/list/status-help"
import { TimeIcon } from "@/components/conversations-revamp/list/icons"

/**
 * The table, driven by whatever the Fields dropdown says.
 *
 * Header and body both walk the same `columns` array, so a column cannot end up
 * in one and not the other, and reordering is a single list to move.
 */
export function CallTable({
  calls,
  columns,
  onCallClick,
  rowMarker,
}: {
  /** Owned by the page, because cancelling a scheduled call changes one. */
  calls: CallRow[]
  columns: ColumnSetting[]
  onCallClick: (call: CallRow) => void
  /**
   * A mark on the row's time icon, for a mockup whose calls carry a finding the
   * columns do not — the behavioural flags, in practice.
   *
   * It rides the icon rather than taking a column of its own: a column would
   * cost width on every row to say nothing on most of them, and this is the
   * absence of a value rather than a value. Rows with nothing to report return
   * null; the mockups that pass nothing get the table exactly as it was.
   */
  rowMarker?: (call: CallRow) => ReactNode
}) {
  const shown = columns.filter((column) => column.visible)

  return (
    <Table>
      <TableHeader>
        <DataTableHeaderRow>
          {shown.map((column) => (
            <TableHead
              className="font-semibold text-foreground"
              key={column.id}
            >
              {/* The help icon only appears on columns that carry a
                  COLUMN_HELP entry, so it marks the one header worth reading
                  rather than decorating every one of them. */}
              {COLUMN_HELP[column.id] ? (
                <span className="inline-flex items-center gap-1">
                  {COLUMN_LABELS[column.id]}
                  {/* A legend rather than a tooltip — see StatusHelp for why
                      five definitions are the wrong thing to put in one. */}
                  <StatusHelp />
                </span>
              ) : (
                COLUMN_LABELS[column.id]
              )}
            </TableHead>
          ))}
        </DataTableHeaderRow>
      </TableHeader>

      <TableBody>
        {calls.map((call) => (
          <TableRow
            className="cursor-pointer transition-colors duration-150 ease-out-cubic hover:bg-muted/50 motion-reduce:transition-none"
            key={call.id}
            onClick={() => {
              onCallClick(call)
            }}
          >
            {shown.map((column) => (
              <TableCell key={column.id}>
                <Cell
                  call={call}
                  column={column.id}
                  marker={column.id === "time" ? rowMarker?.(call) : null}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/**
 * One placeholder for every cell that has no value, so a blank never has to be
 * interpreted. Direction used to render nothing at all on a chat row while
 * Phone Number rendered "-" — two ways of saying "no value here" in one row.
 *
 * The two verdict columns keep their own wording, because there the absence
 * *is* a reading: Unavailable is one of the things each of them reports.
 */
function NoValue() {
  return (
    <span aria-label="Not applicable" className="text-muted-foreground">
      —
    </span>
  )
}

function Cell({
  call,
  column,
  marker,
}: {
  call: CallRow
  column: ColumnId
  /** Rendered against the time icon; positioned by whoever passes it. */
  marker?: ReactNode
}) {
  switch (column) {
    case "direction":
      return call.direction ? (
        <DirectionChip direction={call.direction} />
      ) : (
        <NoValue />
      )

    case "duration":
      return call.duration === "-" ? (
        <NoValue />
      ) : (
        <span className="text-sm font-medium text-foreground">
          {call.duration}
        </span>
      )

    /* The chip is the verdict; the tooltip is why it reads that way, and only
       a call that produced one has a why to give. */
    case "outcome":
      return call.outcomeReason ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <OutcomeBadge status={call.outcome} />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{call.outcomeReason}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <OutcomeBadge status={call.outcome} />
      )

    case "agentOutcome":
      return <AgentOutcomeBadge status={call.agentOutcome} />

    case "phoneNumber":
      return call.phoneNumber ? (
        <span className="text-sm font-medium text-foreground">
          {call.phoneNumber}
        </span>
      ) : (
        <NoValue />
      )

    case "scenario":
      return <ScenarioChip scenario={call.scenario} />

    case "status":
      return (
        <StatusBadge
          scheduleOrigin={call.scheduleOrigin}
          status={call.status}
        />
      )

    case "time":
      return (
        <div className="flex items-center text-muted-foreground">
          <span className="relative me-2 flex">
            <TimeIcon className="size-3.5" />
            {marker}
          </span>
          <span className="text-sm">{call.createdAt}</span>
        </div>
      )
  }
}
