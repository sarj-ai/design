import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import process from 'node:process';
import { URL } from 'node:url';

const expectedCommit = process.env.EXPECTED_COMMIT;
assert.ok(expectedCommit, 'EXPECTED_COMMIT is required');
const base = new URL(process.env.DESIGN_BASE_URL ?? 'https://design.sarj.ai/');

async function verify() {
  const [healthResponse, contractResponse, legacyContractResponse, pageResponse, componentsResponse, robotsResponse, faviconResponse] = await Promise.all([
    response(`health.json?commit=${encodeURIComponent(expectedCommit)}`),
    response('api/v1/design.json'),
    response('api/v1/docs-ui.json'),
    response(''),
    response('components/'),
    response('robots.txt'),
    response('favicon.svg'),
  ]);
  for (const [name, candidate] of Object.entries({
    healthResponse,
    contractResponse,
    legacyContractResponse,
    pageResponse,
    componentsResponse,
    robotsResponse,
    faviconResponse,
  })) {
    assert.ok(candidate.ok, `${name} returned ${String(candidate.status)}`);
  }
  const health = await healthResponse.json();
  const contractText = await contractResponse.text();
  const legacyContractText = await legacyContractResponse.text();
  const contract = JSON.parse(contractText);
  const page = await pageResponse.text();
  const componentsPage = await componentsResponse.text();
  assert.equal(health.commit, expectedCommit);
  assert.equal(createHash('sha256').update(contractText).digest('hex'), health.contractSha256);
  assert.equal(legacyContractText, contractText, 'deprecated API alias must be byte-identical');
  assert.deepEqual(Object.keys(contract.components).sort(), ['Breadcrumbs', 'CodeComparison', 'PageAnchor', 'ReferencePage', 'RulePager']);
  assert.equal(contract.themeTokens.length, 6);
  for (const name of Object.keys(contract.components)) assert.match(componentsPage, new RegExp(`id="${name.toLowerCase()}"`, 'u'));
  for (const token of contract.themeTokens) assert.match(componentsPage, new RegExp(token.cssName, 'u'));
  for (const candidate of [page, componentsPage]) {
    assert.match(candidate, /alt="Sarj"/u);
    assert.match(candidate, /href="\/components\/"/u);
    assert.doesNotMatch(candidate, /site-search|pagefind|type="search"/iu);
  }
  assert.doesNotMatch(pageResponse.headers.get('content-security-policy') ?? '', /wasm-unsafe-eval/u);
  assert.match(pageResponse.headers.get('content-security-policy') ?? '', /default-src 'none'/u);
  assert.match(
    pageResponse.headers.get('content-security-policy') ?? '',
    /https:\/\/static\.cloudflareinsights\.com(?:\s|;)/u,
  );
  assert.equal(pageResponse.headers.get('x-robots-tag'), 'all');
  assert.equal(componentsResponse.headers.get('x-robots-tag'), 'all');
  assert.equal(pageResponse.headers.get('cross-origin-resource-policy'), 'same-origin');
  assert.equal(contractResponse.headers.get('access-control-allow-origin'), '*');
  assert.equal(legacyContractResponse.headers.get('access-control-allow-origin'), '*');
  assert.match(await robotsResponse.text(), /^User-agent: \*\nAllow: \/$/mu);
  assert.equal(faviconResponse.headers.get('content-type'), 'image/svg+xml');
  assert.equal((await response('pagefind/pagefind.js')).status, 404);
  assert.equal((await response(`definitely-not-a-page-${expectedCommit}/`)).status, 404);
}

async function response(path, init) {
  return globalThis.fetch(new URL(path, base), { cache: 'no-store', ...init });
}

let lastError;
for (let attempt = 1; attempt <= 20; attempt += 1) {
  try {
    await verify();
    process.stdout.write(`verified deployed Sarj Design at ${expectedCommit}\n`);
    lastError = undefined;
    break;
  } catch (error) {
    lastError = error;
    if (attempt < 20) await new Promise((resolve) => globalThis.setTimeout(resolve, 15_000));
  }
}
if (lastError !== undefined) throw lastError;
