export type Tier = "basic" | "advanced";

export interface NumberSetting {
  id: string;
  label: string;
  tier: Tier;
  unit: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  hint: string;
  source: string;
}

export type GroupId = "transfer" | "digits" | "ivr" | "cues" | "knowledge";

export interface SettingGroup {
  id: GroupId;
  title: string;
  description: string;
  settings: NumberSetting[];
}

export const SCENARIO = {
  name: "Clinic appointment reminders",
  status: "Live",
  createdAt: "Oct 14, 2026",
  languages: ["English", "Arabic"],
} as const;

export const GROUPS: Record<GroupId, SettingGroup> = {
  transfer: {
    id: "transfer",
    title: "Transfer to a human agent",
    description: "Hand the caller to a person when they ask for one.",
    settings: [
      {
        id: "transfer.ringTimeout",
        label: "Ring for",
        tier: "basic",
        unit: "s",
        defaultValue: 80,
        min: 10,
        max: 80,
        step: 5,
        hint: "How long the human agent's phone rings before the transfer counts as unanswered.",
        source:
          "python/common/sarj/plt/common/settings.py:610 (120 s) capped by python/agent/sarj/plt/agent/transfer_strategies.py:70 (80 s)",
      },
    ],
  },
  digits: {
    id: "digits",
    title: "Collect digits",
    description: "Ask the caller to type a number on their keypad.",
    settings: [
      {
        id: "digits.maxAttempts",
        label: "Keypad attempts per call",
        tier: "advanced",
        unit: "",
        defaultValue: 4,
        min: 1,
        max: 10,
        step: 1,
        hint: "After this many keypad requests in one call, the agent stops asking and carries on without the number.",
        source: "python/agent/sarj/plt/agent/collect_via_dtmf_tool.py:105",
      },
      {
        id: "digits.repromptAfter",
        label: "Remind to use the keypad after",
        tier: "advanced",
        unit: "spoken turns",
        defaultValue: 2,
        min: 1,
        max: 5,
        step: 1,
        hint: "If the caller keeps talking instead of typing, the agent repeats the keypad instruction once after this many turns.",
        source: "python/agent/sarj/plt/agent/collect_via_dtmf_tool.py:106",
      },
    ],
  },
  ivr: {
    id: "ivr",
    title: "IVR navigation",
    description: "Press keys to get through a phone menu on outbound calls.",
    settings: [
      {
        id: "ivr.interDigitDelay",
        label: "Pause between keypresses",
        tier: "advanced",
        unit: "s",
        defaultValue: 0.1,
        min: 0.1,
        max: 2,
        step: 0.1,
        hint: "The gap between keys when the agent sends more than one. Some phone menus drop keys sent too quickly.",
        source: "python/agent/sarj/plt/agent/ivr_navigation.py:25",
      },
    ],
  },
  cues: {
    id: "cues",
    title: "While a tool runs",
    description: "What the caller hears while the agent waits on any tool.",
    settings: [
      {
        id: "cues.firstAfter",
        label: "First cue after",
        tier: "basic",
        unit: "s",
        defaultValue: 1.5,
        min: 0.5,
        max: 5,
        step: 0.5,
        hint: "How long the line stays quiet before the agent says something like “one moment”.",
        source: "python/agent/sarj/plt/agent/tool_cue_playback.py:37",
      },
      {
        id: "cues.maxPerTurn",
        label: "Cues per turn",
        tier: "advanced",
        unit: "",
        defaultValue: 4,
        min: 1,
        max: 8,
        step: 1,
        hint: "The most waiting cues the agent plays in one turn, however long the tool takes.",
        source: "python/agent/sarj/plt/agent/tool_cue_sequence.py:33",
      },
      {
        id: "cues.gapMin",
        label: "Shortest gap between cues",
        tier: "advanced",
        unit: "s",
        defaultValue: 3.5,
        min: 1,
        max: 10,
        step: 0.5,
        hint: "Follow-up cues are spaced at a random gap between the shortest and longest values.",
        source: "python/agent/sarj/plt/agent/tool_cue_sequence.py:34",
      },
      {
        id: "cues.gapMax",
        label: "Longest gap between cues",
        tier: "advanced",
        unit: "s",
        defaultValue: 5,
        min: 1,
        max: 10,
        step: 0.5,
        hint: "Follow-up cues are spaced at a random gap between the shortest and longest values.",
        source: "python/agent/sarj/plt/agent/tool_cue_sequence.py:35",
      },
    ],
  },
  knowledge: {
    id: "knowledge",
    title: "Knowledge base search",
    description: "How much of the knowledge base the agent reads per question.",
    settings: [
      {
        id: "knowledge.wholeBaseLimit",
        label: "Read the whole base up to",
        tier: "advanced",
        unit: "tokens",
        defaultValue: 20000,
        min: 1000,
        max: 20000,
        step: 1000,
        hint: "At or below this size the agent reads every document. Above it, the agent reads only the best-matching passages.",
        source:
          "python/common/sarj/plt/common/knowledge_base/constants.py:7-9 (read via settings.py:270, env KB_WHOLE_KB_MAX_TOKENS)",
      },
      {
        id: "knowledge.passages",
        label: "Passages per search",
        tier: "advanced",
        unit: "",
        defaultValue: 12,
        min: 1,
        max: 30,
        step: 1,
        hint: "How many passages the agent reads when the base is too large to read whole.",
        source:
          "python/common/sarj/plt/common/knowledge_base/chunk_corpus.py:19",
      },
    ],
  },
};

