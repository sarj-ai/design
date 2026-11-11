import type {
  Field,
  Subject,
  Version,
} from "@/lib/mockups/config-versioning-data";
import type {
  ApprovalRequest,
  Change,
  Status,
  Viewer,
} from "@/lib/mockups/publish-approval-data";

export type Section = Field & {
  order: number;
  scope: string;
  language: string | null;
};

export const SECTIONS: readonly Section[] = [
  {
    id: "voice",
    label: "Voice and tone",
    order: 1,
    scope: "General",
    language: null,
    multiline: true,
  },
  {
    id: "numbers",
    label: "Numbers, dates and amounts",
    order: 2,
    scope: "General",
    language: null,
    multiline: true,
  },
  {
    id: "dialect",
    label: "Saudi dialect",
    order: 3,
    scope: "General",
    language: "AR",
    multiline: true,
  },
  {
    id: "tools",
    label: "Tool calls",
    order: 4,
    scope: "Provider: OpenAI (gpt-realtime)",
    language: null,
    multiline: true,
  },
];

const lines = (...rows: string[]) => rows.join("\n");

const VOICE_A = lines(
  "You are speaking on a phone call. Keep every reply to one or two short sentences.",
  "Never read out lists, links or markdown.",
  "If the caller interrupts, stop and listen.",
);
const VOICE_B = lines(
  "You are speaking on a phone call. Keep every reply to one or two short sentences.",
  "Never read out lists, links or markdown.",
  "If the caller interrupts, stop and listen.",
  "Before a pause longer than two seconds, say you are checking.",
);
const VOICE_C = lines(
  "You are speaking on a phone call. Keep every reply to one or two short sentences.",
  "Never read out lists, links or markdown.",
  "If the caller interrupts, stop and listen.",
  "Before a pause longer than two seconds, say you are checking.",
  "If you can't help, say so once and offer a transfer.",
);

const NUMBERS_A = lines(
  "Say amounts in words, with the currency last: “two hundred and fifty riyals”.",
  "Say dates as day and month only, unless the year is different from this year.",
);
const NUMBERS_B = lines(
  "Say amounts in words, with the currency last: “two hundred and fifty riyals”.",
  "Say dates as day and month only, unless the year is different from this year.",
  "Read phone numbers and IDs in groups of three, and confirm them back.",
);
const NUMBERS_C = lines(
  "Say amounts in words, with the currency last: “two hundred and fifty riyals”.",
  "Say dates as day and month only, unless the year is different from this year.",
  "Read phone numbers and IDs in groups of two, and confirm them back.",
);

const DIALECT_A = lines(
  "تحدث باللهجة السعودية البيضاء، وتجنب الفصحى الرسمية.",
  "استخدم «حياك» و«أبشر» بشكل طبيعي، ولا تكررها في كل رد.",
);
const DIALECT_B = lines(
  "تحدث باللهجة السعودية البيضاء، وتجنب الفصحى الرسمية.",
  "استخدم «حياك» و«أبشر» بشكل طبيعي، ولا تكررها في كل رد.",
  "إذا تحدث المتصل بالإنجليزية، أكمل بالإنجليزية.",
);

const TOOLS_A = lines(
  "Call a tool only after the caller has given every value it needs.",
  "Never tell the caller the name of a tool.",
);
const TOOLS_B = lines(
  "Call a tool only after the caller has given every value it needs.",
  "Never tell the caller the name of a tool.",
  "If a tool fails, apologise once and offer to call back.",
);

function versions(): Version[] {
  return [
    {
      n: 23,
      author: "You",
      mine: true,
      at: "Today, 13:20",
      editedFrom: 22,
      note: "Offer a transfer when the agent can't help",
      body: body(VOICE_C, NUMBERS_C, DIALECT_B, TOOLS_B),
    },
    {
      n: 22,
      author: "Sami Rahman",
      mine: false,
      at: "Today, 10:05",
      editedFrom: 21,
      note: "IDs in pairs",
      body: body(VOICE_B, NUMBERS_C, DIALECT_B, TOOLS_B),
    },
    {
      n: 21,
      author: "Nouf Al-Harbi",
      mine: false,
      at: "Yesterday, 17:40",
      editedFrom: 20,
      note: "Apologise once when a tool fails",
      body: body(VOICE_B, NUMBERS_B, DIALECT_B, TOOLS_B),
    },
    {
      n: 20,
      author: "Sami Rahman",
      mine: false,
      at: "4 Nov, 11:12",
      editedFrom: 19,
      note: "Switch to English when the caller does",
      body: body(VOICE_B, NUMBERS_B, DIALECT_B, TOOLS_A),
    },
    {
      n: 19,
      author: "You",
      mine: true,
      at: "30 Oct, 09:30",
      editedFrom: 18,
      note: null,
      body: body(VOICE_B, NUMBERS_B, DIALECT_A, TOOLS_A),
    },
    {
      n: 18,
      author: "Nouf Al-Harbi",
      mine: false,
      at: "27 Oct, 15:04",
      editedFrom: 17,
      note: "Say you're checking before a long pause",
      body: body(VOICE_B, NUMBERS_A, DIALECT_A, TOOLS_A),
    },
    {
      n: 17,
      author: "Sami Rahman",
      mine: false,
      at: "20 Oct, 10:55",
      editedFrom: null,
      note: "First version",
      body: body(VOICE_A, NUMBERS_A, DIALECT_A, TOOLS_A),
    },
  ];
}

