import type { Opportunity } from "@/lib/mockups/opportunity-triage-data";

export { SCENARIO } from "@/lib/mockups/opportunity-triage-data";

export type PresetPeriod = "today" | "week" | "month" | "quarter";
export type Period = PresetPeriod | "custom";
export interface CustomRange {
  from: Date;
  to: Date;
}

export const PRESET_PERIODS: readonly { id: PresetPeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Last 7 days" },
  { id: "month", label: "Last 30 days" },
  { id: "quarter", label: "Last 90 days" },
];

export const COMPARISON: Record<Period, string> = {
  today: "vs yesterday",
  week: "vs previous 7 days",
  month: "vs previous 30 days",
  quarter: "vs previous 90 days",
  custom: "vs previous period",
};

export type Granularity = "hour" | "day" | "week" | "month" | "year";

export const GRANULARITIES: readonly {
  id: Granularity;
  label: string;
  minDays: number;
  maxDays: number;
}[] = [
  { id: "hour", label: "Hourly", minDays: 0, maxDays: 7 },
  { id: "day", label: "Daily", minDays: 2, maxDays: 400 },
  { id: "week", label: "Weekly", minDays: 14, maxDays: 2000 },
  { id: "month", label: "Monthly", minDays: 60, maxDays: 4000 },
  { id: "year", label: "Yearly", minDays: 730, maxDays: 100000 },
];

export type VersionFilter = "all" | "12" | "11" | "10";

export const VERSIONS: readonly {
  id: VersionFilter;
  label: string;
  live?: boolean;
}[] = [
  { id: "all", label: "All versions" },
  { id: "12", label: "Version 12", live: true },
  { id: "11", label: "Version 11" },
  { id: "10", label: "Version 10" },
];

const VERSION_PROFILE: Record<
  VersionFilter,
  { share: number; latency: number; cost: number; failure: number }
> = {
  all: { share: 1, latency: 1, cost: 1, failure: 1 },
  "12": { share: 0.58, latency: 0.9, cost: 0.92, failure: 0.86 },
  "11": { share: 0.29, latency: 1.06, cost: 1.04, failure: 1.08 },
  "10": { share: 0.13, latency: 1.24, cost: 1.18, failure: 1.36 },
};

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
export const NOW = new Date(Date.UTC(2026, 10, 11, 15));
export const TODAY = new Date(Date.UTC(2026, 10, 11));

export function rangeFor(period: Period, range?: CustomRange): CustomRange {
  switch (period) {
    case "today":
      return { from: TODAY, to: NOW };
    case "week":
      return { from: new Date(TODAY.getTime() - 6 * DAY_MS), to: NOW };
    case "month":
      return { from: new Date(TODAY.getTime() - 29 * DAY_MS), to: NOW };
    case "quarter":
      return { from: new Date(TODAY.getTime() - 89 * DAY_MS), to: NOW };
    case "custom":
      return range
        ? { from: range.from, to: new Date(range.to.getTime() + DAY_MS) }
        : { from: new Date(TODAY.getTime() - 29 * DAY_MS), to: NOW };
  }
}

export function daysIn(range: CustomRange) {
  return (range.to.getTime() - range.from.getTime()) / DAY_MS;
}

export function granularityFits(granularity: Granularity, days: number) {
  const entry = GRANULARITIES.find((each) => each.id === granularity);
  if (!entry) return false;
  return days >= entry.minDays && days <= entry.maxDays;
}

export const DEFAULT_GRANULARITY: Record<PresetPeriod, Granularity> = {
  today: "hour",
  week: "day",
  month: "day",
  quarter: "week",
};

export function fallbackGranularity(days: number): Granularity {
  if (days <= 1) return "hour";
  if (days <= 120) return "day";
  if (days <= 730) return "week";
  return "month";
}

export function rangeLabel(range: CustomRange) {
  return `${shortDate(range.from)} – ${shortDate(range.to)}`;
}

function shortDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function noise(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export type CostComponent = "llm" | "tts" | "stt" | "eou" | "telephony";

export const COST_COMPONENTS: readonly {
  id: CostComponent;
  label: string;
  model: string;
  perConversation: number;
}[] = [
  { id: "llm", label: "LLM", model: "GPT-4.1", perConversation: 0.046 },
  {
    id: "tts",
    label: "TTS",
    model: "ElevenLabs Flash v2.5",
    perConversation: 0.027,
  },
  {
    id: "telephony",
    label: "Telephony",
    model: "Twilio",
    perConversation: 0.019,
  },
  { id: "stt", label: "STT", model: "Deepgram Nova-3", perConversation: 0.011 },
  { id: "eou", label: "EoU", model: "Turn detection", perConversation: 0.003 },
];

export type Bucket = {
  label: string;
  conversations: number;
  p50: number;
  p75: number;
  p95: number;
} & Record<CostComponent, number>;

function next(date: Date, granularity: Granularity) {
  switch (granularity) {
    case "hour":
      return new Date(date.getTime() + HOUR_MS);
    case "day":
      return new Date(date.getTime() + DAY_MS);
    case "week":
      return new Date(date.getTime() + 7 * DAY_MS);
    case "month":
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1));
    case "year":
      return new Date(Date.UTC(date.getUTCFullYear() + 1, 0));
  }
}

