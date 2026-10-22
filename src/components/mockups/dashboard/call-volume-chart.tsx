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

/* Violet and blue, chart-6 and chart-2. The pair passes the palette checks
   (lightness band, colour-blind separation, contrast on the card); chart-1,
   the brand purple, is too dark to sit beside either as a line. */
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

/* Fades a series in at its first point and out at its last, so its line and
   wash start and stop softly instead of at a hard vertical edge. The mask
   sits on the series' own paths, so the axes beside them stay sharp. It is an
   alpha mask, which reads only each stop's opacity. */
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

/* A short stroke, drawn like the line it names. */
function SeriesKey({ series }: { series: Series }) {
  return (
    <span
      aria-hidden
      className={cn("h-0.5 w-3 shrink-0 rounded-full", SERIES_KEY[series])}
    />
  )
}

/**
 * One series across the period, small and without axes, so the Inbound and
 * Outbound cards carry the chart's colour as data rather than decoration.
 * The big chart below is where it is read; this only shows its shape. It has
 * no margin of its own: the card places it, flush to its bottom and end edges.
 */
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

/**
 * Two 2px lines over a light wash, not stacked, so each series reads on its
 * own against the other. Both fade in and out at their ends. The legend sits
 * on the title's line; under the title, what one point counts ("Calls each
 * hour, today"), which neither the title nor the axis says.
 */
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
