"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
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
import { ChoiceFilter, FilterBar } from "@/components/shared/filter-bar"
import { ListFooter } from "@/components/shared/list-footer"
import { PageHeader } from "@/components/shared/page-header"
import { PrimaryTabs } from "@/components/design-system/tabs-preview"
import { StatusChip } from "@/components/mockups/live-scenarios/status-chip"
import {
  ActiveViewIcon,
  CreateScenarioIcon,
  DeletedViewIcon,
  OpenPlaygroundIcon,
  RowActionsIcon,
  SearchScenariosIcon,
} from "@/components/mockups/live-scenarios/icons"
import {
  DELETED,
  SCENARIOS,
  type ScenarioRow,
} from "@/lib/mockups/live-scenarios-data"

/**
 * The scenarios index with what DES-203 asks for — "badge, filter":
 *
 *  - The badge: a live scenario's Status chip says Live instead of Active.
 *  - The filter: a chip under the search, as every index filter is in the
 *    design system — "+ Live status", then "Live status: Live". Never a
 *    dropdown: filters are chips. It is the Active view's alone, because a
 *    deleted scenario is never live.
 */

const LIVE_OPTIONS = [
  { value: "live", label: "Live" },
  { value: "not-live", label: "Not live" },
]

const VIEWS = [
  { id: "active", label: "Active", Icon: ActiveViewIcon },
  { id: "deleted", label: "Recently deleted", Icon: DeletedViewIcon },
]

export function ScenarioIndex() {
  const [view, setView] = React.useState("active")
  const [query, setQuery] = React.useState("")
  const [liveStatus, setLiveStatus] = React.useState<string | null>(null)

  const matches = (row: ScenarioRow) =>
    row.name.toLowerCase().includes(query.trim().toLowerCase()) &&
    (liveStatus === null || (liveStatus === "live") === (row.live !== null))

  return (
    <main className="mx-auto flex w-full max-w-350 flex-col gap-4 p-8">
      <PageHeader title="Scenarios" />

      <PrimaryTabs items={VIEWS} value={view} onValueChange={setView}>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <InputGroup className="min-w-64 flex-1">
              <InputGroupAddon>
                <SearchScenariosIcon />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Search scenarios"
                placeholder="Search by name..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </InputGroup>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <OpenPlaygroundIcon />
                Playground
              </Button>
              <Button>
                <CreateScenarioIcon />
                Create scenario
              </Button>
            </div>
          </div>

          {view === "active" ? (
            <FilterBar activeCount={liveStatus ? 1 : 0}>
              <ChoiceFilter
                field="Live status"
                options={LIVE_OPTIONS}
                value={liveStatus}
                onChange={setLiveStatus}
              />
            </FilterBar>
          ) : null}
        </div>

        <TabsContent value="active">
          <ScenarioList
            rows={SCENARIOS.filter(matches)}
            deleted={false}
            onClearFilter={liveStatus ? () => setLiveStatus(null) : undefined}
          />
        </TabsContent>
        <TabsContent value="deleted">
          <ScenarioList
            rows={DELETED.filter((row) =>
              row.name.toLowerCase().includes(query.trim().toLowerCase()),
            )}
            deleted
          />
        </TabsContent>
      </PrimaryTabs>
    </main>
  )
}

function ScenarioList({
  rows,
  deleted,
  onClearFilter,
}: {
  rows: ScenarioRow[]
  deleted: boolean
  /** Set while a filter is on, for the no-results way out. */
  onClearFilter?: () => void
}) {
  const [pageSize, setPageSize] = React.useState(10)
  const [page, setPage] = React.useState(0)
  const [confirming, setConfirming] = React.useState<ScenarioRow | null>(null)

  const pages = Math.max(1, Math.ceil(rows.length / pageSize))
  const current = Math.min(page, pages - 1)
  const visible = rows.slice(current * pageSize, (current + 1) * pageSize)

  function remove(row: ScenarioRow) {
    if (row.live) {
      setConfirming(row)
      return
    }
    toast(`${row.name} moved to Recently deleted`, {
      action: { label: "Undo", onClick: () => {} },
    })
  }

  if (rows.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No scenarios match</EmptyTitle>
        </EmptyHeader>
        {onClearFilter ? (
          <EmptyContent>
            <Button variant="outline" onClick={onClearFilter}>
              Clear filter
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    )
  }

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
                <span className="flex items-center gap-1">
                  {row.languages.map((code) => (
                    <Badge
                      key={code}
                      className="bg-muted text-muted-foreground"
                      variant="secondary"
                    >
                      {code}
                    </Badge>
                  ))}
                </span>
              </TableCell>
              <TableCell>
                <StatusChip live={row.live !== null} deleted={deleted} />
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {row.created}
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {row.updated}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.updatedBy ?? "—"}
              </TableCell>
              <TableCell className="py-1.5 text-end">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-label={`More actions for ${row.name}`}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <RowActionsIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {deleted ? (
                      <DropdownMenuItem>Restore</DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => remove(row)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>

      <ListFooter
        from={current * pageSize + 1}
        shown={visible.length}
        total={rows.length}
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

      <AlertDialog
        open={confirming !== null}
        onOpenChange={(open) => {
          if (!open) setConfirming(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirming?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              It&apos;s live, so callers routed to it stop reaching it. It moves
              to Recently deleted, where it can be restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                toast(`${confirming?.name} moved to Recently deleted`)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