function label(date: Date, granularity: Granularity, days: number) {
  const opts: Intl.DateTimeFormatOptions = { timeZone: "UTC" };
  if (granularity === "hour") {
    const hour = date.toLocaleTimeString("en-US", {
      ...opts,
      hour: "numeric",
    });
    if (days <= 1) return hour.replace(" ", "");
    return `${date.toLocaleDateString("en-US", { ...opts, day: "numeric", month: "short" })}, ${hour.replace(" ", "")}`;
  }
  if (granularity === "month") {
    return date.toLocaleDateString("en-US", {
      ...opts,
      month: "short",
      year: "numeric",
    });
  }
  if (granularity === "year") return String(date.getUTCFullYear());
  return date.toLocaleDateString("en-US", {
    ...opts,
    day: "numeric",
    month: "short",
  });
}

function hourShape(hour: number) {
  return Math.max(0.05, Math.sin(((hour - 8) / 14) * Math.PI)) * 1.6;
}

function weekdayShape(weekday: number) {
  return weekday === 5 ? 0.35 : weekday === 6 ? 0.8 : 1;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export interface Tile {
  label: string;
  value: string;
  change: number;
  riseIsGood: boolean | undefined;
}

export interface FailureReason {
  reason: string;
  count: number;
  share: number;
}

export interface CostRow {
  id: CostComponent;
  component: string;
  model: string;
  perConversation: number;
  total: number;
  share: number;
}

export interface ScenarioDashboard {
  empty: boolean;
  series: Bucket[];
  volume: Tile[];
  latency: { p50: number; p75: number; p95: number };
  latencyTiles: Tile[];
  totalCost: number;
  costPerConversation: number;
  costRows: CostRow[];
  outcomes: Tile[];
  failureRate: number;
  failures: FailureReason[];
  toolsAndModels: Tile[];
}

const FAILURE_SHARES: readonly { reason: string; share: number }[] = [
  { reason: "User hung up", share: 0.37 },
  { reason: "Didn't respond", share: 0.23 },
  { reason: "Voicemail", share: 0.15 },
  { reason: "Line busy", share: 0.1 },
  { reason: "Transfer failed", share: 0.07 },
  { reason: "Tool error", share: 0.05 },
  { reason: "Other", share: 0.03 },
];

export function buildDashboard({
  empty,
  granularity,
  period,
  range,
  version,
}: {
  empty: boolean;
  granularity: Granularity;
  period: Period;
  range?: CustomRange;
  version: VersionFilter;
}): ScenarioDashboard {
  const window = rangeFor(period, range);
  const series = empty ? [] : buildSeries(window, granularity, version);
  const profile = VERSION_PROFILE[version];
  const days = Math.max(daysIn(window), 1 / 24);

  const conversations = series.reduce(
    (sum, each) => sum + each.conversations,
    0,
  );
  const weight = (key: "p50" | "p75" | "p95") =>
    conversations === 0
      ? 0
      : Math.round(
          series.reduce(
            (sum, each) => sum + each[key] * each.conversations,
            0,
          ) / conversations,
        );

  const costRows: CostRow[] = COST_COMPONENTS.map((component) => {
    const total = round2(
      series.reduce((sum, each) => sum + each[component.id], 0),
    );
    return {
      id: component.id,
      component: component.label,
      model: component.model,
      total,
      perConversation: conversations === 0 ? 0 : total / conversations,
      share: 0,
    };
  });
  const totalCost = round2(costRows.reduce((sum, row) => sum + row.total, 0));
  for (const row of costRows)
    row.share = totalCost === 0 ? 0 : row.total / totalCost;

  const avgSeconds = Math.round(168 * (version === "10" ? 1.12 : 1));
  const failureRate = 0.114 * profile.failure;
  const failed = Math.round(conversations * failureRate);
  const seed =
    (period.length + granularity.length) * 31 +
    Number(version === "all" ? 0 : version);

  return {
    empty: conversations === 0,
    series,
    volume: [
      {
        label: "Conversations",
        value: conversations.toLocaleString("en-US"),
        change: change(seed + 1, 30),
        riseIsGood: undefined,
      },
      {
        label: "Callees",
        value: Math.round(conversations * 0.81).toLocaleString("en-US"),
        change: change(seed + 2, 30),
        riseIsGood: undefined,
      },
      {
        label: "Batches",
        value: String(Math.max(1, Math.round(days * 1.4 * profile.share))),
        change: change(seed + 3, 20),
        riseIsGood: undefined,
      },
      {
        label: "Peak concurrent calls",
        value: String(Math.max(1, Math.round(24 * profile.share + 2))),
        change: change(seed + 4, 20),
        riseIsGood: undefined,
      },
      {
        label: "Total conversation duration",
        value: formatHours(conversations * avgSeconds),
        change: change(seed + 5, 30),
        riseIsGood: undefined,
      },
      {
        label: "Average call duration",
        value: formatDuration(avgSeconds),
        change: change(seed + 6, 12),
        riseIsGood: undefined,
      },
    ],
    latency: { p50: weight("p50"), p75: weight("p75"), p95: weight("p95") },
    latencyTiles: [
      {
        label: "Turn-taking latency",
        value: formatMs(Math.round(410 * profile.latency)),
        change: change(seed + 7, 14),
        riseIsGood: false,
      },
      {
        label: "Turn interruption rate",
        value: formatPercent(0.09 * profile.failure),
        change: change(seed + 8, 14),
        riseIsGood: false,
      },
    ],
    totalCost,
    costPerConversation: conversations === 0 ? 0 : totalCost / conversations,
    costRows,
    outcomes: [
      {
        label: "Call outcome success rate",
        value: formatPercent(0.712 / Math.sqrt(profile.failure)),
        change: change(seed + 9, 10),
        riseIsGood: true,
      },
      {
        label: "Agent outcome success rate",
        value: formatPercent(0.648 / Math.sqrt(profile.failure)),
        change: change(seed + 10, 10),
        riseIsGood: true,
      },
      {
        label: "Transfer to human rate",
        value: formatPercent(0.061 * profile.failure),
        change: change(seed + 11, 14),
        riseIsGood: false,
      },
    ],
    failureRate,
    failures: FAILURE_SHARES.map((entry) => ({
      reason: entry.reason,
      share: entry.share,
      count: Math.round(failed * entry.share),
    })),
    toolsAndModels: [
      {
        label: "Tool calls",
        value: Math.round(conversations * 3.4).toLocaleString("en-US"),
        change: change(seed + 12, 30),
        riseIsGood: undefined,
      },
      {
        label: "Tool errors",
        value: Math.round(conversations * 3.4 * 0.021).toLocaleString("en-US"),
        change: change(seed + 13, 30),
        riseIsGood: false,
      },
      {
        label: "Average tool latency",
        value: formatMs(Math.round(940 * profile.latency)),
        change: change(seed + 14, 14),
        riseIsGood: false,
      },
      {
        label: "LLM requests",
        value: Math.round(conversations * 11.6).toLocaleString("en-US"),
        change: change(seed + 15, 30),
        riseIsGood: undefined,
      },
      {
        label: "Model fallback rate",
        value: formatPercent(0.042 * profile.failure),
        change: change(seed + 16, 20),
        riseIsGood: false,
      },
      {
        label: "KB retrieval rate",
        value: formatPercent(0.18 / profile.failure),
        change: change(seed + 17, 14),
        riseIsGood: true,
      },
    ],
  };
}

function change(seed: number, spread: number) {
  return Math.round((noise(seed) - 0.45) * spread * 10) / 10;
}

function buildSeries(
  range: CustomRange,
  granularity: Granularity,
  version: VersionFilter,
): Bucket[] {
  const profile = VERSION_PROFILE[version];
  const days = daysIn(range);
  return bucketStarts(range, granularity).map((start) => {
    const end = Math.min(
      next(start, granularity).getTime(),
      range.to.getTime(),
    );
    const from = Math.max(start.getTime(), range.from.getTime());
    const hours = Math.max(0, (end - from) / HOUR_MS);
    const seed = Math.floor(start.getTime() / HOUR_MS);
    const shape =
      granularity === "hour"
        ? hourShape(start.getUTCHours()) * weekdayShape(start.getUTCDay())
        : granularity === "day"
          ? weekdayShape(start.getUTCDay())
          : 0.88;
    const conversations = Math.round(
      hours * 9 * shape * profile.share * (0.82 + noise(seed) * 0.36),
    );
    const p50 = Math.round(
      (780 + noise(seed + 7) * 140) * profile.latency -
        (1 - (NOW.getTime() - start.getTime()) / (120 * DAY_MS)) * 60,
    );
    const bucket: Bucket = {
      label: label(start, granularity, days),
      conversations,
      p50,
      p75: Math.round(p50 * (1.32 + noise(seed + 11) * 0.08)),
      p95: Math.round(p50 * (2.05 + noise(seed + 13) * 0.3)),
      llm: 0,
      tts: 0,
      stt: 0,
      eou: 0,
      telephony: 0,
    };
    for (const [index, component] of COST_COMPONENTS.entries()) {
      bucket[component.id] = round2(
        conversations *
          component.perConversation *
          profile.cost *
          (0.9 + noise(seed + 17 + index) * 0.2),
      );
    }
    return bucket;
  });
}

function bucketStarts(range: CustomRange, granularity: Granularity): Date[] {
  const starts: Date[] = [];
  let cursor = new Date(range.from);
  if (granularity === "week") {
    const shift = (cursor.getUTCDay() + 6) % 7;
    cursor = new Date(cursor.getTime() - shift * DAY_MS);
  }
  if (granularity === "month") {
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth()));
  }
  if (granularity === "year") {
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), 0));
  }
  while (cursor < range.to) {
    starts.push(cursor);
    cursor = next(cursor, granularity);
  }
  return starts;
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatMs(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${String(ms)} ms`;
}

export function formatAxisMs(ms: number) {
  return ms === 0 ? "0" : `${String(ms / 1000)} s`;
}

export function formatUsd(value: number, digits = 2) {
  return `$${value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })}`;
}

function formatDuration(seconds: number) {
  return `${String(Math.floor(seconds / 60))}m ${String(seconds % 60).padStart(2, "0")}s`;
}

function formatHours(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours.toLocaleString("en-US")}h ${String(minutes).padStart(2, "0")}m`;
}

