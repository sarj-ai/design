import assert from 'node:assert/strict';
import process from 'node:process';
import { URL } from 'node:url';

const source = new URL('/components/?source=legacy#tokens', 'https://docs-ui.sarj.ai');
const response = await globalThis.fetch(source, { redirect: 'manual', cache: 'no-store' });
assert.equal(response.status, 308);
assert.equal(response.headers.get('location'), 'https://design.sarj.ai/components/?source=legacy');
process.stdout.write('verified permanent legacy hostname redirect\n');
