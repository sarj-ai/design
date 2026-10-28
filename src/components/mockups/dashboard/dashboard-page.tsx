"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CallVolumeChart,
  Sparkline,
} from "@/components/mockups/dashboard/call-volume-chart"
import {
  ChangeDownIcon,
  ChangeUpIcon,
} from "@/components/mockups/dashboard/icons"
import { PeriodSelector } from "@/components/mockups/dashboard/period-selector"
import { cn } from "@/lib/utils"
import {
  dashboardData,
  type ChartPoint,
  type CustomRange,
  type NumberCard,
  type Period,
} from "@/lib/mockups/dashboard-data"

export function DashboardPage({ noCalls }: { noCalls: boolean }) {
  const [period, setPeriod] = React.useState<Period>("today")
  const [range, setRange] = React.useState<CustomRange>()
  const data = dashboardData(period, { noCalls, range })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <PeriodSelector
          onPeriodChange={setPeriod}
          onRangeApply={(next) => {
            setRange(next)
            setPeriod("custom")
          }}
          period={period}
          range={range}
        />
        <p className="text-sm text-muted-foreground">{data.comparison}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.summary.map((card) => (
          <NumberTile card={card} key={card.label} />
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Call analytics</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {data.analytics.map((card) => (
            <NumberTile card={card} key={card.label} points={data.chart} />
          ))}
        </div>
      </section>

      <CallVolumeChart
        description={data.chartDescription}
        points={data.chart}
      />
    </div>
  )
}

function NumberTile({
  card,
  points,
}: {
  card: NumberCard
  points?: ChartPoint[]
}) {
  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>{card.label}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold tabular-nums">{card.value}</p>
        {card.change === undefined ? null : (
          <Change percent={card.change} riseIsGood={card.riseIsGood} />
        )}
      </CardContent>
      {card.series && points ? (
        <Sparkline
          className="absolute end-0 bottom-0 h-14 w-1/2 mask-l-from-60%"
          points={points}
          series={card.series}
        />
      ) : null}
    </Card>
  )
}

function Change({
  percent,
  riseIsGood,
}: {
  percent: number
  riseIsGood: boolean | undefined
}) {
  const Arrow = percent > 0 ? ChangeUpIcon : percent < 0 ? ChangeDownIcon : null
  const direction = percent > 0 ? "Up " : percent < 0 ? "Down " : ""
  const tone =
    percent === 0 || riseIsGood === undefined
      ? "neutral"
      : percent > 0 === riseIsGood
        ? "good"
        : "bad"
  /* Tint foregrounds: `success` and `destructive` are fills, too light for 14px text. */
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
  )
}