function body(
  voice: string,
  numbers: string,
  dialect: string,
  tools: string,
): Record<string, string> {
  return { voice, numbers, dialect, tools };
}

export const GLOBAL_PROMPT: Subject = {
  name: "Global prompts",
  fields: [...SECTIONS],
  versions: versions(),
  live: true,
  inUse: 21,
  log: [
    { n: 21, by: "Nouf Al-Harbi", at: "yesterday 17:52", how: "published" },
    { n: 20, by: "Sami Rahman", at: "4 Nov, 11:30", how: "published" },
    { n: 18, by: "Nouf Al-Harbi", at: "27 Oct, 15:10", how: "published" },
    { n: 17, by: "Sami Rahman", at: "20 Oct, 11:00", how: "published" },
  ],
  toggled: null,
};

export const APPROVERS = "Sarj";

export type Mode = "direct" | "approval";

export const MODES = [
  { id: "direct", label: "Publish directly" },
  { id: "approval", label: "Through approval" },
] as const satisfies readonly { id: Mode; label: string }[];

export type PersonId = "publisher" | "editor" | "view-only" | "approver";

export type Person = Viewer & {
  personId: PersonId;
  canEdit: boolean;
  canPublish: boolean;
};

export const PEOPLE: Record<Mode, Person[]> = {
  direct: [
    {
      personId: "publisher",
      id: "requester",
      name: "Ahmad Khalil",
      label: "Can save and publish",
      sarj: true,
      approves: null,
      canEdit: true,
      canPublish: true,
    },
    {
      personId: "editor",
      id: "requester",
      name: "Ahmad Khalil",
      label: "Can save, can't publish",
      sarj: true,
      approves: null,
      canEdit: true,
      canPublish: false,
    },
    {
      personId: "view-only",
      id: "requester",
      name: "Ahmad Khalil",
      label: "View only",
      sarj: true,
      approves: null,
      canEdit: false,
      canPublish: false,
    },
  ],
  approval: [
    {
      personId: "editor",
      id: "requester",
      name: "Ahmad Khalil",
      label: "Ahmad Khalil, requester",
      sarj: true,
      approves: null,
      canEdit: true,
      canPublish: false,
    },
    {
      personId: "approver",
      id: "approver",
      name: "Omar Haddad",
      label: "Omar Haddad, approver",
      sarj: true,
      approves: APPROVERS,
      canEdit: true,
      canPublish: false,
    },
  ],
};

export type CaseId =
  | "normal"
  | "conflict"
  | "save-fails"
  | "history-fails"
  | "publish-fails"
  | "pending"
  | "rejected"
  | "send-fails"
  | "approve-fails";

export const CASES: Record<Mode, { id: CaseId; label: string }[]> = {
  direct: [
    { id: "normal", label: "Normal" },
    { id: "conflict", label: "Someone saves while you edit" },
    { id: "save-fails", label: "Save fails" },
    { id: "history-fails", label: "History fails to load" },
    { id: "publish-fails", label: "Publish fails" },
  ],
  approval: [
    { id: "normal", label: "Nothing requested yet" },
    { id: "pending", label: "Waiting for approval" },
    { id: "rejected", label: "Rejected" },
    { id: "send-fails", label: "Request fails to send" },
    { id: "approve-fails", label: "Approve fails" },
  ],
};

export const RIVAL: Omit<Version, "n" | "editedFrom" | "body"> = {
  author: "Nouf Al-Harbi",
  mine: false,
  at: "Today, 13:34",
  note: "Shorter tool failure line",
};

export function changesBetween(
  subject: Subject,
  live: number,
  version: number,
): Change[] {
  const before = subject.versions.find((item) => item.n === live);
  const after = subject.versions.find((item) => item.n === version);
  if (!before || !after) return [];
  return subject.fields
    .filter((field) => before.body[field.id] !== after.body[field.id])
    .map((field) => ({
      label: field.label,
      before: before.body[field.id],
      after: after.body[field.id],
    }));
}

const SUMMARY_V23 =
  "Callers hear phone numbers and IDs read in pairs instead of threes. When the agent can't help, it says so once and offers a transfer.";

export function summaryFor(version: number, live: number) {
  if (version === 23 && live === 21) return SUMMARY_V23;
  if (version < live)
    return `Every scenario goes back to the global prompt as it was in v${String(version)}, before the changes made since.`;
  return `Every scenario gets the global prompt as saved in v${String(version)}.`;
}

const MAIN_NOTE =
  "Callers kept mishearing national IDs read in threes, and two banks asked for a transfer offer instead of the agent repeating that it can't help.";

export function mainRequest(
  status: Status,
  decision: ApprovalRequest["decision"] = null,
): ApprovalRequest {
  return {
    id: "gp-23",
    item: GLOBAL_PROMPT.name,
    org: APPROVERS,
    version: 23,
    live: 21,
    by: "Ahmad Khalil",
    raised: "Today, 13:25",
    waiting: "40 minutes",
    note: MAIN_NOTE,
    summary: SUMMARY_V23,
    changes: changesBetween(GLOBAL_PROMPT, 21, 23),
    status,
    decision,
  };
}

export const REJECTION = {
  by: "Omar Haddad",
  at: "Today, 14:02",
  reason:
    "Pairs are right for IDs but wrong for phone numbers. Keep phone numbers in threes and send it again.",
} as const;

export const CONVERSATION = {
  scenario: "Branch visit survey",
  scenarioVersion: 12,
  globalVersion: 20,
  phoneNumber: "+966 55 012 4471",
  startedAt: "4 Nov, 13:48",
} as const;
