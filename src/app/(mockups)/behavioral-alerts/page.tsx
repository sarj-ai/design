"use client"

import * as React from "react"

import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CALLS,
  CONFIGURED_ALERTS,
  OWNER,
  SCENARIO_NAME,
  SEVERITY_LABELS,
  SEVERITY_ORDER,
  type ConfiguredAlert,
} from "@/lib/mockups/behavioral-alerts-data"
import {
  DEFAULT_COLUMNS,
  TOTAL_RESULTS,
  type CallRow as ListCallRow,
} from "@/lib/mockups/conversations-revamp-list-data"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { CallDrawer } from "@/components/mockups/behavioral-alerts/call-drawer"
import { SEVERITY_DOT } from "@/components/mockups/behavioral-alerts/severity"
import { ScenarioAlertsSection } from "@/components/mockups/behavioral-alerts/scenario-alerts-section"
import { CallTable } from "@/components/mockups/conversations-revamp/list/call-table"
import { SearchFilters } from "@/components/mockups/conversations-revamp/list/search-filters"
import {
  NextIcon,
  PreviousIcon,
} from "@/components/mockups/conversations-revamp/list/icons"

type Surface = "call" | "scenario"

const STATE_OPTIONS: { id: string; label: string }[] = [
  { id: "call-1", label: "Flags detected" },
  { id: "call-3", label: "One mild detection" },
  { id: "call-2", label: "Nothing detected" },
  { id: "call-4", label: "Still analysing" },
  { id: "call-5", label: "No flags configured" },
  { id: "call-6", label: "No transcript" },
]

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`
}

function FlagMarker({ callId }: { callId: string }) {
  const detections =
    CALLS.find((call) => call.id === callId)?.analysis.detections ?? []
  if (detections.length === 0) return null

  const worst =
    SEVERITY_ORDER.find((severity) =>
      detections.some((detection) => detection.severity === severity),
    ) ?? "mild"

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={`${detections.length} flags detected`}
        className={cn(
          "absolute -end-1 -top-1 size-2 rounded-4xl ring-2 ring-card",
          SEVERITY_DOT[worst],
        )}
      />
      <TooltipContent>
        {detections.length === 1
          ? "1 flag detected"
          : `${detections.length} flags detected`}
        {` · worst ${SEVERITY_LABELS[worst]}`}
      </TooltipContent>
    </Tooltip>
  )
}

const LIST_ROWS: ListCallRow[] = CALLS.map((call) => {
  const journey = call.analysis.journey

  return {
    agentOutcome: !journey
      ? ("unavailable" as const)
      : journey.rating >= 3
        ? ("helpful" as const)
        : ("not_helpful" as const),
    createdAt: call.createdAt,
    direction: call.direction,
    duration: formatDuration(call.duration),
    id: call.id,
    interactionType: "call" as const,
    outcome:
      call.outcome.status === "success"
        ? ("met" as const)
        : ("not_met" as const),
    outcomeReason: call.outcome.reason,
    phoneNumber: call.phoneNumber,
    scenario: call.scenario,
    status: call.status,
    user: OWNER.email,
  }
})

export default function BehavioralAlertsPage() {
  const [surface, setSurface] = React.useState<Surface>("call")
  const [openCallId, setOpenCallId] = React.useState<null | string>("call-1")
  const [columns, setColumns] = React.useState(DEFAULT_COLUMNS)
  const [alerts, setAlerts] =
    React.useState<ConfiguredAlert[]>(CONFIGURED_ALERTS)

  const openCall = CALLS.find((call) => call.id === openCallId) ?? null

  function navigate(title: string) {
    if (title === "Scenarios") {
      setOpenCallId(null)
      setSurface("scenario")
    }
    if (title === "Conversations") setSurface("call")
  }

  return (
    <MockupShell
      actions={
        <>
          <ToggleGroup
            onValueChange={(value) => {
              if (!value) return
              setSurface(value as Surface)
            }}
            size="sm"
            type="single"
            value={surface}
            variant="outline"
          >
            <ToggleGroupItem value="call">Call detail</ToggleGroupItem>
            <ToggleGroupItem value="scenario">
              Scenario settings
            </ToggleGroupItem>
          </ToggleGroup>

          <Separator className="h-5" orientation="vertical" />

          {surface === "call" ? (
            <Select
              onValueChange={setOpenCallId}
              value={openCallId ?? undefined}
            >
              <SelectTrigger aria-label="Open a call" size="sm">
                <SelectValue placeholder="Open a call" />
              </SelectTrigger>
              <SelectContent position="popper">
                {STATE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <ToggleGroup
              onValueChange={(value) => {
                if (!value) return
                setAlerts(value === "empty" ? [] : CONFIGURED_ALERTS)
              }}
              size="sm"
              type="single"
              value={alerts.length === 0 ? "empty" : "configured"}
              variant="outline"
            >
              <ToggleGroupItem value="configured">Configured</ToggleGroupItem>
              <ToggleGroupItem value="empty">Empty</ToggleGroupItem>
            </ToggleGroup>
          )}
        </>
      }
      eyebrow={
        surface === "call" ? "Monitor · Conversations" : "Build · Scenarios"
      }
      title="Configure call flags and surface them after every call"
    >
      {surface === "call" ? (
        <AppShell active="Conversations" onNavigate={navigate}>
          <div className="flex-1 p-3 lg:p-4">
            <SearchFilters columns={columns} onColumnsChange={setColumns} />

            <div className="mt-4 mb-2 text-sm text-muted-foreground">
              {TOTAL_RESULTS.toLocaleString("en-US")} results
            </div>

            {/* `--card-spacing: 0` lets the table's header band reach the card's edge. */}
            <Card className="[--card-spacing:0px]" id="calls-table">
              <div className="overflow-x-auto">
                <CallTable
                  calls={LIST_ROWS}
                  columns={columns}
                  onCallClick={(call) => {
                    setOpenCallId(call.id)
                  }}
                  rowMarker={(call) => <FlagMarker callId={call.id} />}
                />
              </div>
            </Card>
          </div>

          <div className="sticky bottom-0 z-sticky bg-background px-3 py-2 lg:px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 md:gap-4">
                <p className="text-sm text-muted-foreground">
                  Showing {LIST_ROWS.length} of{" "}
                  {TOTAL_RESULTS.toLocaleString("en-US")} calls
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select defaultValue="25">
                    <SelectTrigger
                      className="w-20"
                      aria-label="Results per page"
                    >
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

          <CallDrawer
            call={openCall}
            onConfigureAlerts={() => {
              setOpenCallId(null)
              setSurface("scenario")
            }}
            onOpenChange={(next) => {
              if (!next) setOpenCallId(null)
            }}
            open={openCall !== null}
          />
        </AppShell>
      ) : (
        <AppShell
          active="Scenarios"
          breadcrumb={SCENARIO_NAME}
          onNavigate={navigate}
        >
          <main className="flex-1 p-3 lg:p-4">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
              <h1 className="text-3xl font-bold">{SCENARIO_NAME}</h1>

              <Tabs defaultValue="scenario">
                <TabsList>
                  <TabsTrigger disabled value="configuration">
                    Configuration
                  </TabsTrigger>
                  <TabsTrigger value="scenario">Scenario</TabsTrigger>
                  <TabsTrigger disabled value="schedule">
                    Schedule Configuration
                  </TabsTrigger>
                </TabsList>

                <TabsContent className="mt-6" value="scenario">
                  <Card className="bg-muted" id="card-call-flags">
                    <CardContent>
                      <ScenarioAlertsSection
                        alerts={alerts}
                        onAlertsChange={setAlerts}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </AppShell>
      )}
    </MockupShell>
  )
}
