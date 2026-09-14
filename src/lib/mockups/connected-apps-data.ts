/**
 * Connected apps and their access tokens — DES-146 / DIS-24.
 *
 * The permission strings, the 8-character prefix, the 43-character secret and
 * the five-token ceiling are taken from the platform as it is built today. The
 * records they hang off — a connected app, a token with a name, an expiry, a
 * last-used stamp — are the target state DIS-24 describes and the API does not
 * expose yet.
 */

/** Frozen so a screenshot taken next month reads the same as today's. */
export const NOW = "2026-08-19T11:00:00.000Z"

/** The platform's own ceiling on how many tokens can exist at once. */
export const TOKEN_CAP = 5

/** How close to expiry a token has to be before the list says so unprompted. */
export const NEAR_EXPIRY_DAYS = 14

/**
 * The permissions an organization's own token can carry.
 *
 * These are the platform's strings, exactly as it spells them — the tooltip on
 * every row shows them unedited, because a scope a customer cannot quote back
 * is a scope they cannot debug against.
 */
export type Permission =
  | "agent_profiles:read"
  | "agent_profiles:write"
  | "api_keys:read"
  | "api_keys:write"
  | "batches:read"
  | "batches:write"
  | "calls:read"
  | "calls:write"
  | "knowledge_bases:read"
  | "knowledge_bases:write"
  | "messaging_sessions:read"
  | "messaging_sessions:write"
  | "org_variables:read"
  | "org_variables:write"
  | "organizations:read"
  | "public_api_calls:read"
  | "public_api_calls:write"
  | "reports:read"
  | "scenarios:read"
  | "scenarios:write"
  | "settings:read"

/**
 * One row of the permission picker.
 *
 * Grouped by resource rather than listed flat: twenty-one checkboxes in a
 * column is a wall, and the read/write pair is the only axis anyone actually
 * reasons about. `write: null` is a resource the platform exposes read-only —
 * the cell stays empty rather than the row collapsing, so the two checkbox
 * columns hold one vertical line.
 */
export type ScopeGroup = {
  /** What the product calls this resource, not what the table is called. */
  label: string
  read: Permission
  write: Permission | null
}

export const SCOPE_GROUPS: ScopeGroup[] = [
  { label: "Scenarios", read: "scenarios:read", write: "scenarios:write" },
  {
    label: "Knowledge bases",
    read: "knowledge_bases:read",
    write: "knowledge_bases:write",
  },
  {
    label: "Personas",
    read: "agent_profiles:read",
    write: "agent_profiles:write",
  },
  { label: "Calls", read: "calls:read", write: "calls:write" },
  { label: "Batch calls", read: "batches:read", write: "batches:write" },
  { label: "Access tokens", read: "api_keys:read", write: "api_keys:write" },
  {
    label: "Variables",
    read: "org_variables:read",
    write: "org_variables:write",
  },
  {
    label: "Messaging",
    read: "messaging_sessions:read",
    write: "messaging_sessions:write",
  },
  {
    label: "Public API calls",
    read: "public_api_calls:read",
    write: "public_api_calls:write",
  },
  { label: "Reports", read: "reports:read", write: null },
  { label: "Organization", read: "organizations:read", write: null },
  { label: "Settings", read: "settings:read", write: null },
]

/** Every read permission — the "Read-only" preset. */
export const READ_ONLY_SCOPES: Permission[] = SCOPE_GROUPS.map(
  (group) => group.read,
)

/** Every permission there is — the "Full access" preset. */
export const ALL_SCOPES: Permission[] = SCOPE_GROUPS.flatMap((group) =>
  group.write ? [group.read, group.write] : [group.read],
)

/** One of the organization's own systems that calls the platform. */
export type ConnectedApp = {
  id: string
  name: string
  description: string
  createdAt: string
  createdBy: string
}

