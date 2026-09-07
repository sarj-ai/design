import { defineCloudflareConfig } from "@opennextjs/cloudflare"

/**
 * Every route here is prerendered at build time and the only dynamic one is
 * `/api/mcp`, which is `force-dynamic` and caches nothing. That leaves no
 * incremental cache to put behind R2 or D1, so the defaults stand.
 *
 * Cache interception is off for the same reason it is off in the app: it only
 * pays when the worker can answer from a populated cache, and an all-static
 * site is already served from the asset binding.
 */
export default defineCloudflareConfig({
  enableCacheInterception: false,
})
