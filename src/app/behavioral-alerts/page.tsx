"use client"

import * as React from "react"

import { AppShell } from "@/components/app-shell"
import { MockupShell } from "@/components/mockup-shell"
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
} from "@/lib/behavioral-alerts-data"
import {
  DEFAULT_COLUMNS,
  TOTAL_RESULTS,
  type CallRow as ListCallRow,
} from "@/lib/conversations-revamp-list-data"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { CallDrawer } from "@/components/behavioral-alerts/call-drawer"
import { SEVERITY_DOT } from "@/components/behavioral-alerts/severity"
import { ScenarioAlertsSection } from "@/components/behavioral-alerts/scenario-alerts-section"
import { CallTable } from "@/components/conversations-revamp/list/call-table"
import { SearchFilters } from "@/components/conversations-revamp/list/search-filters"
import {
  NextIcon,
  PreviousIcon,
} from "@/components/conversations-revamp/list/icons"

/**
 * Post-call behavioural alerts — the whole PRD, on one route.
 *
 * The PRD has two screens and they are the same feature seen from its two ends:
 * an admin says what to watch for on a scenario, and a reviewer reads what was
 * found on a call. Reviewed apart, neither one can be checked against the other
 * — the words in the alert's name are the words that head its detection, and
 * the priority an admin sets is the thing severity is repeatedly mistaken for.
 * So they are one route with a switch, not two cards on the index.
 *
 * The three post-call analyst behaviours the PRD describes are not drawn: they
 * have no screen. What they produce is what the drawer's Alerts section
 * renders, and the six states in the Open list below are the six things they
 * can hand it.
 *
 * The page around the drawer is `/conversations-revamp`'s, component for
 * component — the filter bar, the result count, the table and the pagination
 * row. Nothing about the list changes for this PRD, so none of it is redrawn
 * here; what changes when a row is clicked is the drawer, and that is the only
 * thing this route is asking anyone to look at.
 */

type Surface = "call" | "scenario"

/** Which call the Open list points at, labelled by the state it demonstrates. */
const STATE_OPTIONS: { id: string; label: string }[] = [
  { id: "call-1", label: "Flags detected" },
  { id: "call-3", label: "One mild detection" },
  { id: "call-2", label: "Nothing detected" },
  { id: "call-4", label: "Still analysing" },
  { id: "call-5", label: "No flags configured" },
  { id: "call-6", label: "No transcript" },
]

/** m:ss, the way the shipping table prints a duration. */
function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`
}

/**
 * The six calls in the shape `/conversations-revamp`'s table reads.
 *
 * A translation, not a second set of rows — every value comes off the call it
 * is built from. Agent outcome is the one column with no field of its own, so
 * it reads the satisfaction rating the analyst already assigns: the column
 * asks whether the agent was any use to the person on the line, and that
 * rating is the analyst answering exactly that. A call the analyst has not
 * reached yet has no rating, and says Unavailable rather than guessing.
 */
/**
 * The mark on a row whose call had something detected.
 *
 * A reviewer opens this list to find the calls worth opening, and nothing in
 * the columns says which those are — Completed and Met describe whether the
 * workflow ran, not whether the caller was furious while it did.
 *
 * A dot on the time icon rather than a glyph in a column of its own. At the
 * size a table row gives it, a flag is a smudge; a dot at the corner of an icon
 * is the one mark that reads at 8px, and it costs the table no width.
 */
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
        /* `ring-card` cuts the dot out of the row rather than letting it sit on
           the clock's own strokes. */
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

  /**
   * The sidebar switches surfaces, so the two halves of this design are
   * reachable the way they are in the product rather than only from the
   * toolbar above the mockup. Conversations and Scenarios are the two this
   * design occupies; the rest of the nav is not part of it and does nothing.
   */
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
            /* Every state is a real row in the table below, so this only saves
               the reviewer from guessing which row is which. */
            <Select
              onValueChange={setOpenCallId}
              value={openCallId ?? undefined}
            >
              <SelectTrigger aria-label="Open a call" size="sm">
                <SelectValue placeholder="Open a call" />
              </SelectTrigger>
              <SelectContent>
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

            {/* `--card-spacing: 0` is how Card is meant to be told its content
                reaches the edge — the table draws its own header band and row
                rules, so the card's usual 16px inset showed as a white strip
                above the header instead of framing anything. */}
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
          {/* The scenario editor as the platform builds it: a centred
              max-w-3xl column, the name at the top, then the tab strip on a
              rule with the sections stacked under it. Call flags sits on
              Scenario, next to Data extraction and Record sinks — the other
              two tabs exist in the product and carry nothing this design
              touches, so they are shown and disabled rather than invented. */}
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
                  {/* Every section on this page is wrapped this way — a muted
                      card holding the section's own card. */}
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