export type Token = {
  id: string
  appId: string
  name: string
  /** The first eight characters — all the platform keeps of the secret. */
  prefix: string
  scopes: Permission[]
  createdAt: string
  createdBy: string
  /** `null` is a token that runs until someone revokes it. */
  expiresAt: string | null
  lastUsedAt: string | null
  revokedAt: string | null
}

export const CONNECTED_APPS: ConnectedApp[] = [
  {
    id: "app-order-sync",
    name: "Order status sync",
    description: "Pushes call outcomes into our fulfilment system.",
    createdAt: "2026-03-12T09:20:00.000Z",
    createdBy: "Nawaf Al-Harbi",
  },
  {
    id: "app-cc-bridge",
    name: "Contact-centre bridge",
    description: "Hands a call to our own agents when the caller asks.",
    createdAt: "2026-08-02T13:05:00.000Z",
    createdBy: "Sara Qureshi",
  },
  {
    id: "app-reporting",
    name: "Nightly reporting export",
    description: "Pulls yesterday's calls and reports at 02:00.",
    createdAt: "2026-01-18T06:40:00.000Z",
    createdBy: "Mishal Al-Dossari",
  },
]

export const TOKENS: Token[] = [
  /* Order status sync — three live tokens and one already revoked, so the
     tombstone row is on screen without anyone having to press anything. */
  {
    id: "tok-order-prod",
    appId: "app-order-sync",
    name: "Production",
    prefix: "Hq7dR2mK",
    scopes: ALL_SCOPES,
    createdAt: "2026-03-12T09:24:00.000Z",
    createdBy: "Nawaf Al-Harbi",
    expiresAt: "2027-03-12T09:24:00.000Z",
    lastUsedAt: "2026-08-19T09:00:00.000Z",
    revokedAt: null,
  },
  {
    id: "tok-order-staging",
    appId: "app-order-sync",
    name: "Staging",
    prefix: "v3_TnQ8b",
    scopes: [
      "calls:read",
      "calls:write",
      "scenarios:read",
      "knowledge_bases:read",
      "agent_profiles:read",
      "reports:read",
      "settings:read",
    ],
    createdAt: "2026-05-28T11:00:00.000Z",
    createdBy: "Sara Qureshi",
    expiresAt: "2026-08-28T11:00:00.000Z",
    lastUsedAt: "2026-08-14T22:40:00.000Z",
    revokedAt: null,
  },
  {
    id: "tok-order-laptop",
    appId: "app-order-sync",
    name: "Laptop test key",
    prefix: "Zr-K91aP",
    scopes: READ_ONLY_SCOPES,
    createdAt: "2026-07-09T15:30:00.000Z",
    createdBy: "Nawaf Al-Harbi",
    expiresAt: null,
    lastUsedAt: null,
    revokedAt: null,
  },
  {
    id: "tok-order-legacy",
    appId: "app-order-sync",
    name: "Old prod key",
    prefix: "Lm4XcW0t",
    scopes: ALL_SCOPES,
    createdAt: "2026-03-12T09:22:00.000Z",
    createdBy: "Nawaf Al-Harbi",
    expiresAt: null,
    lastUsedAt: "2026-06-02T08:10:00.000Z",
    revokedAt: "2026-06-02T08:45:00.000Z",
  },

  /* Nightly reporting export — five live tokens, which is the ceiling, and one
     of them has already expired. Revoking the dead one is the way back under
     the cap, which is why an expired row keeps its Revoke action. */
  {
    id: "tok-report-prod",
    appId: "app-reporting",
    name: "Reporting — prod",
    prefix: "8pNvB2hJ",
    scopes: READ_ONLY_SCOPES,
    createdAt: "2026-01-18T06:44:00.000Z",
    createdBy: "Mishal Al-Dossari",
    expiresAt: "2027-01-18T06:44:00.000Z",
    lastUsedAt: "2026-08-19T02:00:00.000Z",
    revokedAt: null,
  },
  {
    id: "tok-report-dr",
    appId: "app-reporting",
    name: "Reporting — DR site",
    prefix: "Ct6y_QsE",
    scopes: READ_ONLY_SCOPES,
    createdAt: "2026-01-18T06:46:00.000Z",
    createdBy: "Mishal Al-Dossari",
    expiresAt: "2027-01-18T06:46:00.000Z",
    lastUsedAt: "2026-08-15T02:00:00.000Z",
    revokedAt: null,
  },
  {
    id: "tok-report-bi",
    appId: "app-reporting",
    name: "BI warehouse",
    prefix: "aW9k3RdU",
    scopes: ["reports:read", "calls:read", "batches:read"],
    createdAt: "2026-04-02T10:15:00.000Z",
    createdBy: "Sara Qureshi",
    expiresAt: null,
    lastUsedAt: "2026-08-18T02:00:00.000Z",
    revokedAt: null,
  },
  {
    id: "tok-report-analyst",
    appId: "app-reporting",
    name: "Analyst laptop",
    prefix: "Y2mHs-Lx",
    scopes: READ_ONLY_SCOPES,
    createdAt: "2026-04-30T12:00:00.000Z",
    createdBy: "Mishal Al-Dossari",
    expiresAt: "2026-07-30T12:00:00.000Z",
    lastUsedAt: "2026-07-28T09:12:00.000Z",
    revokedAt: null,
  },
  {
    id: "tok-report-exporter",
    appId: "app-reporting",
    name: "Legacy exporter",
    prefix: "Qb7ZtN4v",
    scopes: READ_ONLY_SCOPES,
    createdAt: "2026-02-11T08:00:00.000Z",
    createdBy: "Mishal Al-Dossari",
    expiresAt: null,
    lastUsedAt: null,
    revokedAt: null,
  },
]

