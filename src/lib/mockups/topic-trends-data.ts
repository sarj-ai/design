export const SCENARIO = {
  name: "Diwan | Phone & Chat Orders",
  status: "Active",
  createdAt: "Nov 22, 2026",
} as const;

export const MIN_CALLS = 40;
export const FEW_CALLS = 12;

export const NOW = Date.UTC(2026, 10, 23, 10, 0);
const DAY = 24 * 3600e3;
const KSA = 3 * 3600e3;

export interface Topic {
  id: string;
  name: string;
  arabic: string;
  definition: string;
}

export interface Call {
  id: string;
  at: number;
  topic: string;
  purpose: string;
  resolved: boolean;
  frustrated: boolean;
  reason: string | null;
}

interface Shape extends Topic {
  perDay: (daysAgo: number) => number;
  unresolved: number;
  frustrated: number;
  purposes: string[];
}

const SHAPES: readonly Shape[] = [
  {
    id: "standard-delivery",
    name: "Standard food delivery",
    arabic: "توصيل الطعام",
    definition:
      "Callers order food for delivery, other than family meals and burger orders with a child allergen check.",
    perDay: () => 2.6,
    unresolved: 0.37,
    frustrated: 0.2,
    purposes: [
      "Order food for delivery",
      "Order two shawarma plates delivered to Al Malqa",
      "Deliver a mixed grill to the office",
      "Add a dessert to a delivery order",
    ],
  },
  {
    id: "pickup",
    name: "Food pickup orders",
    arabic: "طلبات استلام الطعام",
    definition: "Callers order food to collect from a branch.",
    perDay: () => 2.4,
    unresolved: 0.3,
    frustrated: 0.05,
    purposes: [
      "Order food for pickup",
      "Pick up a kabsa order from the Olaya branch",
      "Order ahead and collect at 8 pm",
    ],
  },
  {
    id: "family-meal",
    name: "Family meal delivery",
    arabic: "توصيل الوجبات العائلية",
    definition: "Callers order a family meal for delivery.",
    perDay: (d) => 1.4 + (d < 10 ? 0.6 : 0),
    unresolved: 0.06,
    frustrated: 0.02,
    purposes: [
      "Order a family meal for delivery",
      "Family mandi for eight people, delivered",
      "Weekend family box delivery",
    ],
  },
  {
    id: "child-allergen",
    name: "Child burger allergen orders",
    arabic: "برغر وحساسية الأطفال",
    definition:
      "Callers order burgers and check allergen information for a child.",
    perDay: (d) => (d < 14 ? 1.7 : 0.3),
    unresolved: 0.92,
    frustrated: 0.3,
    purposes: [
      "Order burgers and check allergens for a child",
      "Is the kids burger bun free of sesame?",
      "Burger with no dairy for my son",
    ],
  },
  {
    id: "branch-hours",
    name: "Branch hours and location",
    arabic: "مواعيد وموقع الفروع",
    definition: "Callers ask when a branch is open or where it is.",
    perDay: (d) => (d < 21 ? 0 : 0.5),
    unresolved: 0.1,
    frustrated: 0,
    purposes: [
      "Is the Olaya branch open after midnight?",
      "Where is your nearest branch to Hittin?",
    ],
  },
  {
    id: "other",
    name: "Other",
    arabic: "أخرى",
    definition: "Calls that fit no other topic.",
    perDay: (d) => (d < 5 ? 0.3 : 0),
    unresolved: 0.5,
    frustrated: 0.1,
    purposes: [
      "Ask whether the restaurant caters weddings",
      "Complain about a driver from last week",
    ],
  },
];

export const TOPICS: Topic[] = SHAPES.map(
  ({ id, name, arabic, definition }) => ({ id, name, arabic, definition }),
);

const REASONS: readonly string[] = [
  "Agent could not confirm allergen details",
  "Order not placed before the call ended",
  "Branch closed for pickup at that time",
  "Caller asked for a person and was not transferred",
];

