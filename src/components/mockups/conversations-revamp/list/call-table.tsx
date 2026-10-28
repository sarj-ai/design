"use client"

import type { ReactNode } from "react"

import { DataTableHeaderRow } from "@/components/shared/data-table"
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
} from "@/lib/mockups/conversations-revamp-list-data"
import {
  AgentOutcomeBadge,
  DirectionChip,
  OutcomeBadge,
  ScenarioChip,
  StatusBadge,
} from "@/components/mockups/conversations-revamp/list/status-badges"
import { StatusHelp } from "@/components/mockups/conversations-revamp/list/status-help"
import { TimeIcon } from "@/components/mockups/conversations-revamp/list/icons"

export function CallTable({
  calls,
  columns,
  onCallClick,
  rowMarker,
}: {
  calls: CallRow[]
  columns: ColumnSetting[]
  onCallClick: (call: CallRow) => void
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
              {COLUMN_HELP[column.id] ? (
                <span className="inline-flex items-center gap-1">
                  {COLUMN_LABELS[column.id]}
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
