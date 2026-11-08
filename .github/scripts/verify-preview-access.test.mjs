import assert from "node:assert/strict";
import test from "node:test";

import {
  verifyActivePreviewAccess,
  verifyPreviewAccess,
} from "./verify-preview-access.mjs";

const url = "https://12345678-design-lab.nasr-be6.workers.dev";
const login =
  "https://main-bulbul-pages.cloudflareaccess.com/cdn-cgi/access/login/design";

test("requires the Sarj Access redirect without sending a token to the preview", async () => {
  const request = async (target, options) => {
    assert.equal(String(target), `${url}/`);
    assert.equal(options.method, "HEAD");
    assert.equal(options.redirect, "manual");
    assert.equal(options.headers, undefined);
    assert.ok(options.signal instanceof AbortSignal);
    return new Response(null, { status: 302, headers: { location: login } });
  };
  assert.deepEqual(await verifyPreviewAccess(url, request), {
    host: "12345678-design-lab.nasr-be6.workers.dev",
    accessProtected: true,
  });
});

test("rejects a public preview without reading or returning its body", async () => {
  await assert.rejects(
    verifyPreviewAccess(url, async () => new Response("private content")),
    /must require Access sign-in/u,
  );
});

test("does not accept a missing preview as proof of protection", async () => {
  await assert.rejects(
    verifyPreviewAccess(url, async () => new Response(null, { status: 404 })),
    /must require Access sign-in/u,
  );
});

test("rejects a redirect to another identity provider", async () => {
  await assert.rejects(
    verifyPreviewAccess(
      url,
      async () =>
        new Response(null, {
          status: 302,
          headers: { location: "https://example.com/login" },
        }),
    ),
    /must use Sarj Access/u,
  );
});

test("rejects unrelated hosts before making a request", async () => {
  let calls = 0;
  await assert.rejects(
    verifyPreviewAccess("https://example.com", async () => {
      calls++;
      return new Response(null);
    }),
    /must belong to the Design Worker/u,
  );
  assert.equal(calls, 0);
});

const input = { account: "a".repeat(32), token: "fixture-token" };

test("checks all serving version URLs and sends authorization only to the management API", async () => {
  const seen = [];
  const request = async (target, options) => {
    seen.push(String(target));
    if (seen.length === 1) {
      assert.equal(new URL(target).hostname, "api.cloudflare.com");
      assert.equal(options.headers.Authorization, "Bearer fixture-token");
      return Response.json({
        success: true,
        result: {
          deployments: [
            {
              versions: [
                {
                  version_id: "12345678-1234-1234-1234-123456789abc",
                  percentage: 60,
                },
                {
                  version_id: "87654321-1234-1234-1234-123456789abc",
                  percentage: 40,
                },
                {
                  version_id: "00000000-1234-1234-1234-123456789abc",
                  percentage: 0,
                },
              ],
            },
          ],
        },
      });
    }
    assert.equal(options.headers, undefined);
    return new Response(null, { status: 302, headers: { location: login } });
  };
  const result = await verifyActivePreviewAccess(input, request);
  assert.equal(result.length, 2);
  assert.deepEqual(seen.slice(1).sort(), [
    "https://12345678-design-lab.nasr-be6.workers.dev/",
    "https://87654321-design-lab.nasr-be6.workers.dev/",
  ]);
});

test("rejects denied management access without returning response content", async () => {
  await assert.rejects(
    verifyActivePreviewAccess(
      input,
      async () => new Response("private details", { status: 403 }),
    ),
    /Deployment read failed: HTTP 403/u,
  );
});

test("rejects an empty serving set", async () => {
  await assert.rejects(
    verifyActivePreviewAccess(input, async () =>
      Response.json({
        success: true,
        result: {
          deployments: [
            {
              versions: [
                {
                  version_id: "12345678-1234-1234-1234-123456789abc",
                  percentage: 0,
                },
              ],
            },
          ],
        },
      }),
    ),
    /No serving versions/u,
  );
});
