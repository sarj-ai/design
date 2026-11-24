"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  formatDate,
  formatPercent,
  type TopicStats,
} from "@/lib/mockups/topic-trends-data";
import { cn } from "@/lib/utils";

const HUES: readonly string[] = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

export function topicColour(id: string, order: string[]) {
  if (id === "other") return "var(--muted-foreground)";
  return HUES[order.filter((each) => each !== "other").indexOf(id) % 6];
}

export function TopicKey({
  className,
  colour,
}: {
  className?: string;
  colour: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("size-2 shrink-0 rounded-full bg-(--key)", className)}
      style={keyStyle(colour)}
    />
  );
}

function keyStyle(colour: string) {
  const style: React.CSSProperties & Record<"--key", string> = {
    "--key": colour,
  };
  return style;
}

function splitLast(values: readonly number[]) {
  const last = values.length - 1;
  return values.map((value, index) =>
    index === last ? { done: 0, filling: value } : { done: value, filling: 0 },
  );
}

function bucketLabel(at: number, unit: "day" | "week") {
  return unit === "week" ? `Week of ${formatDate(at)}` : formatDate(at);
}

export function TopicShareChart({
  order,
  topics,
  unit,
}: {
  order: string[];
  topics: TopicStats[];
  unit: "day" | "week";
}) {
  const config = Object.fromEntries(
    topics.map((entry) => [
      entry.topic.id,
      { label: entry.topic.name, color: topicColour(entry.topic.id, order) },
    ]),
  ) satisfies ChartConfig;

  const points = (topics[0]?.bars ?? []).map((bar, index) => ({
    label: bucketLabel(bar.at, unit),
    ...Object.fromEntries(
      topics.map((entry) => [entry.topic.id, entry.bars[index]?.share ?? 0]),
    ),
  }));

  const stacked = topics.toReversed();

  return (
    <ChartContainer className="aspect-auto h-64 w-full" config={config}>
      <BarChart
        accessibilityLayer
        barCategoryGap="20%"
        data={points}
        margin={{ left: 0, right: 8, top: 8 }}
        stackOffset="expand"
      >
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="label"
          minTickGap={32}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          axisLine={false}
          tickCount={3}
          tickFormatter={(value: number) =>
            `${String(Math.round(value * 100))}%`
          }
          tickLine={false}
          tickMargin={8}
          width={48}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <span className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    {config[String(name)]?.label}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatPercent(Number(value))}
                  </span>
                </span>
              )}
              indicator="dot"
            />
          }
          cursor={{ fill: "var(--muted)" }}
        />
        {stacked.map((entry) => (
          <Bar
            dataKey={entry.topic.id}
            fill={`var(--color-${entry.topic.id})`}
            isAnimationActive={false}
            key={entry.topic.id}
            stackId="share"
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

export function TopicSparkline({
  colour,
  entry,
}: {
  colour: string;
  entry: TopicStats;
}) {
  return (
    <ChartContainer
      aria-hidden
      className="aspect-auto h-6 w-32"
      config={{ share: { label: "Share", color: colour } }}
    >
      <BarChart
        barCategoryGap={entry.bars.length > 20 ? 1 : "20%"}
        data={splitLast(entry.bars.map((bar) => bar.share))}
        margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
      >
        <YAxis domain={[0, "dataMax"]} hide />
        <Bar
          dataKey="done"
          fill="var(--color-share)"
          isAnimationActive={false}
          radius={1}
          stackId="bar"
        />
        <Bar
          dataKey="filling"
          fill="var(--color-share)"
          fillOpacity={0.35}
          isAnimationActive={false}
          radius={1}
          stackId="bar"
        />
      </BarChart>
    </ChartContainer>
  );
}

export function TopicCallsChart({
  className,
  colour,
  entry,
  unit,
}: {
  className?: string;
  colour: string;
  entry: TopicStats;
  unit: "day" | "week";
}) {
  const points = splitLast(entry.bars.map((bar) => bar.count)).map(
    (point, index) => ({
      ...point,
      label: bucketLabel(entry.bars[index]?.at ?? 0, unit),
    }),
  );
  return (
    <ChartContainer
      className={cn("aspect-auto h-48 w-full shrink-0", className)}
      config={{ calls: { label: "Calls", color: colour } }}
    >
      <BarChart accessibilityLayer data={points} margin={{ right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="label"
          minTickGap={24}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickCount={4}
          tickLine={false}
          tickMargin={8}
          width={32}
        />
        <ChartTooltip
          content={<ChartTooltipContent indicator="dot" />}
          cursor={{ fill: "var(--muted)" }}
        />
        <Bar
          dataKey="done"
          fill="var(--color-calls)"
          isAnimationActive={false}
          name="Calls"
          radius={4}
          stackId="bar"
        />
        <Bar
          dataKey="filling"
          fill="var(--color-calls)"
          fillOpacity={0.35}
          isAnimationActive={false}
          name="So far"
          radius={4}
          stackId="bar"
        />
      </BarChart>
    </ChartContainer>
  );
}
