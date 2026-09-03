import { componentCatalog, themeTokenCatalog } from '@sarj/design/catalog';
import type { APIRoute } from 'astro';

export const designContract = Object.freeze({ schemaVersion: 1, components: componentCatalog, themeTokens: themeTokenCatalog });
export const designContractBody = `${JSON.stringify(designContract)}\n`;

export const GET = (() => new Response(designContractBody, {
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
})) satisfies APIRoute;
