export type PermissionId = string

export type Permission = {
  id: PermissionId
  label: string
}

export const SECTIONS = [
  { id: "own-org", label: "Own organization" },
  { id: "platform", label: "Cross-organization and platform" },
] as const

type SectionId = (typeof SECTIONS)[number]["id"]

export const PERMISSIONS: Record<SectionId, Permission[]> = {
  "own-org": [
    {
      id: "scenarios:read",
      label: "View scenarios",
    },
    {
      id: "scenarios:write",
      label: "Create and edit scenarios",
    },
    {
      id: "knowledge_bases:read",
      label: "View knowledge bases",
    },
    {
      id: "knowledge_bases:write",
      label: "Create and edit knowledge bases",
    },
    {
      id: "agent_profiles:read",
      label: "View agent profiles",
    },
    {
      id: "agent_profiles:write",
      label: "Create and edit agent profiles",
    },
    {
      id: "calls:read",
      label: "View calls and transcripts",
    },
    {
      id: "calls:write",
      label: "Place a call",
    },
    {
      id: "batches:read",
      label: "View batch calls",
    },
    {
      id: "batches:write",
      label: "Create and run batch calls",
    },
    {
      id: "api_keys:read",
      label: "View API keys",
    },
    {
      id: "api_keys:write",
      label: "Create and revoke API keys",
    },
    {
      id: "org_variables:read",
      label: "View variables",
    },
    {
      id: "org_variables:write",
      label: "Create and edit variables",
    },
    {
      id: "public_api_calls:read",
      label: "Read calls through the public API",
    },
    {
      id: "public_api_calls:write",
      label: "Place calls through the public API",
    },
    {
      id: "messaging_sessions:read",
      label: "View messaging sessions",
    },
    {
      id: "messaging_sessions:write",
      label: "Send and end messaging sessions",
    },
    {
      id: "reports:read",
      label: "View reports",
    },
    {
      id: "settings:read",
      label: "View call settings",
    },
    {
      id: "organizations:read",
      label: "View own organization",
    },
  ],
  platform: [
    { id: "users:read", label: "View people" },
    {
      id: "users:write",
      label: "Add, remove and re-role people",
    },
    {
      id: "organizations:write",
      label: "Create and delete organizations",
    },
    {
      id: "organization_settings:read",
      label: "View an organization's settings",
    },
    {
      id: "organization_settings:write",
      label: "Change an organization's settings",
    },
    {
      id: "scenarios:transfer",
      label: "Move a scenario between organizations",
    },
    {
      id: "calls:manage",
      label: "Retry and re-run a call",
    },
    {
      id: "settings:write",
      label: "Edit global settings and the global prompt",
    },
    {
      id: "messaging_settings:read",
      label: "View messaging settings",
    },
    {
      id: "messaging_settings:write",
      label: "Edit messaging settings",
    },
    {
      id: "voices:read",
      label: "View the voice library",
    },
    {
      id: "voices:write",
      label: "Add and edit voices",
    },
    {
      id: "scenario_templates:read",
      label: "View scenario templates",
    },
    {
      id: "scenario_templates:write",
      label: "Create and edit scenario templates",
    },
    { id: "tasks:read", label: "View tasks" },
    {
      id: "tasks:write",
      label: "Create and close tasks",
    },
    {
      id: "flags:read",
      label: "View flagged calls",
    },
    {
      id: "call_flags:write",
      label: "Flag and unflag a call",
    },
  ],
}

export const ALL_PERMISSIONS: Permission[] = [
  ...PERMISSIONS["own-org"],
  ...PERMISSIONS.platform,
]

const ALL_IDS = ALL_PERMISSIONS.map((permission) => permission.id)
const OWN_ORG_IDS = PERMISSIONS["own-org"].map((permission) => permission.id)

export type Role = {
  id: string
  name: string
  legacy: string | null
  people: number
  organizations: number
  locked: boolean
}

export const ROLES: Role[] = [
  {
    id: "call-only",
    name: "Call-only",
    legacy: "user",
    people: 214,
    organizations: 17,
    locked: false,
  },
  {
    id: "org-admin",
    name: "Org admin",
    legacy: "admin",
    people: 63,
    organizations: 21,
    locked: false,
  },
  {
    id: "super-admin",
    name: "Super admin",
    legacy: "superadmin",
    people: 11,
    organizations: 0,
    locked: true,
  },
]

export const GRANTS: Record<string, PermissionId[]> = {
  "call-only": [
    "scenarios:read",
    "knowledge_bases:read",
    "agent_profiles:read",
    "calls:read",
    "calls:write",
    "batches:read",
    "public_api_calls:read",
    "messaging_sessions:read",
    "reports:read",
    "settings:read",
    "organizations:read",
  ],
  "org-admin": [
    ...OWN_ORG_IDS,
    "users:read",
    "users:write",
    "organization_settings:read",
    "organization_settings:write",
  ],
  "super-admin": ALL_IDS,
}

type Diff = { granted: Permission[]; revoked: Permission[] }

export function diffGrants(
  before: PermissionId[],
  after: PermissionId[],
): Diff {
  const had = new Set(before)
  const has = new Set(after)
  return {
    granted: ALL_PERMISSIONS.filter((p) => has.has(p.id) && !had.has(p.id)),
    revoked: ALL_PERMISSIONS.filter((p) => had.has(p.id) && !has.has(p.id)),
  }
}

export const HIDDEN_NAV: Record<string, string[]> = {
  "org-admin": [
    "Scenario Templates",
    "Global Prompts",
    "Voice Library",
    "Quality Dashboard",
    "Tasks",
    "Models",
    "Telephony",
    "Global Settings",
    "Messaging Settings",
  ],
  "super-admin": [],
}
