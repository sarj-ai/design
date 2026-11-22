// Every toast shape the platform calls today, with copy taken from the
// platform source (products/platform/apps/web/src). Nothing calls
// toast.warning, toast.loading or toast.promise, so those are not shown.

export type ToastKind = "default" | "success" | "error" | "info" | "message";

export type CurrentToast = {
  id: string;
  state: string;
  call: string;
  kind: ToastKind;
  title: string;
  description?: string;
  action?: string;
};

export const CURRENT_TOASTS: CurrentToast[] = [
  {
    id: "default",
    state: "Default",
    call: "toast()",
    kind: "default",
    title: "Copied organization ID",
  },
  {
    id: "default-description",
    state: "Default with description",
    call: "toast() + description",
    kind: "default",
    title: "Template saved",
    description: "“Weekly QA” is ready to reuse.",
  },
  {
    id: "undo",
    state: "Undo",
    call: "toast() + action",
    kind: "default",
    title: "Scenario is live",
    description: "Calls now reach this scenario.",
    action: "Undo",
  },
  {
    id: "success",
    state: "Success",
    call: "toast.success()",
    kind: "success",
    title: "Connector verified",
  },
  {
    id: "info",
    state: "Info",
    call: "toast.info()",
    kind: "info",
    title: "Loading the latest version",
    description:
      "Your unsaved edits are still here. Review the changes before you save.",
  },
  {
    id: "message",
    state: "Message",
    call: "toast.message()",
    kind: "message",
    title: "Nothing new to save",
    description: "This matches the published version.",
  },
  {
    id: "error",
    state: "Error",
    call: "toast.error()",
    kind: "error",
    title: "Export Failed",
    description: "The export could not be generated. Please try again.",
  },
  {
    id: "error-action",
    state: "Error with action",
    call: "toast.error() + action",
    kind: "error",
    title: "Could not update model",
    description: "Could not confirm the update. Reload to check its status.",
    action: "Reload",
  },
];

// The index page the new toasts float over. Only there so the glass has real UI behind it.
export type BackdropRow = {
  name: string;
  live: boolean;
  calls: number;
  lastCall: string;
};

export const BACKDROP_ROWS: BackdropRow[] = [
  {
    name: "Appointment reminders",
    live: true,
    calls: 1284,
    lastCall: "2 min ago",
  },
  { name: "Payment follow-up", live: true, calls: 932, lastCall: "6 min ago" },
  { name: "Order status", live: true, calls: 2410, lastCall: "8 min ago" },
  {
    name: "Lead qualification",
    live: false,
    calls: 318,
    lastCall: "Yesterday",
  },
  {
    name: "Delivery rescheduling",
    live: true,
    calls: 764,
    lastCall: "21 min ago",
  },
  {
    name: "Insurance renewals",
    live: false,
    calls: 145,
    lastCall: "3 days ago",
  },
  { name: "Survey callbacks", live: true, calls: 506, lastCall: "1 h ago" },
  { name: "Card activation", live: true, calls: 1877, lastCall: "1 h ago" },
  {
    name: "Booking confirmation",
    live: false,
    calls: 92,
    lastCall: "Last week",
  },
  { name: "Complaint intake", live: true, calls: 641, lastCall: "2 h ago" },
  {
    name: "Account verification",
    live: true,
    calls: 1203,
    lastCall: "3 h ago",
  },
  { name: "Collections", live: false, calls: 57, lastCall: "Last week" },
  {
    name: "Subscription renewals",
    live: true,
    calls: 1490,
    lastCall: "3 h ago",
  },
  { name: "Missed call recovery", live: true, calls: 388, lastCall: "4 h ago" },
  { name: "Clinic check-in", live: false, calls: 211, lastCall: "2 days ago" },
  { name: "Refund status", live: true, calls: 973, lastCall: "5 h ago" },
  {
    name: "Plan upgrade offers",
    live: false,
    calls: 66,
    lastCall: "Last week",
  },
  { name: "Address confirmation", live: true, calls: 842, lastCall: "6 h ago" },
  {
    name: "Service outage alerts",
    live: true,
    calls: 3105,
    lastCall: "7 h ago",
  },
  {
    name: "Feedback after visit",
    live: true,
    calls: 459,
    lastCall: "Yesterday",
  },
  { name: "Warranty claims", live: false, calls: 133, lastCall: "4 days ago" },
  {
    name: "Onboarding welcome",
    live: true,
    calls: 1022,
    lastCall: "Yesterday",
  },
  {
    name: "Test drive booking",
    live: false,
    calls: 48,
    lastCall: "Last month",
  },
  {
    name: "Prescription refills",
    live: true,
    calls: 697,
    lastCall: "Yesterday",
  },
];
