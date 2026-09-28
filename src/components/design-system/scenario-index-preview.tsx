"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { TabsContent } from "@/components/ui/tabs"
import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table"
import {
  AddFilter,
  DateFilter,
  FilterBar,
  SelectFilter,
  type DateRange,
} from "@/components/shared/filter-bar"
import { ListFooter } from "@/components/shared/list-footer"
import { PageHeader } from "@/components/shared/page-header"
import {
  LanguageChip,
  NotApplicable,
} from "@/components/design-system/call-table"
import { SecondaryTabs } from "@/components/design-system/tabs-preview"
import {
  CreateScenarioIcon,
  CreateTemplateIcon,
  ActiveIcon,
  DeletedIcon,
  PlaygroundIcon,
  RowMenuIcon,
  SearchIcon,
} from "@/components/design-system/icons"

/**
 * The index page, whole, as the product's scenarios list lays it out.
 *
 *  - Header: the title alone.
 *  - Views: Active and Recently deleted, as the system's secondary tabs under
 *    the title — they pick the list, so they come before what narrows it.
 *  - Controls: search filling the row with the page's buttons at its end,
 *    then the filter chips under it.
 *  - Content: the table, then the footer under it.
 *
 * The admin view the product puts above all of this has its own topic.
 */

type Scenario = {
  id: string
  name: string
  languages: string[]
  created: string
  updated: string
  /** Null when nobody has edited it since it was created. */
  updatedBy: string | null
}

const ACTIVE: Scenario[] = [
  {
    id: "s1",
    name: "Welcome and onboarding (outbound)",
    languages: ["AR", "EN"],
    created: "28 Sep 2026, 17:07",
    updated: "28 Sep 2026, 17:26",
    updatedBy: "rmansour",
  },
  {
    id: "s2",
    name: "Temporary licence reminder (outbound)",
    languages: ["AR", "EN"],
    created: "28 Sep 2026, 17:07",
    updated: "28 Sep 2026, 17:07",
    updatedBy: null,
  },
  {
    id: "s3",
    name: "Invoices awaiting payment (outbound)",
    languages: ["AR", "EN"],
    created: "28 Sep 2026, 17:06",
    updated: "28 Sep 2026, 17:25",
    updatedBy: "rmansour",
  },
  {
    id: "s4",
    name: "Returned licence requests (outbound)",
    languages: ["AR", "EN"],
    created: "28 Sep 2026, 17:06",
    updated: "28 Sep 2026, 17:25",
    updatedBy: "rmansour",
  },
  {
    id: "s5",
    name: "Inbound agent",
    languages: ["AR"],
    created: "28 Sep 2026, 15:20",
    updated: "28 Sep 2026, 15:21",
    updatedBy: "aalharbi",
  },
  {
    id: "s6",
    name: "Debt collection (hard posture)",
    languages: ["AR"],
    created: "27 Sep 2026, 18:11",
    updated: "27 Sep 2026, 18:16",
    updatedBy: "aalharbi",
  },
  {
    id: "s7",
    name: "Card offer (outbound sales)",
    languages: ["AR"],
    created: "27 Sep 2026, 18:10",
    updated: "27 Sep 2026, 18:10",
    updatedBy: null,
  },
  {
    id: "s8",
    name: "Debt collection (standard posture)",
    languages: ["AR"],
    created: "27 Sep 2026, 18:09",
    updated: "27 Sep 2026, 18:09",
    updatedBy: null,
  },
  {
    id: "s9",
    name: "Plan upgrade (subscription upsell)",
    languages: ["AR"],
    created: "27 Sep 2026, 18:09",
    updated: "27 Sep 2026, 18:09",
    updatedBy: null,
  },
  {
    id: "s10",
    name: "Appointment booking",
    languages: ["AR", "EN"],
    created: "26 Sep 2026, 11:42",
    updated: "27 Sep 2026, 09:03",
    updatedBy: "fjanahi",
  },
  {
    id: "s11",
    name: "Delivery confirmation",
    languages: ["AR", "UR"],
    created: "25 Sep 2026, 16:30",
    updated: "25 Sep 2026, 16:30",
    updatedBy: null,
  },
  {
    id: "s12",
    name: "Renewal follow-up",
    languages: ["EN"],
    created: "24 Sep 2026, 10:15",
    updated: "26 Sep 2026, 14:48",
    updatedBy: "talzamel",
  },
]

const DELETED: Scenario[] = [
  {
    id: "d1",
    name: "Card offer (old script)",
    languages: ["AR"],
    created: "12 Sep 2026, 10:02",
    updated: "26 Sep 2026, 13:40",
    updatedBy: "aalharbi",
  },
  {
    id: "d2",
    name: "Survey pilot",
    languages: ["EN"],
    created: "02 Sep 2026, 09:20",
    updated: "20 Sep 2026, 17:11",
    updatedBy: "fjanahi",
  },
]

const VIEWS = [
  { id: "active", label: "Active", Icon: ActiveIcon },
  { id: "deleted", label: "Recently deleted", Icon: DeletedIcon },
]

/** The day the mock data was captured, so the date presets land on it. */
const TODAY = new Date(2026, 8, 28)

/** "28 Sep 2026, 17:07" as a Date. */
function parse(stamp: string) {
  return new Date(stamp.replace(",", ""))
}

function inRange(stamp: string, range: DateRange | undefined) {
  if (!range?.from) return true
  const at = parse(stamp).getTime()
  const from = new Date(range.from).setHours(0, 0, 0, 0)
  const to = new Date(range.to ?? range.from).setHours(23, 59, 59, 999)
  return at >= from && at <= to
}

const EDITORS = Array.from(
  new Set(
    [...ACTIVE, ...DELETED].flatMap((row) =>
      row.updatedBy ? [row.updatedBy] : [],
    ),
  ),
).map((name) => ({ value: name, label: name }))