export interface ToolRow {
  slug: string;
  label: string;
  summary: string;
  group: GroupId | null;
}

export const TOOLS: readonly ToolRow[] = [
  {
    slug: "transfer-to-human",
    label: "Transfer to a human agent",
    summary: "Front desk · +966 11 555 0142",
    group: "transfer",
  },
  {
    slug: "collect-digits",
    label: "Collect digits",
    summary: "National ID · 10 digits",
    group: "digits",
  },
  {
    slug: "ivr-navigation",
    label: "IVR navigation",
    summary: "Cooldown 1 s",
    group: "ivr",
  },
  {
    slug: "end-call",
    label: "End the call",
    summary: "2 end conditions",
    group: null,
  },
];

export interface PromptSection {
  id: string;
  name: string;
  languages: string[];
}

export const PROMPT_SECTIONS: readonly PromptSection[] = [
  {
    id: "identity",
    name: "Identity and voice behavior",
    languages: ["English", "Arabic"],
  },
  {
    id: "dialect",
    name: "Language and dialect",
    languages: ["English", "Arabic"],
  },
  { id: "speech", name: "Speech patterns", languages: ["English", "Arabic"] },
  {
    id: "numbers",
    name: "Number formatting",
    languages: ["English", "Arabic"],
  },
  { id: "issues", name: "Issue handling", languages: ["English", "Arabic"] },
  {
    id: "phrases",
    name: "Auto-handled phrases",
    languages: ["English", "Arabic"],
  },
  { id: "guardrails", name: "Guardrails", languages: ["English", "Arabic"] },
  {
    id: "pronunciation",
    name: "Pronunciation and formatting",
    languages: ["English", "Arabic"],
  },
  { id: "names", name: "Name pronunciation", languages: ["Arabic"] },
];

export type Overrides = Record<string, number>;
export type ExcludedSections = string[];

export interface Draft {
  overrides: Overrides;
  excluded: ExcludedSections;
}

export const SAVED: Draft = {
  overrides: { "transfer.ringTimeout": 45 },
  excluded: [],
};

export const settingById: Readonly<Record<string, NumberSetting>> =
  Object.fromEntries(
    Object.values(GROUPS).flatMap((group) =>
      group.settings.map((setting): [string, NumberSetting] => [
        setting.id,
        setting,
      ]),
    ),
  );

export function valueOf(overrides: Overrides, setting: NumberSetting) {
  return overrides[setting.id] ?? setting.defaultValue;
}

export function format(setting: NumberSetting, value: number) {
  const number = value.toLocaleString("en-US");
  if (!setting.unit) return number;
  return setting.unit === "s" ? `${number} s` : `${number} ${setting.unit}`;
}

export function changedIn(group: SettingGroup, overrides: Overrides) {
  return group.settings.filter((setting) =>
    Object.hasOwn(overrides, setting.id),
  ).length;
}

export function groupSummary(id: GroupId, overrides: Overrides) {
  const read = (settingId: string) => {
    const setting = settingById[settingId];
    return format(setting, valueOf(overrides, setting));
  };
  switch (id) {
    case "transfer":
      return `Rings for ${read("transfer.ringTimeout")}`;
    case "digits":
      return `${read("digits.maxAttempts")} keypad attempts per call`;
    case "ivr":
      return `${read("ivr.interDigitDelay")} between keypresses`;
    case "cues":
      return `First cue after ${read("cues.firstAfter")} · up to ${read("cues.maxPerTurn")} per turn`;
    case "knowledge":
      return `Whole base up to ${read("knowledge.wholeBaseLimit")} · ${read("knowledge.passages")} passages otherwise`;
  }
}

export function countChanges(saved: Draft, draft: Draft) {
  const ids = new Set([
    ...Object.keys(saved.overrides),
    ...Object.keys(draft.overrides),
  ]);
  let count = 0;
  for (const id of ids)
    if (saved.overrides[id] !== draft.overrides[id]) count += 1;
  const sections = new Set([...saved.excluded, ...draft.excluded]);
  for (const id of sections)
    if (saved.excluded.includes(id) !== draft.excluded.includes(id)) count += 1;
  return count;
}
