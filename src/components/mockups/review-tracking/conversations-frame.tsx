"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { FilterBar, SelectFilter } from "@/components/shared/filter-bar"
import { ListFooter } from "@/components/shared/list-footer"
import { PageHeader } from "@/components/shared/page-header"
import {
  ExportIcon,
  RefreshIcon,
  SearchIcon,
} from "@/components/mockups/review-tracking/icons"
import type { CallRow } from "@/lib/mockups/conversations-revamp-list-data"
import { TOTAL_CALLS } from "@/lib/mockups/review-tracking-data"

type Slot = React.ReactNode | ((rows: CallRow[]) => React.ReactNode)

function render(slot: Slot, rows: CallRow[]) {
  return typeof slot === "function" ? slot(rows) : slot
}

function options(values: string[], label = (value: string) => value) {
  return Array.from(new Set(values)).map((value) => ({
    value,
    label: label(value),
  }))
}

function sentence(value: string) {
  const words = value.replace(/_/g, " ")
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * The Conversations page as it ships after the index revamp: title, search
 * with refresh and export at its end, filter chips under it, the table in a
 * card, the shared footer. Every idea sits inside this frame and adds only
 * what it needs — a button in the search row, a chip in the filter row, a
 * line above the table.
 *
 * The status, outcome and scenario chips really filter, because one idea (a
 * review session) starts from a filtered list.
 */
export function ConversationsFrame({
  calls,
  searchExtras,
  filterExtras,
  extraActive = 0,
  onClearExtras,
  above,
  narrow,
  children,
}: {
  calls: CallRow[]
  /** Buttons an idea adds to the search row, before Export. Given the rows
      on screen, for an action that works on them. */
  searchExtras?: Slot
  /** Chips an idea adds after the page's own. */
  filterExtras?: React.ReactNode
  /** How many of those extra chips are set. */
  extraActive?: number
  onClearExtras?: () => void
  /** A line between the filters and the table. */
  above?: Slot
  /** An idea's own narrowing of the filtered rows. */
  narrow?: (rows: CallRow[]) => CallRow[]
  children: (rows: CallRow[]) => React.ReactNode
}) {
  const [statuses, setStatuses] = React.useState<string[]>([])
  const [outcomes, setOutcomes] = React.useState<string[]>([])
  const [scenarios, setScenarios] = React.useState<string[]>([])
  const [pageSize, setPageSize] = React.useState(25)

  const filtered = calls.filter(
    (call) =>
      (!statuses.length || statuses.includes(call.status)) &&
      (!outcomes.length || outcomes.includes(call.outcome)) &&
      (!scenarios.length || scenarios.includes(call.scenario)),
  )
  const rows = narrow ? narrow(filtered) : filtered
  const activeCount =
    [statuses.length, outcomes.length, scenarios.length].filter(Boolean)
      .length + extraActive
  /* Unfiltered, the page stands for the whole history; narrowed in any
     way, the rows on screen are all there is. */
  const total =
    activeCount || rows.length !== calls.length ? rows.length : TOTAL_CALLS

  return (
    <div className="flex flex-1 flex-col gap-4 p-3 lg:p-4">
      <PageHeader title="Conversations" />

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="min-w-64 flex-1">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search by phone number"
              placeholder="Search by phone number..."
            />
          </InputGroup>
          <Button aria-label="Refresh" size="icon" variant="outline">
            <RefreshIcon />
          </Button>
          {render(searchExtras, rows)}
          <Button variant="outline">
            <ExportIcon />
            Export
          </Button>
        </div>

        <FilterBar
          activeCount={activeCount}
          onClearAll={() => {
            setStatuses([])
            setOutcomes([])
            setScenarios([])
            onClearExtras?.()
          }}
        >
          <SelectFilter
            field="Call status"
            onChange={setStatuses}
            options={options(
              calls.map((call) => call.status),
              sentence,
            )}
            value={statuses}
          />
          <SelectFilter
            field="Outcome"
            onChange={setOutcomes}
            options={options(
              calls.map((call) => call.outcome),
              sentence,
            )}
            value={outcomes}
          />
          <SelectFilter
            field="Scenario"
            onChange={setScenarios}
            options={options(calls.map((call) => call.scenario))}
            value={scenarios}
          />
          {filterExtras}
        </FilterBar>
      </div>

      {render(above, rows)}

      {/* `--card-spacing: 0`: the table draws its own header band and rules. */}
      <Card className="[--card-spacing:0px]">
        <div className="overflow-x-auto">{children(rows)}</div>
      </Card>

      <ListFooter
        atEnd={rows.length >= total}
        from={1}
        noun="calls"
        onPageSizeChange={setPageSize}
        pageSize={pageSize}
        shown={rows.length}
        total={total}
      />
    </div>
  )
}
