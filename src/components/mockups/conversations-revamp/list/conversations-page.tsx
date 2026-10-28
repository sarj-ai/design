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
} from "@/lib/mockups/conversations-revamp-list-data"
import { toast } from "sonner"

import {
  CALL_SPECIFICS,
  type CallState,
  type Channel,
} from "@/lib/mockups/conversations-revamp-drawer-data"

const PRE_CALL_STATUSES = new Set<CallStatus>([
  "queued",
  "ringing",
  "dialing",
  "in_progress",
  "transferring",
])
import { AppShell } from "@/components/shell/app-shell"
import { FourthDrawer } from "@/components/mockups/conversations-revamp/drawer/fourth-drawer"
import { CallTable } from "@/components/mockups/conversations-revamp/list/call-table"
import { SearchFilters } from "@/components/mockups/conversations-revamp/list/search-filters"
import {
  NextIcon,
  PreviousIcon,
} from "@/components/mockups/conversations-revamp/list/icons"

export function ConversationsPage({
  initialDrawerOpen = false,
  initialStatusOpen = false,
}: {
  initialDrawerOpen?: boolean
  initialStatusOpen?: boolean
}) {
  const [drawerOpen, setDrawerOpen] = React.useState(initialDrawerOpen)
  const [columns, setColumns] = React.useState(DEFAULT_COLUMNS)
  const [drawerState, setDrawerState] = React.useState<CallState>("complete")
  const [drawerChannel, setDrawerChannel] = React.useState<Channel>("call")

  const [rows, setRows] = React.useState(CALLS)
  const [selected, setSelected] = React.useState<CallRow | null>(null)

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

        {/* `--card-spacing: 0` lets content reach the card edge; the table
           draws its own header band. */}
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
                <SelectContent position="popper">
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