function buildCalls(): Call[] {
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const hex = (n: number) =>
    Array.from({ length: n }, () => Math.floor(rand() * 16).toString(16)).join(
      "",
    );
  const calls: Call[] = [];
  for (let daysAgo = 200; daysAgo >= 0; daysAgo--) {
    for (const shape of SHAPES) {
      const expected = shape.perDay(daysAgo) * (daysAgo > 120 ? 0.7 : 1);
      let n = Math.floor(expected);
      if (rand() < expected - n) n++;
      for (let i = 0; i < n; i++) {
        const at = NOW - daysAgo * DAY - Math.floor(rand() * DAY);
        if (at > NOW) continue;
        const resolved = rand() >= shape.unresolved;
        calls.push({
          id: `${hex(8)}-${hex(4)}-${hex(4)}`,
          at,
          topic: shape.id,
          purpose: shape.purposes[Math.floor(rand() * shape.purposes.length)],
          resolved,
          frustrated: rand() < shape.frustrated,
          reason: resolved
            ? null
            : REASONS[Math.floor(rand() * REASONS.length)],
        });
      }
    }
  }
  return calls.toSorted((a, b) => b.at - a.at);
}

export const CALLS = buildCalls();

export type Period = "7d" | "30d" | "90d" | "all";
export type Show = "all" | "unresolved" | "frustrated";

export const PERIODS: readonly {
  value: Period;
  label: string;
  days: number | null;
}[] = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "all", label: "All time", days: null },
];

export const SHOWS: readonly { value: Show; label: string }[] = [
  { value: "all", label: "All calls" },
  { value: "unresolved", label: "Not resolved" },
  { value: "frustrated", label: "Frustrated" },
];

const FIRST_CALL = Math.min(...CALLS.map((call) => call.at));

export function periodStart(period: Period) {
  const days = PERIODS.find((entry) => entry.value === period)?.days;
  return days == null ? FIRST_CALL : NOW - days * DAY;
}

export function bucketsFor(period: Period) {
  const start = periodStart(period);
  const weekly = (NOW - start) / DAY > 31;
  const step = weekly ? 7 * DAY : DAY;
  const floorDay = (ms: number) => Math.floor((ms + KSA) / DAY) * DAY - KSA;
  let first = floorDay(start);
  if (weekly) first -= new Date(first + KSA).getUTCDay() * DAY;
  const out: number[] = [];
  for (let at = first; at < NOW; at += step) out.push(at);
  return { buckets: out, step, unit: weekly ? "week" : "day" } as const;
}

export interface TopicStats {
  topic: Topic;
  calls: Call[];
  unresolved: Call[];
  share: number;
  unresolvedRate: number;
  frustratedRate: number;
  bars: { at: number; count: number; share: number }[];
}

export function topicStats({
  period,
  show,
  query,
}: {
  period: Period;
  show: Show;
  query: string;
}) {
  const start = periodStart(period);
  const q = query.trim().toLowerCase();
  const calls = CALLS.filter(
    (call) =>
      call.at >= start &&
      (show === "all" ||
        (show === "unresolved" ? !call.resolved : call.frustrated)) &&
      (!q ||
        call.purpose.toLowerCase().includes(q) ||
        (call.reason ?? "").toLowerCase().includes(q) ||
        call.id.startsWith(q)),
  );
  const { buckets, step, unit } = bucketsFor(period);
  const inBucket = (list: Call[], at: number) =>
    list.filter((call) => call.at >= at && call.at < at + step).length;

  const topics: TopicStats[] = TOPICS.map((topic) => {
    const mine = calls.filter((call) => call.topic === topic.id);
    const unresolved = mine.filter((call) => !call.resolved);
    return {
      topic,
      calls: mine,
      unresolved,
      share: calls.length ? mine.length / calls.length : 0,
      unresolvedRate: mine.length ? unresolved.length / mine.length : 0,
      frustratedRate: mine.length
        ? mine.filter((call) => call.frustrated).length / mine.length
        : 0,
      bars: buckets.map((at) => {
        const total = inBucket(calls, at);
        const count = inBucket(mine, at);
        return { at, count, share: total ? count / total : 0 };
      }),
    };
  })
    .filter((entry) => entry.calls.length > 0)
    .toSorted((a, b) => b.calls.length - a.calls.length);

  return { calls, topics, unit, start };
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(value > 0 && value < 0.1 ? 1 : 0)}%`;
}

export function formatDate(ms: number, withTime = false) {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  };
  if (withTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }
  return new Date(ms + KSA).toLocaleString("en-GB", options);
}
