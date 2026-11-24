"use client";

import * as React from "react";

import {
  PrimaryTabs,
  SecondaryTabs,
} from "@/components/design-system/tabs-preview";
import {
  ConfigurationTabIcon,
  CreatedIcon,
  OpportunitiesTabIcon,
  ScenarioTabIcon,
  ScheduleTabIcon,
} from "@/components/mockups/opportunity-triage/icons";
import { DashboardTabIcon } from "@/components/mockups/scenario-dashboard/icons";
import {
  TopicsView,
  type ScenarioState,
} from "@/components/mockups/topic-trends/topics-view";
import { AppShell } from "@/components/shell/app-shell";
import { MockupShell } from "@/components/shell/mockup-shell";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SCENARIO } from "@/lib/mockups/topic-trends-data";

const TABS = [
  { id: "configuration", label: "Configuration", Icon: ConfigurationTabIcon },
  { id: "scenario", label: "Scenario", Icon: ScenarioTabIcon },
  { id: "schedule", label: "Schedule configuration", Icon: ScheduleTabIcon },
  {
    id: "opportunities",
    label: "Optimization opportunities",
    Icon: OpportunitiesTabIcon,
  },
  { id: "dashboard", label: "Dashboard", Icon: DashboardTabIcon },
] as const;

const VIEWS = [
  { id: "overview", label: "Overview" },
  { id: "failures", label: "Failures & tools" },
  { id: "usage", label: "Usage & cost" },
  { id: "topics", label: "Topics & trends" },
] as const;

const STATES: readonly ScenarioState[] = ["few", "building", "live"];

type Tab = (typeof TABS)[number]["id"];
type View = (typeof VIEWS)[number]["id"];

export default function TopicTrendsPage() {
  const [tab, setTab] = React.useState<Tab>("dashboard");
  const [view, setView] = React.useState<View>("topics");
  const [state, setState] = React.useState<ScenarioState>("live");

  React.useEffect(() => {
    if (state !== "building") return;
    const timer = setTimeout(() => setState("live"), 4000);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <MockupShell
      actions={
        <ToggleGroup
          aria-label="Scenario state"
          onValueChange={(next) => {
            const match = STATES.find((each) => each === next);
            if (match) setState(match);
          }}
          size="sm"
          type="single"
          value={state}
          variant="outline"
        >
          <ToggleGroupItem value="few">Under 40 calls</ToggleGroupItem>
          <ToggleGroupItem value="building">First open</ToggleGroupItem>
          <ToggleGroupItem value="live">Live</ToggleGroupItem>
        </ToggleGroup>
      }
      title="Topic trends per scenario"
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
            items={TABS.map((entry) => ({ ...entry }))}
            onValueChange={(next) => {
              const match = TABS.find((entry) => entry.id === next);
              if (match) setTab(match.id);
            }}
            value={tab}
          >
            {TABS.filter((entry) => entry.id !== "dashboard").map((entry) => (
              <TabsContent
                className="pt-2 motion-safe:data-active:animate-pane-in motion-reduce:animate-none"
                key={entry.id}
                value={entry.id}
              >
                <p className="text-sm text-muted-foreground">
                  Unchanged in this design.
                </p>
              </TabsContent>
            ))}
            <TabsContent
              className="flex flex-col gap-6 pt-2 motion-safe:data-active:animate-pane-in motion-reduce:animate-none"
              value="dashboard"
            >
              <PrimaryTabs
                items={VIEWS.map((entry) => ({ ...entry }))}
                onValueChange={(next) => {
                  const match = VIEWS.find((entry) => entry.id === next);
                  if (match) setView(match.id);
                }}
                value={view}
              />
              {view === "topics" ? (
                <TopicsView key={state} state={state} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Unchanged in this design.
                </p>
              )}
            </TabsContent>
          </SecondaryTabs>
        </main>
      </AppShell>
    </MockupShell>
  );
}
