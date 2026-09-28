"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  DateFilter,
  FilterBar,
  SelectFilter,
  type DateRange,
} from "@/components/shared/filter-bar"
import { ListFooter } from "@/components/shared/list-footer"
import { PageHeader } from "@/components/shared/page-header"
import { CallTable } from "@/components/mockups/conversations-revamp/list/call-table"
import { FieldsDropdown } from "@/components/mockups/conversations-revamp/list/fields-dropdown"
import {
  ExportIcon,
  RefreshIcon,
  SearchIcon,
} from "@/components/mockups/conversations-revamp/list/icons"
import {
  CALLS,
  DEFAULT_COLUMNS,
  TOTAL_RESULTS,
  type CallRow,
} from "@/lib/mockups/conversations-revamp-list-data"

/**
 * The conversations list from `conversations-revamp`, laid out by the index
 * page rules — same table, same rows, different frame around them.
 *
 *  - The page has a title.
 *  - Search fills the row; refresh, fields and export sit at its end.
 *  - Status, outcome, date and scenario are chips under the search instead of
 *    four dropdowns sharing the search's row. "All time" becomes the Date
 *    chip's unset state.
 *  - The results line goes: the footer already says "1–12 of 1,284".
 *  - The footer is the shared one.
 *
 * The mockup itself is left as it is — it answers its own tickets.
 */

/** The day the mock calls were placed, so the date presets land on them. */
const TODAY = new Date(2026, 7, 11)

function label(value: string) {
  const words = value.replace(/_/g, " ")
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function options(values: string[]) {
  return Array.from(new Set(values)).map((value) => ({
    value,
    label: label(value),
  }))
}

const STATUS_OPTIONS = options(CALLS.map((call) => call.status))
const OUTCOME_OPTIONS = options(CALLS.map((call) => call.outcome))
const SCENARIO_OPTIONS = Array.from(
  new Set(CALLS.map((call) => call.scenario)),
).map((scenario) => ({ value: scenario, label: scenario }))

function inRange(stamp: string, range: DateRange | undefined) {
  if (!range?.from) return true
  const at = new Date(stamp.replace(/, (\d)/, " $1")).getTime()
  const from = new Date(range.from).setHours(0, 0, 0, 0)
  const to = new Date(range.to ?? range.from).setHours(23, 59, 59, 999)
  return at >= from && at <= to
}

export function ConversationsIndexPreview() {
  const [columns, setColumns] = React.useState(DEFAULT_COLUMNS)
  const [query, setQuery] = React.useState("")
  const [statuses, setStatuses] = React.useState<string[]>([])
  const [outcomes, setOutcomes] = React.useState<string[]>([])
  const [scenarios, setScenarios] = React.useState<string[]>([])
  const [date, setDate] = React.useState<DateRange | undefined>()
  const [pageSize, setPageSize] = React.useState(25)

  const activeCount = [
    statuses.length,
    outcomes.length,
    scenarios.length,
    date?.from,
  ].filter(Boolean).length

  const digits = query.replace(/\D/g, "")
  const rows = CALLS.filter(
    (call: CallRow) =>
      (!digits ||
        (call.phoneNumber ?? "").replace(/\D/g, "").includes(digits)) &&
      (!statuses.length || statuses.includes(call.status)) &&
      (!outcomes.length || outcomes.includes(call.outcome)) &&
      (!scenarios.length || scenarios.includes(call.scenario)) &&
      inRange(call.createdAt, date),
  )
  /* Unfiltered, the page stands for the whole history; filtered, the mock
     rows are all there is. */
  const total = activeCount || digits ? rows.length : TOTAL_RESULTS

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
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>
          <Button aria-label="Refresh" size="icon" variant="outline">
            <RefreshIcon />
          </Button>
          <FieldsDropdown columns={columns} onChange={setColumns} />
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
            setDate(undefined)
          }}
        >
          <SelectFilter
            field="Status"
            options={STATUS_OPTIONS}
            value={statuses}
            onChange={setStatuses}
          />
          <SelectFilter
            field="Outcome"
            options={OUTCOME_OPTIONS}
            value={outcomes}
            onChange={setOutcomes}
          />
          <DateFilter
            field="Date"
            value={date}
            onChange={setDate}
            today={TODAY}
          />
          <SelectFilter
            field="Scenario"
            options={SCENARIO_OPTIONS}
            value={scenarios}
            onChange={setScenarios}
          />
        </FilterBar>
      </div>

      {/* `--card-spacing: 0`: the table draws its own header band and rules. */}
      <Card className="[--card-spacing:0px]">
        <div className="overflow-x-auto">
          <CallTable calls={rows} columns={columns} onCallClick={() => {}} />
        </div>
      </Card>

      <ListFooter
        from={1}
        shown={rows.length}
        total={total}
        noun="calls"
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        atStart
        atEnd={rows.length >= total}
      />
    </div>
  )
}
