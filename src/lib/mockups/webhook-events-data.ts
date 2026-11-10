export type EventGroup = "result" | "lifecycle";

export interface WebhookEvent {
  type: string;
  group: EventGroup;
  description: string;

  defaultOn: boolean;
  payload: Payload;
}

export type Payload =
  | null
  | boolean
  | number
  | string
  | Payload[]
  | { [key: string]: Payload };

const CALL_ID = "01a13523-d79c-7bf2-bb52-b32a18a761e0";
const AT = "2026-11-10T09:14:02Z";

function terminal(status: string, type: string): Payload {
  return {
    "call_id": CALL_ID,
    payload: {
      "call_data": {
        "call_id": CALL_ID,
        "created_at": "2026-11-10T09:12:41Z",
        direction: "outbound",
        status,
      },
      "call_started": "2026-11-10T09:12:44Z",
      "response_body": { "appointment_confirmed": true },
      type,
    },
  };
}

function envelope(type: string, data: Payload): Payload {
  return {
    "event_id": "evt_01JCK8Z3Q4M2",
    "event_type": type,
    "occurred_at": AT,
    "call_id": CALL_ID,
    data,
  };
}

export const EVENTS: readonly WebhookEvent[] = [
  {
    type: "completed",
    group: "result",
    description: "The call ended as completed. Same payload as today.",
    defaultOn: true,
    payload: terminal("completed", "complete"),
  },
  {
    type: "not_completed",
    group: "result",
    description:
      "The call ended any other way: failed, timed out, rejected, voicemail, hit its maximum length, cancelled or expired. Same payload as today.",
    defaultOn: true,
    payload: terminal("user_rejected", "not_complete"),
  },
  {
    type: "call.started",
    group: "lifecycle",
    description: "A call attempt became active. Sent once per attempt.",
    defaultOn: false,
    payload: envelope("call.started", { "attempt_number": 1 }),
  },
  {
    type: "call.transfer_connected",
    group: "lifecycle",
    description: "The transfer destination answered and the handoff completed.",
    defaultOn: false,
    payload: envelope("call.transfer_connected", {
      "attempt_id": "att_01JCK8ZB7R",
      destination: { "phone_number": "+966 11 520 4410" },
    }),
  },
  {
    type: "call.transfer_failed",
    group: "lifecycle",
    description:
      "A transfer attempt ended without connecting: busy, not answered, rejected or a provider error.",
    defaultOn: false,
    payload: envelope("call.transfer_failed", {
      "attempt_id": "att_01JCK8ZB7R",
      destination: { "phone_number": "+966 11 520 4410" },
      "failure_reason": "not_answered",
    }),
  },
];

export const GROUPS: readonly { id: EventGroup; label: string }[] = [
  { id: "result", label: "When a call ends" },
  { id: "lifecycle", label: "During a call" },
];

export const DEFAULT_ON: ReadonlySet<string> = new Set(
  EVENTS.filter((event) => event.defaultOn).map((event) => event.type),
);

export const SAVED_URL = "https://hooks.acme-health.com/sarj/calls";

export const CREDENTIALS = [
  { id: "crm-bearer", label: "CRM bearer token" },
  { id: "hooks-api-key", label: "Hooks API key" },
] as const;
