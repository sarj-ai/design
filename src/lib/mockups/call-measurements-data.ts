export interface CostLine {
  component: string;
  model: string;
  usage: string;
  costUsd: number | null;
  fallback?: boolean;
}

export interface Turn {
  turn: number;
  callerSaid: string;
  endOfSpeechWait: number;
  model: number;
  voice: number;
  interrupted?: boolean;
  fallback?: boolean;
}

export interface Counter {
  label: string;
  value: string;
  detail?: string;
}

export interface MeasurementCase {
  id: "complete" | "partial" | "none";
  label: string;
  call: {
    scenario: string;
    phoneNumber: string;
    startedAt: string;
    duration: string;
  };
  measurements: null | {
    cost: readonly CostLine[];
    turns: readonly Turn[];
    counters: readonly Counter[];
  };
}

const TURNS: readonly Turn[] = [
  {
    turn: 2,
    callerSaid: "Yes, speaking.",
    endOfSpeechWait: 0.42,
    model: 0.51,
    voice: 0.22,
  },
  {
    turn: 3,
    callerSaid: "Which appointment is this about?",
    endOfSpeechWait: 0.38,
    model: 0.62,
    voice: 0.24,
  },
  {
    turn: 4,
    callerSaid: "Oh, the dental one on Thursday.",
    endOfSpeechWait: 0.55,
    model: 0.48,
    voice: 0.21,
  },
  {
    turn: 5,
    callerSaid: "Can I move it to the following week instead?",
    endOfSpeechWait: 0.47,
    model: 0.88,
    voice: 0.26,
    interrupted: true,
  },
  {
    turn: 6,
    callerSaid: "Tuesday would work.",
    endOfSpeechWait: 0.36,
    model: 0.71,
    voice: 0.23,
  },
  {
    turn: 7,
    callerSaid: "Morning, if possible. Before ten.",
    endOfSpeechWait: 0.61,
    model: 1.38,
    voice: 0.29,
    fallback: true,
  },
  {
    turn: 8,
    callerSaid: "Nine thirty is fine.",
    endOfSpeechWait: 0.33,
    model: 0.46,
    voice: 0.2,
  },
  {
    turn: 9,
    callerSaid: "Do I need to bring anything?",
    endOfSpeechWait: 0.44,
    model: 0.93,
    voice: 0.25,
  },
  {
    turn: 10,
    callerSaid: "My insurance card, OK.",
    endOfSpeechWait: 0.81,
    model: 0.52,
    voice: 0.22,
  },
  {
    turn: 11,
    callerSaid: "And the address is the same as last time?",
    endOfSpeechWait: 0.4,
    model: 1.12,
    voice: 0.27,
    interrupted: true,
  },
  {
    turn: 12,
    callerSaid: "Right, the Olaya branch.",
    endOfSpeechWait: 0.37,
    model: 0.49,
    voice: 0.21,
  },
  {
    turn: 13,
    callerSaid: "Is there parking there?",
    endOfSpeechWait: 0.43,
    model: 0.97,
    voice: 0.24,
  },
  {
    turn: 14,
    callerSaid: "Great.",
    endOfSpeechWait: 0.9,
    model: 0.44,
    voice: 0.19,
  },
  {
    turn: 15,
    callerSaid: "Can you send me a text with all of that?",
    endOfSpeechWait: 0.45,
    model: 1.46,
    voice: 0.31,
    fallback: true,
  },
  {
    turn: 16,
    callerSaid: "To this number, yes.",
    endOfSpeechWait: 0.39,
    model: 0.58,
    voice: 0.22,
  },
  {
    turn: 17,
    callerSaid: "Got it, thank you.",
    endOfSpeechWait: 0.52,
    model: 0.47,
    voice: 0.2,
    interrupted: true,
  },
  {
    turn: 18,
    callerSaid: "No, that's everything.",
    endOfSpeechWait: 0.48,
    model: 0.5,
    voice: 0.21,
  },
  {
    turn: 19,
    callerSaid: "Bye.",
    endOfSpeechWait: 0.35,
    model: 0.43,
    voice: 0.2,
  },
];

const COST: readonly CostLine[] = [
  {
    component: "Language model",
    model: "GPT-4.1 mini",
    usage: "41,280 in · 3,904 out tokens",
    costUsd: 0.0262,
  },
  {
    component: "Language model",
    model: "Claude Haiku 4.5",
    usage: "3,910 in · 402 out tokens",
    costUsd: 0.0059,
    fallback: true,
  },
  {
    component: "Speech-to-text",
    model: "Deepgram Nova-3",
    usage: "4.3 min",
    costUsd: 0.0198,
  },
  {
    component: "Text-to-speech",
    model: "ElevenLabs Flash v2.5",
    usage: "3,142 characters",
    costUsd: 0.0471,
  },
  {
    component: "Turn detection",
    model: "Sarj Arabic EOU",
    usage: "18 turns",
    costUsd: 0.0008,
  },
  {
    component: "Telephony",
    model: "Twilio · outbound",
    usage: "4.3 min",
    costUsd: 0.0602,
  },
];

const COUNTERS: readonly Counter[] = [
  { label: "Turn interruption rate", value: "17%", detail: "3 of 18 turns" },
  { label: "LLM requests", value: "24" },
  { label: "Model fallback rate", value: "8%", detail: "2 of 24 requests" },
  { label: "Tool calls", value: "6" },
  { label: "Tool errors", value: "1" },
  { label: "Average tool latency", value: "840 ms" },
  { label: "KB retrieval rate", value: "22%", detail: "4 of 18 turns" },
];

const CALL = {
  scenario: "Appointment reminder",
  phoneNumber: "+966 55 214 0937",
  startedAt: "Nov 11, 2026, 10:42 AM",
  duration: "4m 18s",
} as const;

export const MEASUREMENT_CASES: readonly MeasurementCase[] = [
  {
    id: "complete",
    label: "Fully measured",
    call: CALL,
    measurements: { cost: COST, turns: TURNS, counters: COUNTERS },
  },
  {
    id: "partial",
    label: "Telephony not reported yet",
    call: { ...CALL, startedAt: "Nov 11, 2026, 11:58 AM", duration: "4m 21s" },
    measurements: {
      cost: COST.map((line) =>
        line.component === "Telephony" ? { ...line, costUsd: null } : line,
      ),
      turns: TURNS,
      counters: COUNTERS,
    },
  },
  {
    id: "none",
    label: "Placed before measuring",
    call: { ...CALL, startedAt: "Oct 28, 2026, 3:15 PM", duration: "3m 02s" },
    measurements: null,
  },
];

export const firstSound = (turn: Turn) =>
  turn.endOfSpeechWait + turn.model + turn.voice;

export function percentile(values: readonly number[], p: number) {
  const sorted = values.toSorted((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, rank))];
}

export const formatUsd = (value: number) => `$${value.toFixed(4)}`;
export const formatSeconds = (value: number) => `${value.toFixed(2)} s`;
