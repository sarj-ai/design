/**
 * PROD-600 — the dashboard's numbers, per period.
 *
 * The chart series is generated first and every total is summed from it, so
 * the cards and the chart always agree. Changes are the API's own numbers,
 * kept as it sends them: a percentage against the previous window, 0 when
 * that window had no calls.
 */

export type PresetPeriod = "today" | "week" | "month" | "quarter"
export type Period = PresetPeriod | "custom"

export const PRESET_PERIODS: readonly { id: PresetPeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Last 7 days" },
  { id: "month", label: "Last 30 days" },
  { id: "quarter", label: "Last 90 days" },
]

/* The second half of `trend_period_label` from the analytics service. It sits
   after the period buttons, so the selected one already says the first half
   ("Last 30 days") and the label only says what it is compared with. */
const COMPARISON: Record<Period, string> = {
  today: "vs yesterday",
  week: "vs previous 7 days",
  month: "vs previous 30 days",
  quarter: "vs previous 90 days",
  custom: "vs previous period",
}

export type ChartPoint = { label: string; inbound: number; outbound: number }

export type Series = "inbound" | "outbound"

export type NumberCard = {
  label: string
  value: string
  /** Percent against the previous window. Only the top three carry one. */
  change?: number
  /** Whether a rise is good news. Average duration is neither, so it stays
   *  neutral whichever way it moves. */
  riseIsGood?: boolean
  /** The chart series this number totals; its card draws that line. */
  series?: Series
}

type DashboardData = {
  comparison: string
  summary: NumberCard[]
  analytics: NumberCard[]
  chart: ChartPoint[]
  /** What one point on the chart counts, and over which window. */
  chartDescription: string
}

/* Deterministic noise, so the mockup draws the same chart on every load. */
function noise(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const DAY_MS = 24 * 60 * 60 * 1000
const TODAY = new Date(Date.UTC(2026, 9, 20))

/* The platform's own format, `formatChartLabel` in call-volume-chart.tsx. */
function dayLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
}

function hourLabel(hour: number) {
  if (hour === 0) return "12AM"
  if (hour === 12) return "12PM"
  return hour < 12 ? `${hour}AM` : `${hour - 12}PM`
}

/* Calls follow the working day: quiet overnight, busiest late morning. */
function hourlySeries(): ChartPoint[] {
  const now = 15
  return Array.from({ length: now + 1 }, (_, hour) => {
    const shape = Math.max(0, Math.sin(((hour - 6) / 14) * Math.PI))
    return {
      label: hourLabel(hour),
      inbound: Math.round(shape * 38 + noise(hour + 1) * 6),
      outbound: Math.round(shape * 22 + noise(hour + 40) * 5),
    }
  })
}

function dailySeries(from: Date, days: number, seed: number): ChartPoint[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(from.getTime() + index * DAY_MS)
    const weekday = date.getUTCDay()
    /* Friday and Saturday are the Saudi weekend. */
    const weekend = weekday === 5 || weekday === 6 ? 0.45 : 1
    return {
      label: dayLabel(date),
      inbound: Math.round((270 + noise(seed + index) * 90) * weekend),
      outbound: Math.round((170 + noise(seed + index + 500) * 70) * weekend),
    }
  })
}

function sum(points: ChartPoint[], key: "inbound" | "outbound") {
  return points.reduce((total, point) => total + point[key], 0)
}

function duration(seconds: number) {
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

type Shape = {
  chart: ChartPoint[]
  durationSeconds: number
  successRate: number
  scenarios: number
  changes: [number, number, number]
}

function build(
  period: Period,
  shape: Shape,
  chartDescription: string,
): DashboardData {
  const inbound = sum(shape.chart, "inbound")
  const outbound = sum(shape.chart, "outbound")
  return {
    comparison: COMPARISON[period],
    summary: [
      {
        label: "Total calls",
        value: (inbound + outbound).toLocaleString("en-US"),
        change: shape.changes[0],
        riseIsGood: true,
      },
      {
        label: "Average duration",
        value: duration(shape.durationSeconds),
        change: shape.changes[1],
      },
      {
        label: "Success rate",
        value: `${shape.successRate}%`,
        change: shape.changes[2],
        riseIsGood: true,
      },
    ],
    analytics: [
      {
        label: "Inbound",
        value: inbound.toLocaleString("en-US"),
        series: "inbound",
      },
      {
        label: "Outbound",
        value: outbound.toLocaleString("en-US"),
        series: "outbound",
      },
      { label: "Scenarios", value: String(shape.scenarios) },
    ],
    chart: shape.chart,
    chartDescription,
  }
}

const SHAPES: Record<PresetPeriod, Shape> = {
  today: {
    chart: hourlySeries(),
    durationSeconds: 134,
    successRate: 86,
    scenarios: 7,
    changes: [12, -8, 3],
  },
  week: {
    chart: dailySeries(new Date(TODAY.getTime() - 6 * DAY_MS), 7, 7),
    durationSeconds: 151,
    successRate: 84,
    scenarios: 11,
    changes: [4, 3, -2],
  },
  month: {
    chart: dailySeries(new Date(TODAY.getTime() - 29 * DAY_MS), 30, 30),
    durationSeconds: 146,
    successRate: 85,
    scenarios: 14,
    changes: [-6, 1, 1],
  },
  quarter: {
    chart: dailySeries(new Date(TODAY.getTime() - 89 * DAY_MS), 90, 90),
    durationSeconds: 139,
    successRate: 83,
    scenarios: 19,
    changes: [18, -4, 3],
  },
}

export type CustomRange = { from: Date; to: Date }

export function rangeLabel(range: CustomRange) {
  return `${dayLabel(range.from)} – ${dayLabel(range.to)} (UTC)`
}

/* The platform buckets today by the hour and every other window by the day
   (`formatChartLabel`), so the chart says which one the reader is looking at. */
function chartDescription(period: Period, range: CustomRange | undefined) {
  if (period === "today") return "Calls each hour, today"
  if (period === "custom") {
    return range
      ? `Calls each day, ${dayLabel(range.from)} – ${dayLabel(range.to)}`
      : "Calls each day"
  }
  const preset = PRESET_PERIODS.find((entry) => entry.id === period)
  return `Calls each day, ${preset?.label.toLowerCase() ?? ""}`
}

export function dashboardData(
  period: Period,
  { noCalls, range }: { noCalls: boolean; range?: CustomRange },
): DashboardData {
  const days =
    range === undefined
      ? 14
      : Math.round((range.to.getTime() - range.from.getTime()) / DAY_MS) + 1
  const from = range?.from ?? new Date(TODAY.getTime() - (days - 1) * DAY_MS)
  const shape: Shape =
    period === "custom"
      ? {
          chart: dailySeries(from, days, days + 300),
          durationSeconds: 142,
          successRate: 85,
          scenarios: 12,
          changes: [-3, 2, 0],
        }
      : SHAPES[period]

  const description = chartDescription(period, range)
  if (!noCalls) return build(period, shape, description)

  /* A window with no calls: every point is zero and the API reports the drop
     against the previous window as it does today. */
  return build(
    period,
    {
      chart: shape.chart.map((point) => ({
        ...point,
        inbound: 0,
        outbound: 0,
      })),
      durationSeconds: 0,
      successRate: 0,
      scenarios: 0,
      changes: [-100, -100, 0],
    },
    description,
  )
}
