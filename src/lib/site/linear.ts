const WORKSPACE = "sarj"

export function linearIssueUrl(ticket: string) {
  return `https://linear.app/${WORKSPACE}/issue/${ticket}`
}
