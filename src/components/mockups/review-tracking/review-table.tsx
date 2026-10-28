"use client"

import * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTableHeaderRow } from "@/components/shared/data-table"
import {
  DirectionChip,
  OutcomeBadge,
  ScenarioChip,
  StatusBadge,
} from "@/components/mockups/conversations-revamp/list/status-badges"
import type { CallRow } from "@/lib/mockups/conversations-revamp-list-data"
import { cn } from "@/lib/utils"

type ExtraColumn = {
  id: string
  head: React.ReactNode
  cell: (call: CallRow, index: number) => React.ReactNode
  className?: string
}

/** Controls inside a row must stop the click, or ticking one also opens the call. */
export function ReviewTable({
  calls,
  onOpen,
  before = [],
  after = [],
  selected,
  timeMark,
  timeStrong,
}: {
  calls: CallRow[]
  onOpen: (call: CallRow) => void
  before?: ExtraColumn[]
  after?: ExtraColumn[]
  selected?: string | null
  timeMark?: (call: CallRow) => React.ReactNode
  timeStrong?: (call: CallRow) => boolean
}) {
  return (
    <Table>
      <TableHeader>
        <DataTableHeaderRow>
          {before.map((column) => (
            <TableHead
              className={cn("font-semibold text-foreground", column.className)}
              key={column.id}
            >
              {column.head}
            </TableHead>
          ))}
          {[
            "Time",
            "Direction",
            "Phone number",
            "Scenario",
            "Call status",
            "Outcome",
            "Duration",
          ].map((label) => (
            <TableHead className="font-semibold text-foreground" key={label}>
              {label}
            </TableHead>
          ))}
          {after.map((column) => (
            <TableHead
              className={cn("font-semibold text-foreground", column.className)}
              key={column.id}
            >
              {column.head}
            </TableHead>
          ))}
        </DataTableHeaderRow>
      </TableHeader>

      <TableBody>
        {calls.map((call, index) => (
          <TableRow
            className="cursor-pointer transition-colors duration-150 ease-out-cubic hover:bg-muted/50 motion-reduce:transition-none data-[state=selected]:bg-primary-tint data-[state=selected]:hover:bg-primary-tint"
            data-state={call.id === selected ? "selected" : undefined}
            key={call.id}
            onClick={(event) => {
              if (
                event.target instanceof Element &&
                event.target.closest("button, [role='checkbox']")
              ) {
                return
              }
              onOpen(call)
            }}
          >
            {before.map((column) => (
              <TableCell className={column.className} key={column.id}>
                {column.cell(call, index)}
              </TableCell>
            ))}
            <TableCell>
              <span
                className={cn(
                  "flex items-center gap-2 text-sm",
                  timeStrong?.(call)
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {timeMark ? (
                  <span className="flex w-2 shrink-0 justify-center">
                    {timeMark(call)}
                  </span>
                ) : null}
                {call.createdAt}
              </span>
            </TableCell>
            <TableCell>
              {call.direction ? (
                <DirectionChip direction={call.direction} />
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-sm font-medium">
              {call.phoneNumber ?? (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>
              <ScenarioChip scenario={call.scenario} />
            </TableCell>
            <TableCell>
              <StatusBadge
                scheduleOrigin={call.scheduleOrigin}
                status={call.status}
              />
            </TableCell>
            <TableCell>
              <OutcomeBadge status={call.outcome} />
            </TableCell>
            <TableCell className="text-sm font-medium tabular-nums">
              {call.duration}
            </TableCell>
            {after.map((column) => (
              <TableCell className={column.className} key={column.id}>
                {column.cell(call, index)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
