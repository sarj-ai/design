"use client";

import * as React from "react";

import { OpportunitiesPanel } from "@/components/mockups/opportunity-triage/opportunities-panel";
import {
  CostChart,
  COST_CONFIG,
  FailureChart,
  LatencyChart,
  SeriesKey,
} from "@/components/mockups/scenario-dashboard/charts";
import { DashboardFilters } from "@/components/mockups/scenario-dashboard/dashboard-filters";
import {
  ChangeDownIcon,
  ChangeUpIcon,
  NoConversationsIcon,
} from "@/components/mockups/scenario-dashboard/icons";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Opportunity } from "@/lib/mockups/opportunity-triage-data";
import {
  COMPARISON,
  DEFAULT_GRANULARITY,
  RULE_OPPORTUNITIES,
  buildDashboard,
  daysIn,
  fallbackGranularity,
  formatMs,
  formatPercent,
  formatUsd,
  granularityFits,
  rangeFor,
  type CustomRange,
  type Granularity,
  type Period,
  type Tile,
  type VersionFilter,
} from "@/lib/mockups/scenario-dashboard-data";
import { cn } from "@/lib/utils";

export function DashboardTab({
  noConversations,
}: {
  noConversations: boolean;
}) {
  const [version, setVersion] = React.useState<VersionFilter>("all");
  const [period, setPeriod] = React.useState<Period>("month");
  const [range, setRange] = React.useState<CustomRange>();
  const [granularity, setGranularity] = React.useState<Granularity>("day");
  const [opportunities, setOpportunities] = React.useState<Opportunity[]>(
    () => [...RULE_OPPORTUNITIES],
  );

  const days = daysIn(rangeFor(period, range));
  const data = buildDashboard({
    empty: noConversations,
    granularity,
    period,
    range,
    version,
  });

  const keepFitting = (nextDays: number, preferred: Granularity) =>
    setGranularity((current) =>
      granularityFits(current, nextDays)
        ? current
        : granularityFits(preferred, nextDays)
          ? preferred
          : fallbackGranularity(nextDays),
    );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <DashboardFilters
          days={days}
          granularity={granularity}
          onGranularityChange={setGranularity}
          onPeriodChange={(next) => {
            setPeriod(next);
            if (next !== "custom") {
              keepFitting(daysIn(rangeFor(next)), DEFAULT_GRANULARITY[next]);
            }
          }}
          onRangeApply={(next) => {
            setRange(next);
            setPeriod("custom");
            const nextDays = daysIn(rangeFor("custom", next));
            keepFitting(nextDays, fallbackGranularity(nextDays));
          }}
          onVersionChange={setVersion}
          period={period}
          range={range}
          version={version}
        />
        <p className="text-sm text-muted-foreground">{COMPARISON[period]}</p>
      </div>

      {data.empty ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <NoConversationsIcon />
            </EmptyMedia>
            <EmptyTitle>No conversations in this period</EmptyTitle>
            <EmptyDescription>
              Pick a longer period or another version.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <Section title="Volume">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.volume.map((tile) => (
                <NumberTile key={tile.label} tile={tile} />
              ))}
            </div>
          </Section>

          <Section title="Latency">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Response latency</CardTitle>
                  <CardAction className="flex items-center gap-4">
                    {(["p50", "p75", "p95"] as const).map((key) => (
                      <span
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                        key={key}
                      >
                        <SeriesKey series={key} />
                        {key}
                        <span className="font-medium text-foreground tabular-nums">
                          {formatMs(data.latency[key])}
                        </span>
                      </span>
                    ))}
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <LatencyChart series={data.series} />
                </CardContent>
              </Card>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
                {data.latencyTiles.map((tile) => (
                  <NumberTile key={tile.label} tile={tile} />
                ))}
              </div>
            </div>
          </Section>

          <Section title="Cost">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Total cost</CardTitle>
                  <CardAction className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {data.costRows.map((row) => (
                      <span
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                        key={row.id}
                      >
                        <SeriesKey series={row.id} shape="square" />
                        {COST_CONFIG[row.id].label}
                      </span>
                    ))}
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-baseline gap-3">
                    <p className="text-2xl font-semibold tabular-nums">
                      {formatUsd(data.totalCost)}
                    </p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {formatUsd(data.costPerConversation, 3)} per conversation
                    </p>
                  </div>
                  <CostChart series={data.series} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Average cost per model</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="ps-0">Model</TableHead>
                        <TableHead className="text-end">
                          Per conversation
                        </TableHead>
                        <TableHead className="pe-0 text-end">Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.costRows.map((row) => (
                        <TableRow className="hover:bg-transparent" key={row.id}>
                          <TableCell className="ps-0">
                            <div className="flex flex-col">
                              <span className="font-medium">{row.model}</span>
                              <span className="text-xs text-muted-foreground">
                                {row.component}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-end tabular-nums">
                            {formatUsd(row.perConversation, 3)}
                          </TableCell>
                          <TableCell className="pe-0 text-end text-muted-foreground tabular-nums">
                            {Math.round(row.share * 100)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section title="Outcomes">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Failure rate by reason</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-baseline gap-3">
                    <p className="text-2xl font-semibold tabular-nums">
                      {formatPercent(data.failureRate)}
                    </p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {data.failures
                        .reduce((sum, each) => sum + each.count, 0)
                        .toLocaleString("en-US")}{" "}
                      failed conversations
                    </p>
                  </div>
                  <FailureChart failures={data.failures} />
                </CardContent>
              </Card>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {data.outcomes.map((tile) => (
                  <NumberTile key={tile.label} tile={tile} />
                ))}
              </div>
            </div>
          </Section>

          <Section title="Tools and models">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.toolsAndModels.map((tile) => (
                <NumberTile key={tile.label} tile={tile} />
              ))}
            </div>
          </Section>

          <Section title="Optimization opportunities">
            <OpportunitiesPanel
              loading={false}
              onChange={setOpportunities}
              opportunities={opportunities}
              showNew
            />
          </Section>
        </>
      )}
    </div>
  );
}

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function NumberTile({ tile }: { tile: Tile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{tile.label}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold tabular-nums">{tile.value}</p>
        <Change percent={tile.change} riseIsGood={tile.riseIsGood} />
      </CardContent>
    </Card>
  );
}

function Change({
  percent,
  riseIsGood,
}: {
  percent: number;
  riseIsGood: boolean | undefined;
}) {
  const Arrow =
    percent > 0 ? ChangeUpIcon : percent < 0 ? ChangeDownIcon : null;
  const direction = percent > 0 ? "Up " : percent < 0 ? "Down " : "";
  const tone =
    percent === 0 || riseIsGood === undefined
      ? "neutral"
      : percent > 0 === riseIsGood
        ? "good"
        : "bad";
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-sm font-medium tabular-nums",
        tone === "good" && "text-success-tint-foreground",
        tone === "bad" && "text-destructive-tint-foreground",
        tone === "neutral" && "text-muted-foreground",
      )}
    >
      {Arrow ? <Arrow aria-hidden className="size-4" strokeWidth={2} /> : null}
      <span className="sr-only">{direction}</span>
      {Math.abs(percent)}%
    </span>
  );
}
