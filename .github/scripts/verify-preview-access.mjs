import assert from "node:assert/strict"
import { resolve } from "node:path"
import process from "node:process"

export async function verifyPreviewAccess(value, request = fetch) {
  const url = new URL(value)
  assert.equal(url.protocol, "https:", "Preview must use HTTPS")
  assert.match(
    url.hostname,
    /^[a-z0-9-]+-design-lab\.nasr-be6\.workers\.dev$/u,
    "Preview must belong to the Design Worker",
  )
  assert.equal(url.username + url.password + url.search + url.hash, "")
  assert.equal(url.pathname, "/")
  const response = await request(url, {
    method: "HEAD",
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  })
  assert.equal(response.status, 302, "Preview must require Access sign-in")
  const location = new URL(response.headers.get("location") ?? "", url)
  assert.equal(
    location.hostname,
    "main-bulbul-pages.cloudflareaccess.com",
    "Preview must use Sarj Access",
  )
  assert.ok(location.pathname.startsWith("/cdn-cgi/access/login/"))
  return { host: url.hostname, accessProtected: true }
}

export async function verifyActivePreviewAccess(
  { account, token },
  request = fetch,
) {
  assert.match(account, /^[a-f\d]{32}$/iu)
  assert.ok(token, "CLOUDFLARE_API_TOKEN is required")
  const response = await request(
    `https://api.cloudflare.com/client/v4/accounts/${account}/workers/scripts/design-lab/deployments`,
    {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15_000),
    },
  )
  assert.ok(response.ok, `Deployment read failed: HTTP ${response.status}`)
  const envelope = await response.json()
  assert.equal(envelope.success, true)
  const versions = envelope.result?.deployments?.[0]?.versions
  assert.ok(Array.isArray(versions) && versions.length > 0)
  const serving = versions.filter((version) => version.percentage > 0)
  assert.ok(serving.length > 0, "No serving versions were returned")
  return Promise.all(
    serving.map((version) => {
      assert.match(
        version.version_id,
        /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/iu,
      )
      return verifyPreviewAccess(
        `https://${version.version_id.slice(0, 8)}-design-lab.nasr-be6.workers.dev`,
        request,
      )
    }),
  )
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  const value = process.argv[2]
  assert.ok(value, "Usage: verify-preview-access.mjs URL | --active")
  const result =
    value === "--active"
      ? await verifyActivePreviewAccess({
          account: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
          token: process.env.CLOUDFLARE_API_TOKEN ?? "",
        })
      : await verifyPreviewAccess(value)
  process.stdout.write(`${JSON.stringify(result)}\n`)
}
