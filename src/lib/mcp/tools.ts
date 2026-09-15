/**
 * The design lab, as tools an agent in another repo can call.
 *
 * The flow these exist for: an engineer says "add the design for DES-173" and
 * their agent resolves the ticket to a mockup, reads what installing it will
 * do, and runs one command. Everything here serves that — nothing browses,
 * nothing paginates, and every answer carries enough to act on without a
 * second round trip.
 *
 * The server is hosted, so it cannot write to the caller's disk. It hands back
 * a complete install brief and the agent runs the single command in it.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import {
  addedTokens,
  DEFAULT_CWD,
  type Design,
  designs,
  findDesigns,
  getDesign,
  installCommand,
} from "@/lib/mcp/designs"

/** Tool results are text. JSON is what an agent reads most reliably. */
function json(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
  }
}

function fail(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  }
}

/** The card, without the install detail — enough to pick one. */
function summary(design: Design) {
  return {
    slug: design.slug,
    title: design.title,
    description: design.description,
    meta: design.meta,
    surface: design.surface,
    tickets: design.tickets.map((ticket) => ticket.id),
    page: design.page,
  }
}

/**
 * Files an item ships that share a basename.
 *
 * shadcn rewrites each installed file's imports to wherever the target put it,
 * and it matches by basename — so a design carrying both drawer/icons.tsx and
 * list/icons.tsx installs cleanly and then compiles against the wrong one. The
 * screen looks installed and is not, which is worth saying up front rather
 * than leaving to be discovered as a pile of missing-export errors.
 */
function clashes(design: Design): string[][] {
  const byBasename = new Map<string, string[]>()

  for (const file of design.item?.files ?? []) {
    const basename = file.path.split("/").pop() ?? file.path
    byBasename.set(basename, [...(byBasename.get(basename) ?? []), file.path])
  }

  return [...byBasename.values()].filter((paths) => paths.length > 1)
}

/**
 * What a caller has to know before running the install, in plain language.
 *
 * Every line here was learned by installing a design into `sarj-ai/platform`
 * and reading the diff, so they travel with every brief rather than living in
 * a README nobody installing a design reads.
 */
