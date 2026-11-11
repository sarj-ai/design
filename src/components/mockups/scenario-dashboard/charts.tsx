"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  COST_COMPONENTS,
  formatAxisMs,
  formatMs,
  formatUsd,
  type Bucket,
  type FailureReason,
} from "@/lib/mockups/scenario-dashboard-data";
import { cn } from "@/lib/utils";

export const LATENCY_CONFIG = {
  p50: { label: "p50", color: "var(--chart-1)" },
  p75: { label: "p75", color: "var(--chart-2)" },
  p95: { label: "p95", color: "var(--chart-3)" },
} as const satisfies ChartConfig;

export const COST_CONFIG = {
  llm: { label: "LLM", color: "var(--chart-1)" },
  tts: { label: "TTS", color: "var(--chart-2)" },
  telephony: { label: "Telephony", color: "var(--chart-3)" },
  stt: { label: "STT", color: "var(--chart-4)" },
  eou: { label: "EoU", color: "var(--chart-5)" },
} as const satisfies ChartConfig;

const KEY_CLASS: Record<string, string> = {
  p50: "bg-chart-1",
  p75: "bg-chart-2",
  p95: "bg-chart-3",
  llm: "bg-chart-1",
  tts: "bg-chart-2",
  telephony: "bg-chart-3",
  stt: "bg-chart-4",
  eou: "bg-chart-5",
};

export function SeriesKey({
  series,
  shape = "line",
}: {
  series: string;
  shape?: "line" | "square";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "shrink-0",
        shape === "line" ? "h-0.5 w-3 rounded-full" : "size-2.5 rounded-xs",
        KEY_CLASS[series],
      )}
    />
  );
}

const AXIS = {
  axisLine: false,
  tickLine: false,
  tickMargin: 8,
} as const;

export function LatencyChart({ series }: { series: Bucket[] }) {
  const top = Math.max(500, ...series.map((each) => each.p95));
  const ticks = Array.from(
    { length: Math.ceil(top / 500) + 1 },
    (_, index) => index * 500,
  );
  return (
    <ChartContainer className="aspect-auto h-64 w-full" config={LATENCY_CONFIG}>
      <LineChart
        accessibilityLayer
        data={series}
        margin={{ left: 0, right: 16, top: 8 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis {...AXIS} dataKey="label" minTickGap={32} />
        <YAxis
          {...AXIS}
          domain={[0, ticks.at(-1) ?? top]}
          ticks={ticks}
          tickFormatter={(value: number) => formatAxisMs(value)}
          width={40}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <TooltipRow
                  name={String(name)}
                  series={String(name)}
                  value={formatMs(Number(value))}
                />
              )}
              indicator="line"
            />
          }
          cursor={{ stroke: "var(--border)" }}
        />
        {(["p95", "p75", "p50"] as const).map((key) => (
          <Line
            activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
            dataKey={key}
            dot={false}
            isAnimationActive={false}
            key={key}
            stroke={`var(--color-${key})`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            type="monotone"
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}

export function CostChart({ series }: { series: Bucket[] }) {
  const gap = series.length <= 60 ? 2 : 0;
  const last = COST_COMPONENTS.at(-1)?.id;
  return (
    <ChartContainer className="aspect-auto h-64 w-full" config={COST_CONFIG}>
      <BarChart
        accessibilityLayer
        data={series}
        margin={{ left: 0, right: 16, top: 8 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis {...AXIS} dataKey="label" minTickGap={32} />
        <YAxis
          {...AXIS}
          tickCount={4}
          tickFormatter={(value: number) => formatUsd(value, 0)}
          width={56}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <TooltipRow
                  name={
                    COST_COMPONENTS.find((component) => component.id === name)
                      ?.label ?? String(name)
                  }
                  series={String(name)}
                  value={formatUsd(Number(value))}
                />
              )}
            />
          }
          cursor={{ fill: "var(--muted)" }}
        />
        {COST_COMPONENTS.map((component) => (
          <Bar
            dataKey={component.id}
            fill={`var(--color-${component.id})`}
            isAnimationActive={false}
            key={component.id}
            radius={component.id === last ? [4, 4, 0, 0] : 0}
            stackId="cost"
            stroke="var(--card)"
            strokeWidth={gap}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

const FailurePayloadSchema = z.object({ share: z.number() });

const FAILURE_CONFIG = {
  count: { label: "Failed conversations", color: "var(--chart-1)" },
} as const satisfies ChartConfig;

export function FailureChart({ failures }: { failures: FailureReason[] }) {
  return (
    <ChartContainer
      className="aspect-auto w-full"
      config={FAILURE_CONFIG}
      style={{ height: failures.length * 36 + 8 }}
    >
      <BarChart
        accessibilityLayer
        data={failures}
        layout="vertical"
        margin={{ left: 0, right: 64, top: 0, bottom: 0 }}
      >
        <XAxis dataKey="count" hide type="number" />
        <YAxis {...AXIS} dataKey="reason" type="category" width={112} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => (
                <TooltipRow
                  name="Conversations"
                  value={`${Number(value).toLocaleString("en-US")} · ${String(Math.round((FailurePayloadSchema.safeParse(item.payload).data?.share ?? 0) * 100))}%`}
                />
              )}
              hideIndicator
            />
          }
          cursor={{ fill: "var(--muted)" }}
        />
        <Bar
          barSize={16}
          dataKey="count"
          fill="var(--color-count)"
          isAnimationActive={false}
          radius={[0, 4, 4, 0]}
        >
          <LabelList
            className="fill-muted-foreground"
            dataKey="share"
            fontSize={12}
            formatter={(value: unknown) =>
              `${String(Math.round(Number(value) * 100))}%`
            }
            offset={8}
            position="right"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function TooltipRow({
  name,
  series,
  value,
}: {
  name: string;
  series?: string;
  value: string;
}) {
  return (
    <div className="flex w-full items-center gap-2">
      {series ? <SeriesKey series={series} shape="square" /> : null}
      <span className="text-muted-foreground">{name}</span>
      <span className="ms-auto font-medium text-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}
