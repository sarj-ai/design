"use client"

import * as React from "react"

import { AppShell } from "@/components/app-shell"
import { MockupShell } from "@/components/mockup-shell"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  BATCH_NAME,
  QUEUED_CALLS,
  SCENARIO_NAME,
  SCENARIO_RETRY,
  SCHEDULED_CALLS,
  type RetryConfig,
} from "@/lib/call-retry-data"
import { BatchRetry } from "@/components/call-retry/batch-retry"
import { ScenarioRetry } from "@/components/call-retry/scenario-retry"

/**
 * Global call retry — DES-145.
 *
 * The PRD's two layers, on one route. A scenario owns the retry configuration
 * and every trigger source inherits it; a source can override it. Reviewed
 * apart, neither half can be checked against the other — an override is only
 * legible as an override if it is visibly the same fields with the same bounds
 * — so they are one route with a switch, not two cards on the index.
 *
 * Batch Calls is the source drawn, because it is the one that already has retry
 * settings of its own today. Those settings are currently independent of the
 * scenario rather than an override of it, which is the thing this design
 * changes.
 *
 * The trigger sources the PRD also names — Zoho, custom integrations, the API,
 * a call placed by hand — get the same card. Drawing five copies of one
 * relationship would say nothing the first one does not.
 */

type Surface = "batch" | "scenario"
type ScenarioState = "off" | "on" | "window"
type Queue = "none" | "queued"

const SCENARIO_STATES: { id: ScenarioState; label: string }[] = [
  { id: "on", label: "Retry on" },
  { id: "off", label: "Retry off" },
  { id: "window", label: "Window invalid" },
]

/**
 * The Select seeds the card, it does not lock it — every field stays editable
 * afterwards and the errors track live, which is the only way to check that a
 * rule fires on what a reader would actually type.
 */
function seed(state: ScenarioState): RetryConfig {
  if (state === "off") return { ...SCENARIO_RETRY, enabled: false }
  if (state === "window") {
    return { ...SCENARIO_RETRY, windowEnd: { ...SCENARIO_RETRY.windowStart } }
  }
  return SCENARIO_RETRY
}

export default function CallRetryPage() {
  const [surface, setSurface] = React.useState<Surface>("scenario")
  const [state, setState] = React.useState<ScenarioState>("on")
  const [queue, setQueue] = React.useState<Queue>("queued")
  const [overridden, setOverridden] = React.useState(false)
  const [config, setConfig] = React.useState<RetryConfig>(SCENARIO_RETRY)

  const onScenario = surface === "scenario"

  return (
    <MockupShell
      /* Reviewer controls, not product ones — nothing in the app crosses from
         a scenario editor to a batch call. Up here they stay out of the design
         they exist to let you compare. */
      actions={
        <>
          <ToggleGroup
            onValueChange={(next) => {
              if (next) setSurface(next as Surface)
            }}
            size="sm"
            type="single"
            value={surface}
            variant="outline"
          >
            <ToggleGroupItem value="scenario">Scenario</ToggleGroupItem>
            <ToggleGroupItem value="batch">Batch call</ToggleGroupItem>
          </ToggleGroup>

          <Separator className="h-5" orientation="vertical" />

          {onScenario ? (
            <>
              <Select
                onValueChange={(next) => {
                  const chosen = next as ScenarioState
                  setState(chosen)
                  setConfig(seed(chosen))
                }}
                value={state}
              >
                <SelectTrigger aria-label="Scenario state" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCENARIO_STATES.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ToggleGroup
                onValueChange={(next) => {
                  if (next) setQueue(next as Queue)
                }}
                size="sm"
                type="single"
                value={queue}
                variant="outline"
              >
                <ToggleGroupItem value="queued">Queued calls</ToggleGroupItem>
                <ToggleGroupItem value="none">Nothing queued</ToggleGroupItem>
              </ToggleGroup>
            </>
          ) : (
            <ToggleGroup
              onValueChange={(next) => {
                if (next) setOverridden(next === "override")
              }}
              size="sm"
              type="single"
              value={overridden ? "override" : "inherit"}
              variant="outline"
            >
              <ToggleGroupItem value="inherit">Inheriting</ToggleGroupItem>
              <ToggleGroupItem value="override">Overridden</ToggleGroupItem>
            </ToggleGroup>
          )}
        </>
      }
      eyebrow={onScenario ? "Build · Scenarios" : "Build · Batch Calls"}
      title="Design retry mechanism across the platform"
    >
      <AppShell
        active={onScenario ? "Scenarios" : "Batch Calls"}
        breadcrumb={
          onScenario
            ? `Scenarios · ${SCENARIO_NAME}`
            : `Batch Calls · ${BATCH_NAME}`
        }
        onNavigate={(title) => {
          if (title === "Scenarios") setSurface("scenario")
          if (title === "Batch Calls") setSurface("batch")
        }}
      >
        <div className="flex flex-1 flex-col p-3 lg:p-4">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            <h1 className="text-2xl font-semibold">
              {onScenario ? SCENARIO_NAME : BATCH_NAME}
            </h1>

            {onScenario ? (
              <ScenarioRetry
                config={config}
                onConfigChange={setConfig}
                queued={queue === "queued" ? QUEUED_CALLS : 0}
                scheduled={queue === "queued" ? SCHEDULED_CALLS : 0}
              />
            ) : (
              /* Keyed so switching back to Inheriting drops the batch's draft
                 rather than keeping it warm behind a switch that says it is
                 following the scenario. */
              <BatchRetry
                key={overridden ? "override" : "inherit"}
                onOverriddenChange={setOverridden}
                overridden={overridden}
                scenarioConfig={SCENARIO_RETRY}
              />
            )}
          </div>
        </div>
      </AppShell>
    </MockupShell>
  )
}
