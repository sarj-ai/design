// Not window.location.origin: the copied command runs in another repo, where localhost installs nothing.

const REGISTRY_ORIGIN =
  process.env.NEXT_PUBLIC_REGISTRY_ORIGIN ?? "https://design.sarj.ai"

export const DEFAULT_CWD = "products/platform/apps/web"

export function registryUrl(slug: string): string {
  return `${REGISTRY_ORIGIN}/r/${slug}.json`
}

export function mockupUrl(slug: string): string {
  return `${REGISTRY_ORIGIN}/${slug}`
}

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
