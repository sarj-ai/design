"use client"

import * as React from "react"

import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
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
} from "@/lib/mockups/call-retry-data"
import { BatchRetry } from "@/components/mockups/call-retry/batch-retry"
import { ScenarioRetry } from "@/components/mockups/call-retry/scenario-retry"

type Surface = "batch" | "scenario"
type ScenarioState = "off" | "on" | "window"
type Queue = "none" | "queued"

const SCENARIO_STATES: { id: ScenarioState; label: string }[] = [
  { id: "on", label: "Retry on" },
  { id: "off", label: "Retry off" },
  { id: "window", label: "Window invalid" },
]

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
                <SelectContent position="popper">
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
              // Keyed so switching back to Inheriting drops the batch's draft.
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
