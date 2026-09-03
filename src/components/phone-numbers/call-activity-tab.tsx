"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/data-table"
import {
  ClearIcon,
  HighVolumeIcon,
  SearchIcon,
  SortAscIcon,
  SortDescIcon,
} from "@/components/phone-numbers/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  CALL_ACTIVITY,
  ORGANIZATIONS,
  TIME_RANGES,
  type CallActivityRow,
} from "@/lib/phone-numbers-data"

const ALL = "all"
const HIGH_VOLUME_THRESHOLD = 10

type SortField =
  | "inbound_count"
  | "organization_name"
  | "outbound_count"
  | "phone_number"
  | "total_call_count"

const VALUE_OF: Record<SortField, (row: CallActivityRow) => number | string> = {
  phone_number: (row) => row.phoneNumber,
  organization_name: (row) => row.organizationName,
  total_call_count: (row) => row.totalCallCount,
  inbound_count: (row) => row.inboundCount,
  outbound_count: (row) => row.outboundCount,
}

export function CallActivityTab() {
  const [organizationId, setOrganizationId] = React.useState(ALL)
  const [range, setRange] = React.useState(ALL)
  const [search, setSearch] = React.useState("")
  const [sortBy, setSortBy] = React.useState<SortField>("total_call_count")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")

  const sort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
      return
    }
    setSortBy(field)
    setSortOrder("desc")
  }

  const rows = CALL_ACTIVITY.filter(
    (row) =>
      (organizationId === ALL || row.organizationId === organizationId) &&
      (search.trim() === "" || row.phoneNumber.includes(search.trim())),
  ).toSorted((a, b) => {
    const left = VALUE_OF[sortBy](a)
    const right = VALUE_OF[sortBy](b)
    const compared =
      typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left).localeCompare(String(right))
    return sortOrder === "desc" ? -compared : compared
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Select onValueChange={setOrganizationId} value={organizationId}>
            <SelectTrigger
              aria-label="Filter by organization"
              className="w-50"
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All organizations</SelectItem>
              {ORGANIZATIONS.map((organization) => (
                <SelectItem key={organization.id} value={organization.id}>
                  {organization.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setRange} value={range}>
            <SelectTrigger aria-label="Filter by time range" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <InputGroup className="w-full sm:w-80">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search phone numbers"
              onChange={(event) => {
                setSearch(event.target.value)
              }}
              placeholder="Search phone numbers…"
              value={search}
            />
          </InputGroup>
          {search ? (
            <Button
              onClick={() => {
                setSearch("")
              }}
              size="sm"
              variant="outline"
            >
              <ClearIcon />
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      <DataTable>
        <TableHeader>
          <DataTableHeaderRow>
            <SortableHead
              field="phone_number"
              label="Phone number"
              onSort={sort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
            <DataTableHead>Status</DataTableHead>
            <SortableHead
              field="organization_name"
              label="Organization"
              onSort={sort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
            <SortableHead
              field="total_call_count"
              label="Total calls"
              numeric
              onSort={sort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
            <SortableHead
              field="inbound_count"
              label="Inbound"
              numeric
              onSort={sort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
            <SortableHead
              field="outbound_count"
              label="Outbound"
              numeric
              onSort={sort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
            <DataTableHead className="text-end">Answer rate</DataTableHead>
            <DataTableHead>Active since</DataTableHead>
            <DataTableHead className="text-end">Actions</DataTableHead>
          </DataTableHeaderRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                className="text-center text-muted-foreground"
                colSpan={9}
              >
                No phone numbers found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.phoneNumber}>
                <TableCell className="font-medium">{row.phoneNumber}</TableCell>
                <TableCell>
                  {row.blockedAt === null ? (
                    <Badge
                      className="bg-muted text-muted-foreground"
                      variant="secondary"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          className="bg-destructive-tint text-destructive-tint-foreground"
                          variant="secondary"
                        >
                          Blocked
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        Blocked {RELATIVE.format(new Date(row.blockedAt))}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>{row.organizationName}</TableCell>
                <TableCell className="text-end">
                  <span className="flex items-center justify-end gap-1.5">
                    <span className="font-semibold tabular-nums">
                      {row.totalCallCount}
                    </span>
                    {row.totalCallCount >= HIGH_VOLUME_THRESHOLD ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <HighVolumeIcon className="size-4 text-warning" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          High volume: {row.totalCallCount} calls
                        </TooltipContent>
                      </Tooltip>
                    ) : null}
                  </span>
                </TableCell>
                <TableCell className="text-end tabular-nums">
                  {row.inboundCount}
                </TableCell>
                <TableCell className="text-end tabular-nums">
                  {row.outboundCount}
                </TableCell>
                <TableCell className="text-end">
                  <AnswerRate
                    answered={row.answered}
                    total={row.totalCallCount}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <ActiveSince row={row} />
                </TableCell>
                <TableCell className="text-end">
                  <Button size="xs" variant="ghost">
                    {row.blockedAt === null ? "Block" : "Unblock"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </DataTable>
    </div>
  )
}

const RELATIVE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

function SortableHead({
  field,
  label,
  numeric = false,
  onSort,
  sortBy,
  sortOrder,
}: {
  field: SortField
  label: string
  numeric?: boolean
  onSort: (field: SortField) => void
  sortBy: SortField
  sortOrder: "asc" | "desc"
}) {
  const isActive = sortBy === field
  const Caret = isActive && sortOrder === "asc" ? SortAscIcon : SortDescIcon

  return (
    <DataTableHead
      className={cn(
        "cursor-pointer select-none hover:bg-muted",
        numeric && "text-end",
      )}
    >
      {/* The caret stays on every sortable column, faded until it is the one
          sorting. Showing it only on the active column left the other four
          looking inert — you had to click one to learn it was clickable. */}
      <span
        className={cn("flex items-center gap-1", numeric && "justify-end")}
        onClick={() => {
          onSort(field)
        }}
      >
        {label}
        <Caret className={cn("size-3", !isActive && "opacity-30")} />
      </span>
    </DataTableHead>
  )
}

/* Intent-tint tokens, not the solid destructive fill: a column of low rates
   should read as ten measurements, not ten alarms. */
function AnswerRate({ answered, total }: { answered: number; total: number }) {
  if (total === 0) {
    return (
      <span aria-label="No calls yet" className="text-muted-foreground">
        —
      </span>
    )
  }
  const rate = (answered / total) * 100
  const tone =
    rate > 50
      ? "bg-success-tint text-success-tint-foreground"
      : rate >= 20
        ? "bg-warning-tint text-warning-tint-foreground"
        : "bg-destructive-tint text-destructive-tint-foreground"

  return (
    <Badge className={tone} variant="secondary">
      {Math.round(rate)}%
    </Badge>
  )
}

function ActiveSince({ row }: { row: CallActivityRow }) {
  if (row.firstCallAt === null) {
    return (
      <span aria-label="Never active" className="text-muted-foreground">
        —
      </span>
    )
  }
  const since = RELATIVE.format(new Date(row.firstCallAt))
  if (row.lastCallAt === null) return <span>{since}</span>

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-default">{since}</span>
      </TooltipTrigger>
      <TooltipContent>
        Last call {RELATIVE.format(new Date(row.lastCallAt))}
      </TooltipContent>
    </Tooltip>
  )
}