function notes(design: Design) {
  const lines = [
    `Run the command from the sarj-ai/platform repository root. The repo's only components.json is in ${DEFAULT_CWD} (@sarj/platform-web), so --cwd points shadcn at that package: every file lands under its src/, the npm packages go into its package.json and the root yarn.lock, and nothing else in the monorepo is touched. Without --cwd shadcn finds no components.json at the root and stops.`,
    "The `yes n` prefix matters. shadcn asks before touching any file you already have, once per file, and this design lists every primitive it uses — without it an unattended run answers none of those prompts and writes nothing. Answering no keeps your files and writes only what is new. It is also what protects src/lib/utils.ts: this item ships shadcn's stock lib/utils.ts, and the platform's copy exports more than cn — say yes to that prompt and formatDuration and the form helpers are gone. Drop the prefix only if you would rather decide file by file.",
    "The platform's primitives are built on @base-ui/react and take a `render` prop. This design is written against Radix and uses `asChild`, which does not exist there — every `<Trigger asChild><Button /></Trigger>` in the installed files fails to typecheck until it is rewritten as `<Trigger render={<Button />} />`. `grep -rn asChild src/components/sarj src/app/<slug>` lists them.",
    "Check `primitives` against src/components/ui first. Anything the platform is missing is installed from shadcn's default registry, which ships Radix-backed versions — and, as of September 2026, those import cn from an npm package literally called `cn` (unrelated to shadcn; it is a Chuck Norris joke CLI) and add it to package.json next to `radix-ui`. Point those imports at @/lib/utils, drop both packages, and decide whether you want a Radix primitive in a Base UI app at all. sidebar also drops hooks/use-mobile.ts beside the platform's existing use-mobile.tsx, and the .ts wins the import.",
    "Installing adds npm packages even for primitives that were skipped because you already had them — expect radix-ui in products/platform/apps/web/package.json and a thousand-line yarn.lock diff after a run that copied nothing under ui/. Read the package.json diff before committing.",
    "The platform's tsconfig turns on exactOptionalPropertyTypes and noUncheckedIndexedAccess, which this repo's does not: expect a few TS2375 (an optional prop passed as `x | undefined`) and TS18048 (an indexed value 'possibly undefined') errors per screen on top of the asChild ones. They are real under those flags and compile cleanly here.",
    "Budget a cleanup pass. The platform's eslint (simple-import-sort, perfectionist/sort-jsx-props, consistent-type-assertions, @sarj/prefer-immutable-module-constant and friends) reports one to eight errors per installed file; the import and prop ordering ones autofix with `yarn workspace @sarj/platform-web fix`, the type-assertion and module-constant ones do not. globals.css comes back with four-space indents in a two-space file and no trailing newline.",
    "This is a mockup. Its data is invented and includes real customer names — adapt the screen, do not ship it as it stands.",
  ]

  if (design.item?.files.some((file) => file.type === "registry:page")) {
    lines.push(
      `This item ships app/${design.slug}/page.tsx, and shadcn lands it at src/app/${design.slug}/page.tsx — a live route under the platform's root layout, which already wraps every page in Clerk auth and the real product sidebar. The page also renders the design lab's own AppShell, so the result is a mock sidebar and breadcrumb nested inside the real ones. Take the components under components/sarj/mockups/${design.slug} and mount them in a real route; delete the page and components/sarj/shell/*.`,
    )
  }

  for (const paths of clashes(design)) {
    lines.push(
      `This design ships ${paths.length} files named ${paths[0]?.split("/").pop()} (${paths.join(", ")}). shadcn resolves rewritten imports by basename, so after installing, one of them will be imported in place of the other — fix those import paths by hand before anything else.`,
    )
  }

  if (design.item?.cssVars?.light || design.item?.css?.[":root"]) {
    lines.push(
      '`tokens` are added to globals.css — values in :root and aliases in @theme inline, light mode only. The platform also has a .dark block and a [data-whitelabel="tasama"] block, and neither receives a value, so under either a tint resolves to nothing. A property the platform already defines (warning, for instance) is left alone. Add the dark and tasama values by hand.',
    )
  }

  return lines
}

