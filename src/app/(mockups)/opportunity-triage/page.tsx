"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { TabsContent } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { SecondaryTabs } from "@/components/design-system/tabs-preview"
import {
  ConfigurationTabIcon,
  CreatedIcon,
  OpportunitiesTabIcon,
  ScenarioTabIcon,
  ScheduleTabIcon,
} from "@/components/mockups/opportunity-triage/icons"
import { OpportunitiesPanel } from "@/components/mockups/opportunity-triage/opportunities-panel"
import { AppShell } from "@/components/shell/app-shell"
import { MockupShell } from "@/components/shell/mockup-shell"
import {
  ALL_HANDLED,
  hasRecurred,
  OPPORTUNITIES,
  SCENARIO,
  type Opportunity,
} from "@/lib/mockups/opportunity-triage-data"

const STATES = [
  { id: "mixed", label: "Some open" },
  { id: "handled", label: "All handled" },
  { id: "none", label: "None yet" },
  { id: "loading", label: "Loading" },
] as const

type ReviewState = (typeof STATES)[number]["id"]

const TABS = [
  {
    id: "configuration",
    label: "Configuration",
    short: "Configuration",
    Icon: ConfigurationTabIcon,
  },
  {
    id: "scenario",
    label: "Scenario",
    short: "Scenario",
    Icon: ScenarioTabIcon,
  },
  {
    id: "schedule",
    label: "Schedule configuration",
    short: "Schedule",
    Icon: ScheduleTabIcon,
  },
  {
    id: "opportunities",
    label: "Optimization opportunities",
    short: "Opportunities",
    Icon: OpportunitiesTabIcon,
  },
] as const

type Tab = (typeof TABS)[number]["id"]

/** Before the tab is opened, while it is open, and after leaving it. */
type Visit = "before" | "viewing" | "after"

function dataFor(state: ReviewState): Opportunity[] {
  if (state === "handled") return ALL_HANDLED
  if (state === "none") return []
  return OPPORTUNITIES
}

export default function OpportunityTriagePage() {
  const [state, setState] = React.useState<ReviewState>("mixed")
  const [opportunities, setOpportunities] = React.useState(() =>
    dataFor("mixed"),
  )
  const [tab, setTab] = React.useState<Tab>("configuration")
  const [visit, setVisit] = React.useState<Visit>("before")

  const hasNews = opportunities.some(
    (opportunity) => opportunity.isNew || hasRecurred(opportunity),
  )
  const showDot = visit === "before" && hasNews && state !== "loading"

  return (
    <MockupShell
      actions={
        <ToggleGroup
          aria-label="State"
          onValueChange={(next) => {
            if (!next) return
            const nextState = next as ReviewState
            setState(nextState)
            setOpportunities(dataFor(nextState))
            setVisit(tab === "opportunities" ? "viewing" : "before")
          }}
          size="sm"
          type="single"
          value={state}
          variant="outline"
        >
          {STATES.map((entry) => (
            <ToggleGroupItem key={entry.id} value={entry.id}>
              {entry.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      }
      title="Resolve or dismiss opportunities"
    >
      <AppShell active="Scenarios" breadcrumb={["Scenarios", SCENARIO.name]}>
        <main className="mx-auto flex w-full max-w-350 flex-col gap-6 p-8">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">{SCENARIO.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Badge className="bg-success-tint text-success-tint-foreground">
                {SCENARIO.status}
              </Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground [&_svg]:size-4">
                <CreatedIcon />
                Created {SCENARIO.createdAt}
              </span>
            </div>
          </header>

          <SecondaryTabs
            items={TABS.map((entry) => ({
              id: entry.id,
              Icon: entry.Icon,
              label: (
                <>
                  <span className="lg:hidden">{entry.short}</span>
                  <span className="hidden lg:inline">{entry.label}</span>
                  {entry.id === "opportunities" && showDot ? (
                    <>
                      <span
                        aria-hidden
                        className="size-1.5 rounded-full bg-primary"
                      />
                      <span className="sr-only">New since your last visit</span>
                    </>
                  ) : null}
                </>
              ),
            }))}
            onValueChange={(next) => {
              const nextTab = next as Tab
              if (nextTab === "opportunities" && visit === "before") {
                setVisit("viewing")
              }
              if (tab === "opportunities" && nextTab !== "opportunities") {
                setVisit("after")
              }
              setTab(nextTab)
            }}
            value={tab}
          >
            {TABS.filter((entry) => entry.id !== "opportunities").map(
              (entry) => (
                <TabsContent
                  className="pt-2 motion-safe:data-active:animate-pane-in motion-reduce:animate-none"
                  key={entry.id}
                  value={entry.id}
                >
                  <p className="text-sm text-muted-foreground">
                    Unchanged in this design.
                  </p>
                </TabsContent>
              ),
            )}

            <TabsContent
              className="pt-2 motion-safe:data-active:animate-pane-in motion-reduce:animate-none"
              value="opportunities"
            >
              <OpportunitiesPanel
                key={state}
                loading={state === "loading"}
                onChange={setOpportunities}
                opportunities={opportunities}
                showNew={visit !== "after"}
              />
            </TabsContent>
          </SecondaryTabs>
        </main>
      </AppShell>
    </MockupShell>
  )
}
