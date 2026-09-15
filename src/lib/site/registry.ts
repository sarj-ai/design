/**
 * Where the published registry lives, and the commands that install from it.
 *
 * The origin is a constant rather than `window.location.origin` on purpose:
 * the whole point of the copied command is that it runs in somebody else's
 * terminal, and a localhost URL pasted into another repo installs nothing.
 * Override it per-deployment with NEXT_PUBLIC_REGISTRY_ORIGIN.
 */

export const REGISTRY_ORIGIN =
  process.env.NEXT_PUBLIC_REGISTRY_ORIGIN ?? "https://design.sarj.ai"

/**
 * Where the product keeps its frontend package.
 *
 * `sarj-ai/platform` is a Yarn workspace monorepo with exactly one
 * components.json — in `products/platform/apps/web` (`@sarj/platform-web`),
 * not at the root. shadcn resolves every alias from the nearest
 * components.json, so a command run from the repo root without `--cwd` finds
 * none and stops; with it, every file lands inside the web package and
 * nothing touches the other workspaces.
 */
export const DEFAULT_CWD = "products/platform/apps/web"

export function registryUrl(slug: string): string {
  return `${REGISTRY_ORIGIN}/r/${slug}.json`
}

/**
 * The published page for a mockup.
 *
 * Same origin constant, for the same reason: this URL is copied to be pasted
 * somewhere else — a Linear ticket, a Slack thread — and `localhost:3000`
 * pasted into a ticket is a dead link for everyone who reads it.
 */
export function mockupUrl(slug: string): string {
  return `${REGISTRY_ORIGIN}/${slug}`
}

/**
 * The same install, one line per package manager, run from the platform root.
 *
 * Yarn leads because that is what the product uses (`packageManager:
 * yarn@4`), so the first line is the one that works as pasted. The other three
 * are kept for a reader installing into some other repo, and guessing wrong
 * costs them a failed command before they think to translate it. Every line
 * carries `--cwd`: without it shadcn looks for components.json at the root
 * and finds none.
 */
export const INSTALL_COMMANDS: {
  id: string
  label: string
  command: (url: string) => string
}[] = [
  {
    id: "yarn",
    label: "yarn",
    command: (url) => `yarn dlx shadcn@latest add ${url} --cwd ${DEFAULT_CWD}`,
  },
  {
    id: "npm",
    label: "npm",
    command: (url) => `npx shadcn@latest add ${url} --cwd ${DEFAULT_CWD}`,
  },
  {
    id: "pnpm",
    label: "pnpm",
    command: (url) => `pnpm dlx shadcn@latest add ${url} --cwd ${DEFAULT_CWD}`,
  },
  {
    id: "bun",
    label: "bun",
    command: (url) => `bunx shadcn@latest add ${url} --cwd ${DEFAULT_CWD}`,
  },
]
