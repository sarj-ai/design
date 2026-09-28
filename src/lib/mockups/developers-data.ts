/**
 * The Developers page's mock data.
 *
 * The quickstart is the real public API, read from `sarj-ai/platform`
 * (`python/webserver/.../public_api`): `POST /calls` on
 * `https://platform-api.sarj.ai/api/v1`, a Bearer API key, and a body of
 * `phone_number`, `scenario_id`, `variables` and `language` (Arabic unless
 * set). Keys, webhook and variables carry the fields their product pages
 * already have — nothing new.
 */

export const DOCS_URL = "https://platform-docs.sarj.ai"
export const GETTING_STARTED_URL = `${DOCS_URL}/getting-started`
export const MCP_URL = `${DOCS_URL}/mcp-server`

export type QuickstartLanguage = "curl" | "javascript" | "python"

export const QUICKSTART_LABELS: Record<QuickstartLanguage, string> = {
  curl: "cURL",
  javascript: "JavaScript",
  python: "Python",
}

export const QUICKSTART: Record<QuickstartLanguage, string> = {
  curl: `curl https://platform-api.sarj.ai/api/v1/calls \\
  -H "Authorization: Bearer $SARJ_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone_number": "+966512345678",
    "scenario_id": "YOUR_SCENARIO_ID",
    "language": "ar",
    "variables": { "customer_name": "Layla" }
  }'`,
  javascript: `const response = await fetch("https://platform-api.sarj.ai/api/v1/calls", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.SARJ_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    phone_number: "+966512345678",
    scenario_id: "YOUR_SCENARIO_ID",
    language: "ar",
    variables: { customer_name: "Layla" },
  }),
})

const call = await response.json()`,
  python: `import os
import requests

response = requests.post(
    "https://platform-api.sarj.ai/api/v1/calls",
    headers={"Authorization": f"Bearer {os.environ['SARJ_API_KEY']}"},
    json={
        "phone_number": "+966512345678",
        "scenario_id": "YOUR_SCENARIO_ID",
        "language": "ar",
        "variables": {"customer_name": "Layla"},
    },
)

call = response.json()`,
}

export type ApiKey = { id: string; prefix: string; created: string }

export const API_KEYS: ApiKey[] = [
  { id: "k1", prefix: "sk_live_4f2a", created: "Sep 12, 2026" },
  { id: "k2", prefix: "sk_live_9c71", created: "Aug 03, 2026" },
]

export type Variable = {
  key: string
  value: string
  secret: boolean
  description: string
}

export const VARIABLES: Variable[] = [
  {
    key: "crm_base_url",
    value: "https://crm.example.com/api",
    secret: false,
    description: "Base address for the CRM lookup tool",
  },
  {
    key: "crm_token",
    value: "tok_3b9e71f0a2",
    secret: true,
    description: "Sent as the CRM lookup's bearer token",
  },
  {
    key: "support_hours",
    value: "Sun–Thu, 9:00–17:00",
    secret: false,
    description: "Read out when a caller asks for a human",
  },
]

export const WEBHOOK_URL = "https://hooks.example.com/sarj/call-complete"
