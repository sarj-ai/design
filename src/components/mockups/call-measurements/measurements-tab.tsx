"use client";

import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
} from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type CostLine,
  type Counter,
  firstSound,
  formatSeconds,
  formatUsd,
  type MeasurementCase,
  percentile,
  type Turn,
} from "@/lib/mockups/call-measurements-data";

import { NotMeasuredIcon } from "./icons";
import { TurnLatencyChart } from "./turn-latency-chart";

export function MeasurementsTab({
  measurements,
}: {
  measurements: MeasurementCase["measurements"];
}) {
  if (!measurements) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <NotMeasuredIcon />
          </EmptyMedia>
          <EmptyTitle>No measurements for this call</EmptyTitle>
          <EmptyDescription>
            Calls placed before Nov 12, 2026 were not measured.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CostCard lines={measurements.cost} />
      <LatencyCard
        fallbackModel={measurements.cost.find((line) => line.fallback)?.model}
        turns={measurements.turns}
      />
      <CountersCard counters={measurements.counters} />
    </div>
  );
}

function CostCard({ lines }: { lines: readonly CostLine[] }) {
  const known = lines.filter((line) => line.costUsd !== null);
  const missing = lines.filter((line) => line.costUsd === null);
  const total = known.reduce((sum, line) => sum + (line.costUsd ?? 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-semibold tabular-nums">
            {formatUsd(total)}
          </span>
          <span className="text-sm text-muted-foreground">
            {missing.length > 0
              ? `Our cost so far · excludes ${missing
                  .map((line) => line.component.toLowerCase())
                  .join(", ")}, not reported yet`
              : "Our cost"}
          </span>
        </div>

        <DataTable>
          <TableHeader>
            <DataTableHeaderRow>
              <DataTableHead>Component</DataTableHead>
              <DataTableHead>Model</DataTableHead>
              <DataTableHead>Usage</DataTableHead>
              <DataTableHead className="text-end">Cost</DataTableHead>
            </DataTableHeaderRow>
          </TableHeader>
          <TableBody>
            {lines.map((line, index) => {
              const sameGroup = lines[index - 1]?.component === line.component;

              return (
                <TableRow key={`${line.component}-${line.model}`}>
                  <TableCell>{sameGroup ? null : line.component}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      {line.model}
                      {line.fallback ? (
                        <Badge variant="outline">Fallback</Badge>
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {line.usage}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {line.costUsd === null ? "—" : formatUsd(line.costUsd)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </DataTable>
      </CardContent>
    </Card>
  );
}

function LatencyCard({
  fallbackModel,
  turns,
}: {
  fallbackModel: string | undefined;
  turns: readonly Turn[];
}) {
  const sounds = turns.map(firstSound);
  const p95 = percentile(sounds, 95);
  const turnTaking =
    turns.reduce((sum, turn) => sum + turn.endOfSpeechWait, 0) / turns.length;

  const stats: Counter[] = [
    { label: "p50 latency", value: formatSeconds(percentile(sounds, 50)) },
    { label: "p75 latency", value: formatSeconds(percentile(sounds, 75)) },
    { label: "p95 latency", value: formatSeconds(p95) },
    { label: "Turn-taking latency", value: formatSeconds(turnTaking) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latency</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <StatGrid stats={stats} />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">First sound by turn</span>
          <TurnLatencyChart
            fallbackModel={fallbackModel}
            p95={p95}
            turns={turns}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function CountersCard({ counters }: { counters: readonly Counter[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Turns and tools</CardTitle>
      </CardHeader>
      <CardContent>
        <StatGrid stats={counters} />
      </CardContent>
    </Card>
  );
}

function StatGrid({ stats }: { stats: readonly Counter[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <div className="flex flex-col gap-0.5" key={stat.label}>
          <dt className="text-xs text-muted-foreground">{stat.label}</dt>
          <dd className="text-lg font-semibold tabular-nums">{stat.value}</dd>
          {stat.detail ? (
            <dd className="text-xs text-muted-foreground tabular-nums">
              {stat.detail}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
