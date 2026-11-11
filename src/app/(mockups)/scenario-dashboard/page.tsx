"use client";

import * as React from "react";

import { SecondaryTabs } from "@/components/design-system/tabs-preview";
import {
  ConfigurationTabIcon,
  CreatedIcon,
  OpportunitiesTabIcon,
  ScenarioTabIcon,
  ScheduleTabIcon,
} from "@/components/mockups/opportunity-triage/icons";
import { DashboardTab } from "@/components/mockups/scenario-dashboard/dashboard-tab";
import { DashboardTabIcon } from "@/components/mockups/scenario-dashboard/icons";
import { AppShell } from "@/components/shell/app-shell";
import { MockupShell } from "@/components/shell/mockup-shell";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SCENARIO } from "@/lib/mockups/scenario-dashboard-data";

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
  {
    id: "dashboard",
    label: "Dashboard",
    short: "Dashboard",
    Icon: DashboardTabIcon,
  },
] as const;

const DATA_STATES = ["conversations", "none"] as const;

type Tab = (typeof TABS)[number]["id"];
type DataState = (typeof DATA_STATES)[number];

export default function ScenarioDashboardPage() {
  const [tab, setTab] = React.useState<Tab>("dashboard");
  const [data, setData] = React.useState<DataState>("conversations");

  return (
    <MockupShell
      actions={
        <ToggleGroup
          aria-label="Data"
          onValueChange={(next) => {
            const match = DATA_STATES.find((state) => state === next);
            if (match) setData(match);
          }}
          size="sm"
          type="single"
          value={data}
          variant="outline"
        >
          <ToggleGroupItem value="conversations">Conversations</ToggleGroupItem>
          <ToggleGroupItem value="none">No conversations</ToggleGroupItem>
        </ToggleGroup>
      }
      title="Per-scenario dashboard"
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
                </>
              ),
            }))}
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
              className="pt-2 motion-safe:data-active:animate-pane-in motion-reduce:animate-none"
              value="dashboard"
            >
              <DashboardTab key={data} noConversations={data === "none"} />
            </TabsContent>
          </SecondaryTabs>
        </main>
      </AppShell>
    </MockupShell>
  );
}