export function createDesignLabServer(origin: string): McpServer {
  const server = new McpServer(
    { name: "sarj-design-lab", version: "1.0.0" },
    {
      instructions: [
        "The Sarj design lab: reviewed UI mockups, each answering one or more Linear design tickets, published as shadcn registry items.",
        "To install a design an engineer asked for by ticket: find_design with the ticket ID, then get_design with the slug it returns, then run the command in the brief.",
        "To borrow a pattern without installing a whole screen, read it with get_design_source instead.",
      ].join(" "),
    },
  )

  server.registerTool(
    "list_designs",
    {
      title: "List designs",
      description:
        "Every mockup in the design lab: slug, title, shape, product surface, the Linear tickets it answers, and its live URL. Start here when you do not know what exists.",
    },
    async () => json(designs(origin).map(summary)),
  )

  server.registerTool(
    "find_design",
    {
      title: "Find a design",
      description:
        "Resolve a Linear ticket identifier (DES-173), a slug, or a free-text description to the designs that answer it. A ticket or slug match is returned on its own; anything else is ranked by relevance.",
      inputSchema: {
        query: z
          .string()
          .describe("A Linear ticket ID, a design slug, or what to look for."),
      },
    },
    async ({ query }) => {
      const matches = findDesigns(query, origin)
      if (!matches.length) {
        return fail(
          `No design matches "${query}". Call list_designs to see what the lab has — not every ticket has a mockup.`,
        )
      }
      return json(matches.map(summary))
    },
  )

  server.registerTool(
    "get_design",
    {
      title: "Get a design's install brief",
      description:
        "Everything needed to install one design: the command to run, where each file lands, the shadcn primitives and npm packages it needs, the CSS tokens it adds, and the caveats that matter.",
      inputSchema: {
        slug: z.string().describe("The design's slug, from find_design."),
        cwd: z
          .string()
          .optional()
          .describe(
            `Path from the repo root to the package that owns components.json. Defaults to "${DEFAULT_CWD}" (@sarj/platform-web) — sarj-ai/platform has no components.json at its root, so the default is right for the product and only worth changing for another repo.`,
          ),
      },
    },
    async ({ slug, cwd }) => {
      const design = getDesign(slug, origin)
      if (!design) return fail(`No design called "${slug}". Try find_design.`)
      if (!design.item) {
        return fail(
          `"${slug}" is on the index but not in the registry. Someone needs to run \`npm run registry\` in the design lab.`,
        )
      }

      const { item } = design

      return json({
        slug: design.slug,
        title: design.title,
        description: design.description,
        meta: design.meta,
        surface: design.surface,
        tickets: design.tickets,
        page: design.page,
        thumbnail: design.thumbnail,
        install: installCommand(design, cwd),
        files: item.files.map((file) => ({
          from: file.path,
          to: file.target,
        })),
        primitives: item.registryDependencies,
        packages: item.dependencies,
        /* The colours arrive through cssVars and the stacking scale through
           plain CSS, for reasons the generator explains — but a caller asking
           what this adds to their globals.css wants one list, not two. */
        tokens: {
          ...(item.cssVars?.light ?? {}),
          ...Object.fromEntries(
            Object.entries(item.css?.[":root"] ?? {}).map(([name, value]) => [
              name.replace(/^--/, ""),
              value,
            ]),
          ),
        },
        utilities: Object.keys(item.css ?? {}).filter((key) =>
          key.startsWith("@utility "),
        ),
        nameClashes: clashes(design),
        notes: notes(design),
      })
    },
  )

  server.registerTool(
    "get_design_source",
    {
      title: "Read a design's source",
      description:
        "The source of the files a design ships, without installing it. Call without `file` to list them, with `file` to read one. Use this to borrow a single pattern rather than take a whole screen.",
      inputSchema: {
        slug: z.string().describe("The design's slug."),
        file: z
          .string()
          .optional()
          .describe(
            "One path from the file list, e.g. src/components/x/y.tsx.",
          ),
      },
    },
    async ({ slug, file }) => {
      const design = getDesign(slug, origin)
      if (!design?.item) return fail(`No design called "${slug}".`)

      if (!file) {
        return json({
          slug,
          files: design.item.files.map((entry) => entry.path),
        })
      }

      /* The published item is the one place the file contents live — the
         generated index carries paths only, and reading from disk would tie
         this to how the deployment lays out its filesystem. */
      const response = await fetch(design.registry)
      if (!response.ok) {
        return fail(`Could not read ${design.registry} (${response.status}).`)
      }

      const published = (await response.json()) as {
        files?: { path: string; content?: string }[]
      }
      const match = published.files?.find((entry) => entry.path === file)

      if (!match?.content) {
        return fail(
          `"${file}" is not one of this design's files. Call get_design_source without \`file\` to list them.`,
        )
      }

      return { content: [{ type: "text" as const, text: match.content }] }
    },
  )

  server.registerTool(
    "get_design_tokens",
    {
      title: "Get the design tokens",
      description:
        "The custom properties and utilities Sarj designs use on top of a stock shadcn palette. The install adds these for you — read them only when reconciling a globals.css by hand.",
    },
    async () => {
      const { light, theme, css } = addedTokens()

      return json({
        root: {
          ...light,
          ...Object.fromEntries(
            Object.entries(css[":root"] ?? {}).map(([name, value]) => [
              name.replace(/^--/, ""),
              value,
            ]),
          ),
        },
        theme,
        utilities: Object.fromEntries(
          Object.entries(css).filter(([key]) => key.startsWith("@utility ")),
        ),
        note: "Light values only; this workspace ships one mode. `root` goes in :root as --name, `theme` in @theme inline, `utilities` are Tailwind v4 @utility blocks.",
      })
    },
  )

  return server
}
