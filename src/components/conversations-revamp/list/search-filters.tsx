"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ColumnSetting } from "@/lib/conversations-revamp-list-data"
import { FieldsDropdown } from "@/components/conversations-revamp/list/fields-dropdown"
import {
  CalendarIcon,
  ChevronDownIcon,
  ExportIcon,
  InboundIcon,
  MoreFiltersIcon,
  OutboundIcon,
  RefreshIcon,
  SearchIcon,
} from "@/components/conversations-revamp/list/icons"
import { StatusFilter } from "@/components/conversations-revamp/list/status-filter"

/**
 * The filter row above the table: phone search, Status and Outcome
 * multi-selects, a time range, the scenario picker, and Fields — then the list
 * actions at the end, being refresh, the toggle that opens Call Direction and
 * Call Duration underneath, and Export.
 */
export function SearchFilters({
  columns,
  onColumnsChange,
  statusOpen = false,
}: {
  columns: ColumnSetting[]
  onColumnsChange: (columns: ColumnSetting[]) => void
  /** Opens the Status list on load, for the link that shows that dropdown. */
  statusOpen?: boolean
}) {
  const [showMoreFilters, setShowMoreFilters] = React.useState(false)

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <InputGroup className="max-w-70 flex-1 bg-card">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search calls by phone number"
              placeholder="Search by phone number..."
            />
          </InputGroup>

          <StatusFilter defaultOpen={statusOpen} />

          {/* Outcome is the same multi-select in the app; its trigger only. */}
          <Button
            aria-label="Select Outcome"
            className="w-35 justify-between bg-card font-normal text-muted-foreground"
            variant="outline"
          >
            Outcome
            <ChevronDownIcon className="opacity-50" />
          </Button>

          <Select defaultValue="all">
            <SelectTrigger className="w-fit bg-card" aria-label="Time range">
              <CalendarIcon className="text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="w-38 justify-between bg-card font-normal"
            variant="outline"
          >
            <span className="truncate">All scenarios</span>
            <ChevronDownIcon className="text-muted-foreground" />
          </Button>

          {/* The Default View / Detailed View picker used to sit here. Fields
              replaced it: the same decision, made a column at a time instead of
              two-at-a-time. */}
          <FieldsDropdown columns={columns} onChange={onColumnsChange} />
        </div>

        {/* Actions on the list rather than filters on it, so they sit together
            at the end of the row instead of in the filter flow. */}
        <div className="flex shrink-0 items-center gap-2">
          <Button aria-label="Refresh calls" size="sm" variant="outline">
            <RefreshIcon />
          </Button>

          <Button
            aria-label={
              showMoreFilters
                ? "Hide additional filters"
                : "Show additional filters"
            }
            className={showMoreFilters ? "bg-muted" : undefined}
            onClick={() => {
              setShowMoreFilters(!showMoreFilters)
            }}
            size="sm"
            variant="outline"
          >
            <MoreFiltersIcon />
            <ChevronDownIcon
              className={
                showMoreFilters
                  ? "size-3 rotate-180 transition-transform duration-150 ease-out-cubic motion-reduce:transition-none"
                  : "size-3 transition-transform duration-150 ease-out-cubic motion-reduce:transition-none"
              }
            />
          </Button>

          <Button size="sm" variant="outline">
            <ExportIcon />
            Export
          </Button>
        </div>
      </div>

      {showMoreFilters ? (
        /* A margin, not a gap: this and the filter row are siblings inside a
           fragment, and the page div that holds them is block, so no gap
           reaches them. 12px rather than the page's 16px on purpose — the panel
           belongs to the bar whose toggle opened it, so it has to sit closer to
           that bar than to the result count under it. */
        <div className="mt-3 rounded-lg bg-muted">
          <div className="flex flex-col gap-4 p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium">Call Direction</Label>
                <Select defaultValue="both">
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="All directions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="inbound">
                      <InboundIcon />
                      Inbound
                    </SelectItem>
                    <SelectItem value="outbound">
                      <OutboundIcon />
                      Outbound
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium">Call Duration</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="Any duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any duration</SelectItem>
                    <SelectItem value="short">Under 1 minute</SelectItem>
                    <SelectItem value="medium">1 to 5 minutes</SelectItem>
                    <SelectItem value="long">Over 5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