export const RULE_OPPORTUNITIES: readonly Opportunity[] = [
  {
    id: "slow-policy-lookup",
    title: "check_policy_status is slow: p95 2.9 s",
    category: "tool",
    description:
      "Rule: a tool's p95 latency is over 2 s. The caller hears silence while it runs, and it adds about 1.4 s to every turn that calls it.",
    callCount: 612,
    decision: null,
    callsSinceDecision: 0,
    isNew: true,
  },
  {
    id: "sms-link-errors",
    title: "send_payment_link fails on 8.3% of calls",
    category: "tool",
    description:
      'Rule: a tool\'s error rate is over 5%. Most errors are "invalid recipient": the number is passed without a country code.',
    callCount: 141,
    decision: null,
    callsSinceDecision: 0,
    isNew: false,
  },
  {
    id: "llm-cost-share",
    title: "GPT-4.1 is 43% of cost per conversation",
    category: "platform",
    description:
      "Rule: one model is over 35% of the cost per conversation. A smaller model for this scenario's prompt would lower it.",
    callCount: 1708,
    decision: null,
    callsSinceDecision: 0,
    isNew: true,
  },
  {
    id: "model-fallback",
    title: "Model fallback on 4.2% of LLM requests",
    category: "platform",
    description:
      "Rule: the fallback rate is over 2%. The primary model timed out after 6 s and the fallback model answered.",
    callCount: 288,
    decision: { kind: "resolved", by: "Sara Al-Qahtani", at: "2026-11-02" },
    callsSinceDecision: 37,
    isNew: false,
  },
  {
    id: "kb-retrieval",
    title: "Knowledge base used on 18% of questions",
    category: "knowledge",
    description:
      "Rule: KB retrieval is under 25% of caller questions. Questions about renewal fees were answered from the prompt instead.",
    callCount: 402,
    decision: null,
    callsSinceDecision: 0,
    isNew: false,
  },
  {
    id: "interruptions",
    title: "Agent interrupts the caller on 9% of turns",
    category: "platform",
    description:
      "Rule: the turn interruption rate is over 7%. Most happen when the caller pauses mid-number while reading a plate or policy number.",
    callCount: 534,
    decision: null,
    callsSinceDecision: 0,
    isNew: false,
  },
  {
    id: "tts-cost",
    title: "ElevenLabs Multilingual v2 costs 2x Flash v2.5",
    category: "platform",
    description:
      "Rule: a model costs more than twice an available alternative with the same voice.",
    callCount: 1120,
    decision: { kind: "resolved", by: "Omar Haddad", at: "2026-10-28" },
    callsSinceDecision: 0,
    isNew: false,
  },
  {
    id: "long-greeting",
    title: "First message takes 11 s to play",
    category: "prompt",
    description:
      "Rule: the first message is over 8 s. 31% of hang-ups happen before it ends.",
    callCount: 219,
    decision: { kind: "dismissed", by: "Omar Haddad", at: "2026-10-30" },
    callsSinceDecision: 0,
    isNew: false,
  },
];
