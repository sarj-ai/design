import { createHash } from 'node:crypto';
import type { APIRoute } from 'astro';

import { sourceRevision } from '../lib/build';
import { designContract } from './api/v1/design.json';

const contract = `${JSON.stringify(designContract)}\n`;
const payload = { status: 'ok', schemaVersion: 1, commit: sourceRevision, contractSha256: createHash('sha256').update(contract).digest('hex') };

export const GET = (() => new Response(`${JSON.stringify(payload)}\n`, {
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
})) satisfies APIRoute;
