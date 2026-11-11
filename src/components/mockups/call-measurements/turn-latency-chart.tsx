"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import {
  firstSound,
  formatSeconds,
  type Turn,
} from "@/lib/mockups/call-measurements-data";
import { cn } from "@/lib/utils";

const PARTS = [
  { key: "endOfSpeechWait", label: "End-of-speech wait", swatch: "bg-chart-1" },
  { key: "model", label: "Model", swatch: "bg-chart-2" },
  { key: "voice", label: "Voice", swatch: "bg-chart-3" },
] as const;

const CONFIG = {
  endOfSpeechWait: { label: "End-of-speech wait", color: "var(--chart-1)" },
  model: { label: "Model", color: "var(--chart-2)" },
  voice: { label: "Voice", color: "var(--chart-3)" },
} as const satisfies ChartConfig;

export function TurnLatencyChart({
  fallbackModel,
  p95,
  turns,
}: {
  fallbackModel: string | undefined;
  p95: number;
  turns: readonly Turn[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {PARTS.map((part) => (
          <span className="flex items-center gap-1.5" key={part.key}>
            <span
              aria-hidden
              className={cn("size-2 shrink-0 rounded-sm", part.swatch)}
            />
            {part.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="w-3 border-t border-dashed border-muted-foreground"
          />
          p95
        </span>
      </div>

      <ChartContainer className="aspect-auto h-56 w-full" config={CONFIG}>
        <BarChart
          accessibilityLayer
          barCategoryGap="28%"
          data={turns}
          margin={{ left: 0, right: 8, top: 8 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="turn"
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            axisLine={false}
            tickFormatter={(value: number) => `${String(value)}s`}
            tickLine={false}
            width={32}
          />
          <ChartTooltip
            content={({ active, label }) => {
              const turn = turns.find((each) => each.turn === Number(label));
              if (!active || !turn) return null;
              return <TurnTooltip fallbackModel={fallbackModel} turn={turn} />;
            }}
            cursor={{ fill: "var(--color-muted)" }}
          />
          <ReferenceLine
            stroke="var(--color-muted-foreground)"
            strokeDasharray="4 4"
            y={p95}
          />
          {PARTS.map((part, index) => (
            <Bar
              dataKey={part.key}
              fill={`var(--color-${part.key})`}
              isAnimationActive={false}
              key={part.key}
              radius={index === PARTS.length - 1 ? [4, 4, 0, 0] : 0}
              stackId="turn"
              stroke="var(--color-card)"
              strokeWidth={1}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}

function TurnTooltip({
  fallbackModel,
  turn,
}: {
  fallbackModel: string | undefined;
  turn: Turn;
}) {
  return (
    <Card className="w-60 gap-2 text-xs" size="sm">
      <CardContent className="flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">Turn {turn.turn}</span>
          <span className="text-muted-foreground">“{turn.callerSaid}”</span>
        </div>
        <div className="flex flex-col gap-1">
          {PARTS.map((part) => (
            <div className="flex items-center gap-2" key={part.key}>
              <span
                aria-hidden
                className={cn("size-2 shrink-0 rounded-sm", part.swatch)}
              />
              <span className="text-muted-foreground">{part.label}</span>
              <span className="ms-auto tabular-nums">
                {formatSeconds(turn[part.key])}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 border-t pt-1">
            <span className="font-medium">First sound</span>
            <span className="ms-auto font-medium tabular-nums">
              {formatSeconds(firstSound(turn))}
            </span>
          </div>
        </div>
        {turn.fallback && fallbackModel ? (
          <span className="text-muted-foreground">
            Fell back to {fallbackModel}
          </span>
        ) : null}
        {turn.interrupted ? (
          <span className="text-muted-foreground">Caller interrupted</span>
        ) : null}
      </CardContent>
    </Card>
  );
}
