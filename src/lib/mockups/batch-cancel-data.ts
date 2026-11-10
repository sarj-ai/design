export type BatchStatus =
  | "queued"
  | "running"
  | "paused"
  | "done"
  | "cancelled";

export interface Batch {
  id: string;
  name: string;
  status: BatchStatus;
  totalCalls: number;
  completed: number;
  failed: number;
  inProgress: number;

  queued: number;
  cancelled: number;
  pickupRate: number | null;
  successRate: number | null;
  createdAt: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

export const CURRENT_USER = "Omar Haddad";

export function settled(batch: Batch): number {
  return batch.completed + batch.failed + batch.cancelled;
}

export function cancelBatch(batch: Batch, at: string): Batch {
  return {
    ...batch,
    status: "cancelled",
    cancelled: batch.cancelled + batch.queued,
    queued: 0,
    cancelledBy: CURRENT_USER,
    cancelledAt: at,
  };
}

export const DETAIL: Readonly<Batch> = {
  id: "01a134f6-47b8-7a87-b9ba-46340e8a4227",
  name: "Renewals – November list",
  status: "running",
  totalCalls: 8696,
  completed: 1153,
  failed: 92,
  inProgress: 4,
  queued: 7447,
  cancelled: 0,
  pickupRate: 61.4,
  successRate: 38.2,
  createdAt: "Nov 4, 2026",
};

export const LIST: readonly Batch[] = [
  DETAIL,
  {
    id: "01a13523-d79c-7bf2-bb52-b32a18a761e0",
    name: "Renewals – November list (re-upload)",
    status: "paused",
    totalCalls: 8696,
    completed: 0,
    failed: 0,
    inProgress: 0,
    queued: 8696,
    cancelled: 0,
    pickupRate: null,
    successRate: null,
    createdAt: "Nov 4, 2026",
  },
  {
    id: "01a130c2-11fe-7d4a-a0f2-6c1d9b3e5a71",
    name: "Lapsed policies – October",
    status: "cancelled",
    totalCalls: 2410,
    completed: 612,
    failed: 31,
    inProgress: 0,
    queued: 0,
    cancelled: 1767,
    pickupRate: 54.9,
    successRate: 29.7,
    createdAt: "Oct 28, 2026",
    cancelledBy: "Sara Al-Qahtani",
    cancelledAt: "Oct 29, 2026, 10:14 AM",
  },
  {
    id: "01a12b77-5c03-7e19-9d44-2f8a6b0c1d93",
    name: "Welcome calls – new customers",
    status: "done",
    totalCalls: 940,
    completed: 905,
    failed: 35,
    inProgress: 0,
    queued: 0,
    cancelled: 0,
    pickupRate: 72.3,
    successRate: 51.6,
    createdAt: "Oct 21, 2026",
  },
  {
    id: "01a13611-8a2e-7f05-b3c9-4e7d0f1a2b64",
    name: "Claims follow-up",
    status: "queued",
    totalCalls: 318,
    completed: 0,
    failed: 0,
    inProgress: 0,
    queued: 318,
    cancelled: 0,
    pickupRate: null,
    successRate: null,
    createdAt: "Nov 5, 2026",
  },
];
