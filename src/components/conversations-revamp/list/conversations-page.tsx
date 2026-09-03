"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CALLS,
  type CallRow,
  DEFAULT_COLUMNS,
  TOTAL_RESULTS,
  type CallStatus,
} from "@/lib/conversations-revamp-list-data"
import { toast } from "sonner"

import {
  CALL_SPECIFICS,
  type CallState,
  type Channel,
} from "@/lib/conversations-revamp-drawer-data"

/** Statuses where the call has not produced anything to read yet. */
const PRE_CALL_STATUSES = new Set<CallStatus>([
  "queued",
  "ringing",
  "dialing",
  "in_progress",
  "transferring",
])
import { AppShell } from "@/components/app-shell"
import { FourthDrawer } from "@/components/conversations-revamp/drawer/fourth-drawer"
import { CallTable } from "@/components/conversations-revamp/list/call-table"
import { SearchFilters } from "@/components/conversations-revamp/list/search-filters"
import {
  NextIcon,
  PreviousIcon,
} from "@/components/conversations-revamp/list/icons"

/**
 * Conversations, as the page ships today — the filter bar, the result count,
 * the table, and the pagination row pinned to the bottom — with the revamped
 * drawer behind its rows. The breadcrumb belongs to the app header, one level
 * up in the shell.
 *
 * The list is untouched on purpose. What changes when a row is clicked is the
 * drawer, so the page around it stays the one people already know.
 */
export function ConversationsPage({
  initialDrawerOpen = false,
  initialStatusOpen = false,
}: {
  /** Opens the call drawer, for reviewing and exporting that state. */
  initialDrawerOpen?: boolean
  /** Opens the Status filter's list. */
  initialStatusOpen?: boolean
}) {
  const [drawerOpen, setDrawerOpen] = React.useState(initialDrawerOpen)
  /** Owned here because Fields sets it and the table reads it. */
  const [columns, setColumns] = React.useState(DEFAULT_COLUMNS)
  /**
   * Which drawer the clicked row gets. A call that has not run has no
   * recording, transcript or outcome to show, so the drawer that expects all
   * three is the wrong one to open.
   */
  const [drawerState, setDrawerState] = React.useState<CallState>("complete")
  /* The row's own type, not its status. A chat row used to open the call
     drawer — recording player, phone number, seekable timestamps — because
     nothing downstream ever read `interactionType`. The table no longer shows
     a Type column, but the field still decides which drawer a row opens. */
  const [drawerChannel, setDrawerChannel] = React.useState<Channel>("call")

  /* Rows are state because cancelling a scheduled call has to change one, and
     the row is where the status the reader is looking for actually lives. */
  const [rows, setRows] = React.useState(CALLS)
  /**
   * Which row is open.
   *
   * The drawer used to be told only what *kind* of call it was showing —
   * complete, queued or scheduled — and read one hardcoded record for
   * everything else, so all twelve rows opened the same call. Nothing about a
   * call's relationships could be shown while the drawer could not name it.
   */
  const [selected, setSelected] = React.useState<CallRow | null>(null)

  /* Cancelled is terminal: the booking is gone and the schedule that explained
     it goes with it, which is why the origin is cleared too. */
  function cancelSelected() {
    if (!selected) return

    setRows((current) =>
      current.map((row) =>
        row.id === selected.id
          ? { ...row, scheduleOrigin: undefined, status: "cancelled" as const }
          : row,
      ),
    )
    setDrawerOpen(false)
    toast.success("Scheduled call cancelled", {
      description: `${selected.scenario} · ${selected.phoneNumber ?? "chat"}`,
    })
  }

  return (
    <AppShell active="Conversations">
      <div className="flex-1 p-3 lg:p-4">
        <SearchFilters
          columns={columns}
          onColumnsChange={setColumns}
          statusOpen={initialStatusOpen}
        />

        <div className="mt-4 mb-2 text-sm text-muted-foreground">
          {TOTAL_RESULTS.toLocaleString("en-US")} results
        </div>

        {/* `--card-spacing: 0` is how Card is meant to be told its content
            reaches the edge — the table draws its own header band and row
            rules, so the card's usual 16px inset showed as a white strip above
            the header instead of framing anything. */}
        <Card className="[--card-spacing:0px]" id="calls-table">
          <div className="overflow-x-auto">
            <CallTable
              calls={rows}
              columns={columns}
              onCallClick={(call) => {
                setSelected(call)
                setDrawerState(
                  call.status === "scheduled"
                    ? "scheduled"
                    : PRE_CALL_STATUSES.has(call.status)
                      ? "queued"
                      : "complete",
                )
                setDrawerChannel(call.interactionType)
                setDrawerOpen(true)
              }}
            />
          </div>
        </Card>
      </div>

      <div className="sticky bottom-0 z-sticky bg-background px-3 py-2 lg:px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {rows.length} of {TOTAL_RESULTS.toLocaleString("en-US")}{" "}
              calls
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select defaultValue="25">
                <SelectTrigger className="w-20" aria-label="Results per page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 md:justify-end">
            <Button disabled size="sm" variant="outline">
              First
            </Button>
            <Button disabled size="sm" variant="outline">
              <PreviousIcon />
              Previous
            </Button>
            <Button size="sm" variant="outline">
              Next
              <NextIcon />
            </Button>
          </div>
        </div>
      </div>

      <FourthDrawer
        channel={drawerChannel}
        onCancelCall={cancelSelected}
        onOpenChange={setDrawerOpen}
        open={drawerOpen}
        specifics={(selected && CALL_SPECIFICS[selected.id]) || {}}
        state={drawerState}
        title={
          selected
            ? {
                duration: selected.duration,
                id: selected.id,
                phoneNumber: selected.phoneNumber,
                scenario: selected.scenario,
                startedAt: selected.createdAt,
              }
            : undefined
        }
      />
    </AppShell>
  )
}