/**
 * A token's secret, the way the platform mints one: 32 random bytes in URL-safe
 * base64, which lands at 43 characters. No vendor prefix — no `sk-`, no
 * `sarj_`. Showing one here would teach a reader to look for a marker that
 * never arrives.
 */
const SECRET_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

export function mintSecret(): string {
  let secret = ""
  for (let index = 0; index < 43; index += 1) {
    secret += SECRET_ALPHABET.charAt(
      Math.floor(Math.random() * SECRET_ALPHABET.length),
    )
  }
  return secret
}

/** What survives on the server once the secret is hashed away. */
export function prefixOf(secret: string): string {
  return secret.slice(0, 8)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function daysUntil(iso: string): number {
  const millis = new Date(iso).getTime() - new Date(NOW).getTime()
  return Math.ceil(millis / 86_400_000)
}

/** "2 hours ago" while that is still the useful unit, then a date. */
export function relativeSince(iso: string | null): string {
  if (!iso) return "Never used"

  const hours = Math.floor(
    (new Date(NOW).getTime() - new Date(iso).getTime()) / 3_600_000,
  )
  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`
  return formatDate(iso)
}

export type TokenStatus = "active" | "expired" | "revoked"

/**
 * Derived, never stored. A revoked token that had also expired is still
 * revoked — the deliberate act outranks the clock.
 */
export function tokenStatus(token: Token): TokenStatus {
  if (token.revokedAt) return "revoked"
  if (token.expiresAt && daysUntil(token.expiresAt) <= 0) return "expired"
  return "active"
}

function sameScopes(scopes: Permission[], preset: Permission[]): boolean {
  return (
    scopes.length === preset.length &&
    preset.every((permission) => scopes.includes(permission))
  )
}

/** "Read-only", "Full access", or the count — the list never spells out 21. */
export function scopeSummary(scopes: Permission[]): string {
  if (sameScopes(scopes, ALL_SCOPES)) return "Full access"
  if (sameScopes(scopes, READ_ONLY_SCOPES)) return "Read-only"
  return `Custom · ${scopes.length}`
}

/** Tokens that still take up one of the organization's five slots. */
export function liveTokens(tokens: Token[], appId: string): Token[] {
  return tokens.filter((token) => token.appId === appId && !token.revokedAt)
}
