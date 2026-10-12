"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
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
import { SearchRequestsIcon } from "@/components/mockups/publish-approval/icons"
import { StatusBadge } from "@/components/mockups/publish-approval/status-badge"
import {
  type ApprovalRequest,
  type CaseId,
  type Viewer,
  who,
} from "@/lib/mockups/publish-approval-data"

/**
 * Approvals — the page the PRD's mockups put in the nav, where the email and
 * the in-app notification both land. Every request the viewer can see: a
 * client sees their own organization's, Sarj staff every organization they
 * can access, so a requester and an approver read the same record.
 *
 * Laid out by the index page rules: tabs for the two views, search, filter
 * chips, the table, the pagination block. Waiting shows how long each has
 * waited (PRD); Closed shows the outcome and who closed it. A row opens the
 * request as a record drawer.
 */

const VIEWS = [
  { id: "waiting", label: "Waiting" },
  { id: "closed", label: "Closed" },
]

type Load = "loading" | "failed" | "ready"

export function ApprovalsPage({
  requests,
  viewer,
  caseId,
  onOpen,
}: {
  /** What this viewer can see, newest first. */
  requests: ApprovalRequest[]
  viewer: Viewer
  caseId: CaseId
  /** Opens one request; ↑ ↓ step through the list it was opened from. */
  onOpen: (id: string, list: string[]) => void
}) {
  const [view, setView] = React.useState("waiting")
  const [query, setQuery] = React.useState("")
  const [requester, setRequester] = React.useState<string | null>(null)
  const [load, setLoad] = React.useState<Load>("loading")
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    const timer = setTimeout(
      () =>
        setLoad(caseId === "load-fails" && attempt === 0 ? "failed" : "ready"),
      600,
    )
    return () => clearTimeout(timer)
  }, [attempt, caseId])

  const requesters = [...new Set(requests.map((request) => request.by))].map(
    (name) => ({ value: name, label: who(name, viewer) }),
  )
  const matches = (request: ApprovalRequest) =>
    request.item.toLowerCase().includes(query.trim().toLowerCase()) &&
    (requester === null || request.by === requester)
  const filtering = query.trim() !== "" || requester !== null
  const clear = () => {
    setQuery("")
    setRequester(null)
  }

  const waiting = requests.filter((r) => r.status === "pending")
  const closed = requests.filter((r) => r.status !== "pending")

  return (
    <main className="mx-auto flex w-full max-w-350 flex-col gap-4 p-8">
      <PageHeader title="Approvals" />

      <PrimaryTabs
        items={VIEWS.map((entry) => ({
          ...entry,
          label:
            entry.id === "waiting" && load === "ready" && waiting.length > 0
              ? `Waiting · ${waiting.length}`
              : entry.label,
        }))}
        onValueChange={setView}
        value={view}
      >
        <div className="flex flex-col gap-2">
          <InputGroup className="min-w-64">
            <InputGroupAddon>
              <SearchRequestsIcon />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search requests"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by scenario..."
              value={query}
            />
          </InputGroup>
          <FilterBar activeCount={requester ? 1 : 0}>
            <ChoiceFilter
              field="Requested by"
              onChange={setRequester}
              options={requesters}
              value={requester}
            />
          </FilterBar>
        </div>

        {load === "loading" ? (
          <TableSkeleton />
        ) : load === "failed" ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Couldn’t load requests</EmptyTitle>
              <EmptyDescription>
                Nothing was approved or rejected. Requests keep waiting until
                someone acts.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                onClick={() => {
                  setLoad("loading")
                  setAttempt((count) => count + 1)
                }}
                size="lg"
                variant="outline"
              >
                Try again
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <TabsContent value="waiting">
              <RequestTable
                closed={false}
                empty="Nothing waiting for approval"
                filtering={filtering}
                onClear={clear}
                onOpen={onOpen}
                rows={waiting.filter(matches)}
                viewer={viewer}
              />
            </TabsContent>
            <TabsContent value="closed">
              <RequestTable
                closed
                empty="No closed requests"
                filtering={filtering}
                onClear={clear}
                onOpen={onOpen}
                rows={closed.filter(matches)}
                viewer={viewer}
              />
            </TabsContent>
          </>
        )}
      </PrimaryTabs>
    </main>
  )
}

function RequestTable({
  rows,
  closed,
  viewer,
  empty,
  filtering,
  onClear,
  onOpen,
}: {
  rows: ApprovalRequest[]
  closed: boolean
  viewer: Viewer
  empty: string
  filtering: boolean
  onClear: () => void
  onOpen: (id: string, list: string[]) => void
}) {
  const [pageSize, setPageSize] = React.useState(10)

  if (rows.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{filtering ? "No requests match" : empty}</EmptyTitle>
        </EmptyHeader>
        {filtering ? (
          <EmptyContent>
            <Button onClick={onClear} variant="outline">
              Clear filters
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    )
  }

  const visible = rows.slice(0, pageSize)
  const ids = visible.map((row) => row.id)

  return (
    <div className="flex flex-col gap-4">
      <DataTable>
        <TableHeader>
          <DataTableHeaderRow>
            <DataTableHead>Change</DataTableHead>
            {/* A client approves only their own organization's, so the
                column would say the same thing on every row. */}
            {viewer.sarj ? <DataTableHead>Approver</DataTableHead> : null}
            <DataTableHead>Requested by</DataTableHead>
            <DataTableHead>Raised</DataTableHead>
            {closed ? (
              <>
                <DataTableHead>Outcome</DataTableHead>
                <DataTableHead>Closed by</DataTableHead>
              </>
            ) : (
              <DataTableHead>Waiting</DataTableHead>
            )}
          </DataTableHeaderRow>
        </TableHeader>
        <TableBody>
          {visible.map((row) => (
            <TableRow
              className="cursor-pointer"
              key={row.id}
              onClick={() => onOpen(row.id, ids)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onOpen(row.id, ids)
              }}
              tabIndex={0}
            >
              <TableCell className="font-medium tabular-nums">
                {row.item}{" "}
                <span className="font-normal text-muted-foreground">
                  v{row.version}
                </span>
              </TableCell>
              {viewer.sarj ? (
                <TableCell>{row.org ?? "Super admin"}</TableCell>
              ) : null}
              <TableCell>{who(row.by, viewer)}</TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {row.raised}
              </TableCell>
              {closed ? (
                <>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {row.decision
                      ? `${who(row.decision.by, viewer)}, ${row.decision.at}`
                      : "—"}
                  </TableCell>
                </>
              ) : (
                <TableCell className="tabular-nums">{row.waiting}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </DataTable>

      <ListFooter
        from={1}
        noun="requests"
        onPageSizeChange={setPageSize}
        pageSize={pageSize}
        shown={visible.length}
        total={rows.length}
        atEnd={visible.length === rows.length}
      />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton
          className="h-10 w-full motion-reduce:animate-none"
          key={index}
        />
      ))}
    </div>
  )
}
