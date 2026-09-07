/** The Linear workspace every ticket on the index belongs to. */
const WORKSPACE = "sarj"

/**
 * A ticket's URL, from nothing but its identifier.
 *
 * Linear resolves `/issue/DES-161` on its own — the title slug the app puts in
 * the address bar is decoration — so the index never stores a second field
 * that goes stale the moment a ticket is renamed.
 */
export function linearIssueUrl(ticket: string) {
  return `https://linear.app/${WORKSPACE}/issue/${ticket}`
}
