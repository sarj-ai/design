"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import type { ChartPoint, Series } from "@/lib/mockups/dashboard-data"

const CHART_CONFIG = {
  inbound: { label: "Inbound", color: "var(--chart-6)" },
  outbound: { label: "Outbound", color: "var(--chart-2)" },
} satisfies ChartConfig

const SERIES_KEY: Record<Series, string> = {
  inbound: "bg-chart-6",
  outbound: "bg-chart-2",
}

/* An SVG id from React's, which may carry characters `url(#…)` will not take. */
function useSvgId(prefix: string) {
  return `${prefix}-${React.useId().replace(/[^a-zA-Z0-9-]/g, "")}`
}

/* An alpha mask, which reads only each stop's opacity. */
function EdgeFade({ id }: { id: string }) {
  return (
    <>
      <linearGradient id={`${id}-ramp`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stopColor="currentColor" stopOpacity={0} />
        <stop offset="8%" stopColor="currentColor" stopOpacity={1} />
        <stop offset="92%" stopColor="currentColor" stopOpacity={1} />
        <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
      </linearGradient>
      <mask
        id={id}
        maskContentUnits="objectBoundingBox"
        style={{ maskType: "alpha" }}
      >
        {/* Taller than the path, so a 2px stroke at a peak is not shaved. */}
        <rect fill={`url(#${id}-ramp)`} height="1.2" width="1" y="-0.1" />
      </mask>
    </>
  )
}

function SeriesKey({ series }: { series: Series }) {
  return (
    <span
      aria-hidden
      className={cn("h-0.5 w-3 shrink-0 rounded-full", SERIES_KEY[series])}
    />
  )
}

export function Sparkline({
  className,
  points,
  series,
}: {
  className?: string
  points: ChartPoint[]
  series: Series
}) {
  return (
    <ChartContainer
      aria-hidden
      className={cn("aspect-auto", className)}
      config={{ [series]: CHART_CONFIG[series] }}
    >
      <AreaChart
        data={points}
        margin={{ bottom: 0, left: 0, right: 0, top: 4 }}
      >
        <YAxis domain={[0, "dataMax"]} hide />
        <Area
          dataKey={series}
          dot={false}
          fill={`var(--color-${series})`}
          fillOpacity={0.1}
          isAnimationActive={false}
          stroke={`var(--color-${series})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          type="monotone"
        />
      </AreaChart>
    </ChartContainer>
  )
}

export function CallVolumeChart({
  description,
  points,
}: {
  description: string
  points: ChartPoint[]
}) {
  const edgeFadeId = useSvgId("calls-edge-fade")
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inbound vs outbound calls</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction className="flex items-center gap-4">
          {(["inbound", "outbound"] as const).map((series) => (
            <span
              className="flex items-center gap-2 text-sm text-muted-foreground"
              key={series}
            >
              <SeriesKey series={series} />
              {CHART_CONFIG[series].label}
            </span>
          ))}
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="aspect-auto h-72 w-full"
          config={CHART_CONFIG}
        >
          <AreaChart
            accessibilityLayer
            data={points}
            margin={{ left: 0, right: 24, top: 8 }}
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
              allowDecimals={false}
              axisLine={false}
              tickCount={4}
              tickLine={false}
              tickMargin={8}
              width={40}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="dot" />}
              cursor={{ stroke: "var(--border)" }}
            />
            <defs>
              <EdgeFade id={edgeFadeId} />
            </defs>
            {(["outbound", "inbound"] as const).map((series) => (
              <Area
                activeDot={{
                  r: 4,
                  stroke: "var(--card)",
                  strokeWidth: 2,
                }}
                dataKey={series}
                dot={false}
                fill={`var(--color-${series})`}
                fillOpacity={0.1}
                key={series}
                mask={`url(#${edgeFadeId})`}
                stroke={`var(--color-${series})`}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                type="monotone"
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
