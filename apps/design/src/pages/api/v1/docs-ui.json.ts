import type { APIRoute } from 'astro';

import { designContractBody } from './design.json';

/** @deprecated Use /api/v1/design.json. */
export const GET = (() => new Response(designContractBody, {
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
})) satisfies APIRoute;