const LANGUAGE_OPTIONS = [
  { value: "AR", label: "Arabic" },
  { value: "EN", label: "English" },
  { value: "UR", label: "Urdu" },
]

export function ScenarioIndexPreview() {
  const [view, setView] = React.useState("active")
  const [query, setQuery] = React.useState("")
  const [updated, setUpdated] = React.useState<DateRange | undefined>()
  const [languages, setLanguages] = React.useState<string[]>([])
  const [editors, setEditors] = React.useState<string[]>([])
  /* Created is the one filter behind + Filter: its chip exists only once it
     has been added, and goes back into the menu when cleared. */
  const [created, setCreated] = React.useState<DateRange | undefined>()
  const [showCreated, setShowCreated] = React.useState(false)

  const activeCount = [
    updated?.from,
    languages.length,
    editors.length,
    created?.from,
  ].filter(Boolean).length

  const matches = (row: Scenario) =>
    row.name.toLowerCase().includes(query.trim().toLowerCase()) &&
    inRange(row.updated, updated) &&
    inRange(row.created, created) &&
    (!languages.length ||
      languages.some((code) => row.languages.includes(code))) &&
    (!editors.length || (row.updatedBy && editors.includes(row.updatedBy)))

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Scenarios" />

      <SecondaryTabs items={VIEWS} value={view} onValueChange={setView}>
        {/* Search and filters are one control — the filters narrow what the
          search finds — so they sit closer to each other than to anything
          else on the page. */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <InputGroup className="min-w-64 flex-1">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Search scenarios"
                placeholder="Search by name..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </InputGroup>
            <div className="flex items-center gap-2">
              <Button variant="outline">Import</Button>
              <Button variant="outline">
                <PlaygroundIcon />
                Playground
              </Button>
              <Button>
                <CreateScenarioIcon />
                Create scenario
              </Button>
            </div>
          </div>

          <FilterBar
            activeCount={activeCount}
            onClearAll={() => {
              setUpdated(undefined)
              setLanguages([])
              setEditors([])
              setCreated(undefined)
              setShowCreated(false)
            }}
          >
            <DateFilter
              field="Last updated"
              value={updated}
              onChange={setUpdated}
              today={TODAY}
            />
            <SelectFilter
              field="Language"
              options={LANGUAGE_OPTIONS}
              value={languages}
              onChange={setLanguages}
            />
            <SelectFilter
              field="Updated by"
              options={EDITORS}
              value={editors}
              onChange={setEditors}
            />
            {showCreated ? (
              <DateFilter
                field="Created"
                value={created}
                onChange={(next) => {
                  setCreated(next)
                  if (!next) setShowCreated(false)
                }}
                today={TODAY}
              />
            ) : null}
            <AddFilter
              fields={showCreated ? [] : [{ id: "created", label: "Created" }]}
              onAdd={() => setShowCreated(true)}
            />
          </FilterBar>
        </div>

        <TabsContent value="active">
          <ScenarioList rows={ACTIVE.filter(matches)} deleted={false} />
        </TabsContent>
        <TabsContent value="deleted">
          <ScenarioList rows={DELETED.filter(matches)} deleted />
        </TabsContent>
      </SecondaryTabs>
    </div>
  )
}

function ScenarioList({
  rows,
  deleted,
}: {
  rows: Scenario[]
  deleted: boolean
}) {
  const [pageSize, setPageSize] = React.useState(10)
  const [page, setPage] = React.useState(0)

  const matched = rows
  const pages = Math.max(1, Math.ceil(matched.length / pageSize))
  const current = Math.min(page, pages - 1)
  const visible = matched.slice(current * pageSize, (current + 1) * pageSize)

  return (
    <div className="flex flex-col gap-4">
      <DataTable>
        <TableHeader>
          <DataTableHeaderRow>
            <DataTableHead>Name</DataTableHead>
            <DataTableHead>Languages</DataTableHead>
            <DataTableHead>Status</DataTableHead>
            <DataTableHead>Created</DataTableHead>
            <DataTableHead>Last updated</DataTableHead>
            <DataTableHead>Updated by</DataTableHead>
            <DataTableHead className="text-end">
              <span className="sr-only">Actions</span>
            </DataTableHead>
          </DataTableHeaderRow>
        </TableHeader>
        <TableBody>
          {visible.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>
                <LanguageChip languages={row.languages} />
              </TableCell>
              <TableCell>
                {deleted ? (
                  <Badge
                    className="bg-muted text-muted-foreground"
                    variant="secondary"
                  >
                    Deleted
                  </Badge>
                ) : (
                  <Badge
                    className="bg-success-tint text-success-tint-foreground"
                    variant="secondary"
                  >
                    Active
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {row.created}
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {row.updated}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.updatedBy ?? <NotApplicable />}
              </TableCell>
              <TableCell className="py-1.5 text-end">
                <div className="flex items-center justify-end gap-1">
                  {deleted ? null : (
                    <Button
                      aria-label={`Create a template from ${row.name}`}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <CreateTemplateIcon />
                    </Button>
                  )}
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-label={`More actions for ${row.name}`}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <RowMenuIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {deleted ? (
                        <>
                          <DropdownMenuItem>Restore</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive">
                            Delete permanently
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive">
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>

      <ListFooter
        from={current * pageSize + 1}
        shown={visible.length}
        total={matched.length}
        noun="scenarios"
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(0)
        }}
        atStart={current === 0}
        atEnd={current >= pages - 1}
        onFirst={() => setPage(0)}
        onPrevious={() => setPage(current - 1)}
        onNext={() => setPage(current + 1)}
      />
    </div>
  )
}
