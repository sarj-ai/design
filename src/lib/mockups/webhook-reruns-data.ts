export const TODAY = new Date("2026-11-11T12:00:00Z");
const DAY = 86_400_000;

export const REBUILD_DAYS = 30;
export const RUN_CAP = 500;

export const ORGANIZATIONS = [
  "Acme Health",
  "Riyadh Motors",
  "Gulf Insurance",
] as const;

export const SCENARIOS: readonly { value: string; label: string }[] = [
  { value: "appointment-reminders", label: "Appointment reminders" },
  { value: "payment-follow-up", label: "Payment follow-up" },
  { value: "lead-qualification", label: "Lead qualification" },
  { value: "post-visit-survey", label: "Post-visit survey" },
];

export type Delivery = "delivered" | "failed";

export const DELIVERIES: readonly { value: Delivery; label: string }[] = [
  { value: "failed", label: "Failed" },
  { value: "delivered", label: "Delivered" },
];

export interface PastCall {
  id: string;
  scenario: string;
  endedAt: Date;
  delivery: Delivery;
  code: number | null;
  attempts: number;
}

const FAIL_CODES: readonly (number | null)[] = [
  500,
  502,
  503,
  504,
  null,
  401,
  404,
];

function generate(): PastCall[] {
  const random = lcg(313);
  const calls: PastCall[] = [];
  for (let i = 0; i < 6000; i += 1) {
    const ageDays = random() * 90;
    const failed = random() < (ageDays < 8 && ageDays > 5 ? 0.45 : 0.08);
    calls.push({
      id: `${hex(random, 8)}-${hex(random, 4)}-7${hex(random, 3)}-${hex(random, 4)}-${hex(random, 12)}`,
      scenario:
        SCENARIOS[Math.floor(random() * SCENARIOS.length)]?.value ??
        "appointment-reminders",
      endedAt: new Date(TODAY.getTime() - ageDays * DAY),
      delivery: failed ? "failed" : "delivered",
      code: failed
        ? (FAIL_CODES[Math.floor(random() * FAIL_CODES.length)] ?? null)
        : 200,
      attempts: failed ? 4 : 1,
    });
  }
  return calls.toSorted((a, b) => b.endedAt.getTime() - a.endedAt.getTime());
}

function lcg(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state / 4_294_967_296;
  };
}

function hex(random: () => number, length: number) {
  return Array.from({ length }, () =>
    Math.floor(random() * 16).toString(16),
  ).join("");
}

export const CALLS = generate();

export function withinRebuild(date: Date) {
  return TODAY.getTime() - date.getTime() <= REBUILD_DAYS * DAY;
}

export function scenarioLabel(value: string) {
  return SCENARIOS.find((entry) => entry.value === value)?.label ?? value;
}

export function codeLabel(code: number | null) {
  return code === null ? "Timed out" : String(code);
}

export type Payload = "stored" | "rebuilt";

export interface Attempt {
  id: string;
  at: Date;
  trigger: string;
  payload: Payload;
  code: number | null;
  pending?: boolean;
}

export type SingleCallState = "failed" | "delivered" | "old";

export interface SingleCall {
  id: string;
  scenario: string;
  endedAt: Date;
  url: string;
  attempts: Attempt[];
}

const WEBHOOK_URL = "https://hooks.acme-health.com/sarj/calls";

function at(days: number, time: string) {
  const date = new Date(TODAY.getTime() - days * DAY);
  const [h, m, s] = time.split(":").map(Number);
  date.setUTCHours(h, m, s);
  return date;
}

function automatic(days: number, times: string[], codes: (number | null)[]) {
  return times.map<Attempt>((time, index) => ({
    id: `auto-${String(days)}-${String(index)}`,
    at: at(days, time),
    trigger: index === 0 ? "After the call" : "Automatic retry",
    payload: "stored",
    code: codes[index] ?? null,
  }));
}

export const SINGLE_CALLS: Record<SingleCallState, SingleCall> = {
  failed: {
    id: "01a13523-d79c-7bf2-bb52-b32a18a761e0",
    scenario: "appointment-reminders",
    endedAt: at(6, "09:14:02"),
    url: WEBHOOK_URL,
    attempts: automatic(
      6,
      ["09:14:03", "09:14:33", "09:16:33", "09:24:33"],
      [503, 503, 502, null],
    ).toReversed(),
  },
  delivered: {
    id: "01a1352f-0b44-7c18-9e02-6d1f4a07b3c9",
    scenario: "payment-follow-up",
    endedAt: at(3, "14:41:19"),
    url: WEBHOOK_URL,
    attempts: automatic(3, ["14:41:20"], [200]),
  },
  old: {
    id: "01a0f7c2-55e1-7a0d-8c3b-2e9b6f114d07",
    scenario: "lead-qualification",
    endedAt: at(47, "11:02:55"),
    url: WEBHOOK_URL,
    attempts: automatic(
      47,
      ["11:02:56", "11:03:26", "11:05:26", "11:13:26"],
      [500, 500, 500, 500],
    ).toReversed(),
  },
};

export const STAFF_NAME = "Lina Al-Harbi";

export const SAMPLE_PAYLOAD = {
  "call_id": "01a13523-d79c-7bf2-bb52-b32a18a761e0",
  payload: {
    "call_data": {
      "call_id": "01a13523-d79c-7bf2-bb52-b32a18a761e0",
      "created_at": "2026-11-05T09:12:41Z",
      direction: "outbound",
      status: "completed",
    },
    "call_started": "2026-11-05T09:12:44Z",
    "response_body": { "appointment_confirmed": true },
    type: "complete",
  },
} as const;
