/**
 * Where the published registry lives, and the commands that install from it.
 *
 * The origin is a constant rather than `window.location.origin` on purpose:
 * the whole point of the copied command is that it runs in somebody else's
 * terminal, and a localhost URL pasted into another repo installs nothing.
 * Override it per-deployment with NEXT_PUBLIC_REGISTRY_ORIGIN.
 */

export const REGISTRY_ORIGIN =
  process.env.NEXT_PUBLIC_REGISTRY_ORIGIN ?? "https://mock-up-repo.vercel.app"

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
 * The same install, one line per package manager.
 *
 * All four are offered because the reader is pasting into a repo that is not
 * this one, and guessing wrong costs them a failed command before they think
 * to translate it.
 */
export const INSTALL_COMMANDS: {
  id: string
  label: string
  command: (url: string) => string
}[] = [
  { id: "npm", label: "npm", command: (url) => `npx shadcn@latest add ${url}` },
  {
    id: "pnpm",
    label: "pnpm",
    command: (url) => `pnpm dlx shadcn@latest add ${url}`,
  },
  {
    id: "bun",
    label: "bun",
    command: (url) => `bunx shadcn@latest add ${url}`,
  },
  {
    id: "yarn",
    label: "yarn",
    command: (url) => `yarn dlx shadcn@latest add ${url}`,
  },
]
