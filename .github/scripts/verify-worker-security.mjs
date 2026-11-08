import assert from "node:assert/strict";
import { resolve } from "node:path";

/**
 * Verify deployed settings without changing configuration or printing API bodies.
 * @param {{accountId: string, worker: string, token: string, previewsDisabled?: boolean}} input
 * @param {typeof fetch} request
 */
export async function verifyWorkerSecurity(input, request = fetch) {
  assert.match(
    input.accountId,
    /^[a-f\d]{32}$/iu,
    "A Cloudflare account ID is required",
  );
  assert.match(input.worker, /^[\w-]+$/u, "A Worker name is required");
  assert.ok(input.token, "CLOUDFLARE_API_TOKEN is required");
  const base = `https://api.cloudflare.com/client/v4/accounts/${input.accountId}/workers/scripts/${input.worker}`;
  const [settings, subdomain] = await Promise.all(
    ["script-settings", "subdomain"].map(async (endpoint) => {
      const response = await request(`${base}/${endpoint}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${input.token}` },
        signal: AbortSignal.timeout(15_000),
      });
      assert.ok(
        response.ok,
        `Worker security read failed: ${endpoint} HTTP ${response.status}`,
      );
      const envelope = await response.json();
      assert.equal(
        envelope.success,
        true,
        `Worker security read failed: ${endpoint}`,
      );
      assert.ok(envelope.result, `Missing Worker security result: ${endpoint}`);
      return envelope.result;
    }),
  );
  assert.equal(
    settings.observability?.["redact_query_string"],
    true,
    "Deployed Worker must redact request URL query strings",
  );
  if (input.previewsDisabled) {
    assert.equal(
      subdomain["previews_enabled"],
      false,
      "Deployed Worker must disable version URLs",
    );
  }
  return { worker: input.worker, verified: true };
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  const [worker, option] = process.argv.slice(2);
  assert.ok(
    worker,
    "Usage: verify-worker-security.mjs WORKER [--previews-disabled]",
  );
  assert.ok(
    option === undefined || option === "--previews-disabled",
    "Unknown Worker security option",
  );
  const result = await verifyWorkerSecurity({
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
    worker,
    token: process.env.CLOUDFLARE_API_TOKEN ?? "",
    previewsDisabled: option === "--previews-disabled",
  });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}
