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
 * These are the four things that actually surprise people, so they travel with
 * every brief rather than living in a README nobody installing a design reads.
 */
function notes(design: Design) {
  const lines = [
    "Run the command from the repository root. --cwd points shadcn at the package that owns components.json, so every file lands inside that package and nothing touches the rest of the monorepo.",
    "The `yes n` prefix matters. shadcn asks before touching any file you already have, once per file, and this design lists every primitive it uses — without it an unattended run answers none of those prompts and writes nothing. Answering no keeps your files and writes only what is new. Drop the prefix if you would rather decide file by file.",
    "Check `primitives` against your own components/ui first. Anything you are missing is installed from shadcn's default registry, which ships Radix-backed versions — drawer also pulls in vaul, and resizable pulls in react-resizable-panels.",
    "These components are written against Radix and use the `asChild` prop. If your primitives are built on @base-ui/react, `asChild` does not exist there — those call sites become `render` and will not typecheck until you convert them.",
    "Installing also adds the npm packages those primitives depend on — radix-ui among them — even for primitives that were skipped because you already had them. Read the package.json diff before committing.",
    "Budget a cleanup pass if your tsconfig is stricter than the design lab's. exactOptionalPropertyTypes and noUncheckedIndexedAccess both flag mockup code that compiles cleanly here.",
    "This is a mockup. Its data is invented and includes real customer names — adapt the screen, do not ship it as it stands.",
  ]

  for (const paths of clashes(design)) {
    lines.push(
      `This design ships ${paths.length} files named ${paths[0]?.split("/").pop()} (${paths.join(", ")}). shadcn resolves rewritten imports by basename, so after installing, one of them will be imported in place of the other — fix those import paths by hand before anything else.`,
    )
  }

  if (design.item?.cssVars?.light) {
    lines.push(
      "`tokens` are added to your globals.css. A custom property you already define is left alone. The values are light-mode only — this workspace ships one mode, so a dark theme shows the light value until you choose one.",
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
            `Path from the repo root to the package that owns components.json. Defaults to "${DEFAULT_CWD}".`,
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
