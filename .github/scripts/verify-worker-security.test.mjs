import assert from "node:assert/strict";
import test from "node:test";

import { verifyWorkerSecurity } from "./verify-worker-security.mjs";

const input = {
  accountId: "a".repeat(32),
  worker: "demo-test",
  token: "private-fixture",
  previewsDisabled: true,
};

/** @param {unknown} observability */
function fixture(observability, previewsEnabled = false, status = 200) {
  /** @type {{url: string, options: RequestInit | undefined}[]} */
  const requests = [];
  /** @type {typeof fetch} */
  const request = async (url, options) => {
    requests.push({ url: String(url), options });
    return Response.json(
      {
        success: status === 200,
        result: String(url).endsWith("/script-settings")
          ? { observability }
          : { previews_enabled: previewsEnabled },
      },
      { status },
    );
  };
  return {
    requests,
    request,
  };
}

test("qualified redaction and disabled version URLs pass using only bounded authenticated reads", async () => {
  const api = fixture({ enabled: true, redact_query_string: true });
  assert.deepEqual(await verifyWorkerSecurity(input, api.request), {
    worker: input.worker,
    verified: true,
  });
  assert.equal(api.requests.length, 2);
  for (const { options } of api.requests) {
    assert.ok(options);
    assert.equal(options.method, "GET");
    assert.equal(
      new Headers(options.headers).get("Authorization"),
      `Bearer ${input.token}`,
    );
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(options.body, undefined);
  }
});

for (const redaction of [undefined, false]) {
  test(`a deployment that loses query redaction (${String(redaction)}) fails qualification`, async () => {
    const api = fixture({ enabled: true, redact_query_string: redaction });
    await assert.rejects(
      verifyWorkerSecurity(input, api.request),
      /must redact/u,
    );
  });
}

test("enabled nested traces cannot bypass redaction while top-level logging is false", async () => {
  const api = fixture({
    enabled: false,
    traces: { enabled: true },
    redact_query_string: false,
  });
  await assert.rejects(
    verifyWorkerSecurity(input, api.request),
    /must redact/u,
  );
});

test("a deployment that re-enables version URLs fails the explicit entrypoint policy", async () => {
  const api = fixture({ enabled: true, redact_query_string: true }, true);
  await assert.rejects(
    verifyWorkerSecurity(input, api.request),
    /disable version URLs/u,
  );
});

test("a previously approved version-URL exception is preserved unless explicitly prohibited", async () => {
  const api = fixture({ enabled: true, redact_query_string: true }, true);
  await verifyWorkerSecurity(
    { ...input, previewsDisabled: false },
    api.request,
  );
});

test("permission denial fails closed without returning provider response bodies or credentials", async () => {
  const api = fixture({}, false, 403);
  await assert.rejects(verifyWorkerSecurity(input, api.request), (error) => {
    assert.ok(error instanceof Error);
    assert.match(error.message, /HTTP 403/u);
    assert.ok(!error.message.includes(input.token));
    return true;
  });
});

test("missing credentials stop before any request", async () => {
  const api = fixture({});
  await assert.rejects(
    verifyWorkerSecurity({ ...input, token: "" }, api.request),
  );
  assert.equal(api.requests.length, 0);
});

test("missing observability settings cannot be mistaken for a secure deployment", async () => {
  const api = fixture(undefined);
  await assert.rejects(
    verifyWorkerSecurity(input, api.request),
    /must redact/u,
  );
});
