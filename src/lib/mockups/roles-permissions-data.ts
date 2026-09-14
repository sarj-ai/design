/**
 * Roles and the permissions behind them — DES-170 / DIS-15.
 *
 * The 39 permission strings are the platform's own, copied verbatim from
 * `webserver/auth/permissions.py`, in its order and its two blocks: the 21 an
 * organization's own people can hold, then the 18 the platform reserves. The
 * PRD's Table 3 spells some of them differently (`knowledge_base:write`,
 * `org_sip:config`, `calls:view:all_orgs`); those strings do not exist in the
 * codebase, and the PRD's own Q&A answers "reuse the existing taxonomy", so
 * this screen uses the enum.
 *
 * What is target state: the grants. Today `permissions_for_role()` hands the
 * same 21 to both `admin` and `user`, which is the whole problem — three roles
 * that resolve to two. The grants below are Phase 1's split.
 */

/** Frozen so a screenshot taken next month reads the same as today's. */
export const NOW = "2026-08-25T09:00:00.000Z"

export type PermissionId = string

export type Permission = {
  /** The platform's string, spelled exactly as the enum spells it. */
  id: PermissionId
  /** What it lets someone do, in the words the product uses. */
  label: string
}

/**
 * The two halves of the taxonomy, and the line the PRD organizes around: what
 * someone does inside their own organization, and what reaches past it.
 */
export const SECTIONS = [
  { id: "own-org", label: "Own organization" },
  { id: "platform", label: "Cross-organization and platform" },
] as const

export type SectionId = (typeof SECTIONS)[number]["id"]

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
  /** The role string the platform stores today, or null for a role Sarj added. */
  legacy: string | null
  people: number
  organizations: number
  /**
   * Super admin holds everything by definition — the PRD leaves it unchanged,
   * and a platform with no one who can fix a mistake is not a platform.
   */
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

/**
 * Phase 1's split, as Table 3 describes it in the strings the platform has.
 *
 * Call-only keeps every read in its own organization plus `calls:write`, which
 * is what a Yelo tester does all day. Org admin takes the whole own-org block
 * and pulls four permissions down from the platform side — people and
 * organization settings — bounded to the organization it belongs to. That pull
 * is the entire difference between an admin today and an admin after this.
 */
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

export type Diff = { granted: Permission[]; revoked: Permission[] }

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

export function permissionById(id: PermissionId): Permission | undefined {
  return ALL_PERMISSIONS.find((permission) => permission.id === id)
}

/**
 * The nav items each role should see, which is the other half of DIS-15: the
 * app hands `admin` a byte-identical menu to `superadmin` today, so an admin
 * gets eight items that bounce them back to the dashboard. A role's menu is
 * whatever its permissions can actually open.
 */
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
