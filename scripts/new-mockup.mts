import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const REGISTRY = "src/lib/site/mockups-data.ts";
const ICON_MODULE = "@hugeicons/core-free-icons";
const ICON_IMPORT_BLOCK =
  /import \{([^}]*)\} from "@hugeicons\/core-free-icons"/;
const SENTINEL = "  // `npm run new` appends new mockups above this line.";

const SURFACES: readonly string[] = [
  "Conversations",
  "Personas",
  "Scenarios Index",
  "Scenario Edit",
  "Knowledge Bases",
  "Integrations Pages",
  "Playground",
  "Settings",
];

const OPTIONS: Readonly<Record<string, string>> = {
  title: "",
  description: "",
  meta: "Page · exploration",
  surface: "",
  icon: "SparklesIcon",
  tickets: "",
  eyebrow: "",
};

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.slug) {
    throw new Error(
      "Usage: npm run new -- <slug> [--title …] [--description …] [--meta …] [--surface …] [--icon …] [--tickets …] [--eyebrow …]",
    );
  }

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(args.slug)) {
    throw new Error(
      `"${args.slug}" is not a kebab-case slug — lowercase words joined by single hyphens.`,
    );
  }

  if (args.surface && !SURFACES.includes(args.surface)) {
    throw new Error(
      `"${args.surface}" is not a Surface label. One of: ${SURFACES.join(", ")} — or leave --surface off when none of them covers the screen.`,
    );
  }

  const routeDir = path.join("src/app/(mockups)", args.slug);
  if (await exists(routeDir)) {
    throw new Error(`${routeDir} already exists. Pick another slug.`);
  }

  const icons = await import("@hugeicons/core-free-icons");
  if (!Reflect.has(icons, args.icon)) {
    throw new Error(
      `${ICON_MODULE} has no export "${args.icon}". Browse names at https://hugeicons.com/icons — the export is the icon name plus "Icon".`,
    );
  }

  const mockup = {
    slug: args.slug,
    title: args.title === "" ? titleCase(args.slug) : args.title,
    meta: args.meta,
    surface: args.surface,
    description:
      args.description === ""
        ? `TODO — one line on what ${args.slug} answers.`
        : args.description,
    icon: args.icon,
    tickets: args.tickets,
    eyebrow: args.eyebrow,
  };

  let registry = await readFile(REGISTRY, "utf8");
  if (registry.includes(`href: "/${args.slug}"`)) {
    throw new Error(`/${args.slug} is already on the index.`);
  }
  if (!registry.includes(SENTINEL)) {
    throw new Error(`Could not find the append marker in ${REGISTRY}`);
  }

  registry = withIconImport(registry, args.icon);
  registry = registry.replace(SENTINEL, (match, offset: number) =>
    replacementText(
      `${registryEntry(mockup)}${SENTINEL}`,
      registry,
      match,
      offset,
    ),
  );

  await mkdir(routeDir, { recursive: true });
  const pagePath = path.join(routeDir, "page.tsx");
  await writeFile(pagePath, pageSource(mockup));
  await writeFile(REGISTRY, registry);
  await format([pagePath, REGISTRY]);

  process.stdout.write(`
  ${pagePath}
  ${REGISTRY}  (+ card, + ${args.icon})

  Next:
    npm run dev            http://localhost:3000/${args.slug}
    npm run lint           the design system is enforced, not suggested
    npm run shots -- --routes /${args.slug}

  Read .claude/skills/sarj-mockup/SKILL.md before you write the screen.

`);
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> & { slug: string } = {
    ...OPTIONS,
    slug: "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (!arg.startsWith("--")) {
      if (args.slug) throw new Error(`Unexpected second slug: ${arg}`);
      args.slug = arg;
      continue;
    }

    const key = arg.slice(2);
    if (!Reflect.has(OPTIONS, key)) throw new Error(`Unknown option --${key}`);
    args[key] = argv[++i] ?? "";
  }

  return args;
}

function titleCase(slug: string) {
  const words = slug.split("-");
  return words
    .map((word, index) =>
      index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
    )
    .join(" ");
}

async function exists(target: string) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function pageSource({
  slug,
  title,
  description,
  eyebrow,
}: Record<string, string>) {
  const shellProps = eyebrow
    ? `eyebrow="${eyebrow}" title="${title}"`
    : `title="${title}"`;

  return `"use client"

import { MockupShell } from "@/components/shell/mockup-shell"

export default function ${pascalCase(slug)}Page() {
  return (
    <MockupShell ${shellProps}>
      <main className="mx-auto flex w-full max-w-350 flex-col gap-8 p-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">${title}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            ${description}
          </p>
        </header>

        {/* Build the ticket here. Components go in
            src/components/mockups/${slug}/, mock data in src/lib/mockups/${slug}-data.ts —
            create them when the ticket needs them, not before. */}
      </main>
    </MockupShell>
  )
}
`;
}

function pascalCase(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function registryEntry({
  slug,
  title,
  meta,
  surface,
  description,
  icon,
  tickets,
}: Record<string, string>) {
  const list = tickets
    .split(",")
    .map((ticket) => ticket.trim())
    .filter(Boolean)
    .map((ticket) => `"${ticket}"`)
    .join(", ");

  return `  {
    href: "/${slug}",
    title: "${title}",
    meta: "${meta}",
    surface: ${surface ? `"${surface}"` : "null"},
    description:
      "${description}",
    icon: ${icon},
    tickets: [${list}],
    added: "${new Date().toISOString()}",
  },
`;
}

function withIconImport(source: string, icon: string) {
  const block = ICON_IMPORT_BLOCK.exec(source);
  if (!block) throw new Error(`Could not find the icon import in ${REGISTRY}`);

  const names = block[1]
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  if (names.includes(icon)) return source;

  const sorted = [...names, icon].toSorted((a, b) => a.localeCompare(b));
  const replacement = `import {\n${sorted
    .map((name) => `  ${name},`)
    .join("\n")}\n} from "${ICON_MODULE}"`;

  return source.replace(
    ICON_IMPORT_BLOCK,
    (match, capture: string, offset: number) =>
      replacementText(replacement, source, match, offset, capture),
  );
}

function replacementText(
  replacement: string,
  source: string,
  match: string,
  offset: number,
  capture?: string,
) {
  return replacement.replaceAll(/\$(\$|&|`|'|0?1)/g, (token, code) => {
    switch (code) {
      case "$":
        return "$";
      case "&":
        return match;
      case "`":
        return source.slice(0, offset);
      case "'":
        return source.slice(offset + match.length);
      default:
        return capture ?? token;
    }
  });
}

function format(files: string[]) {
  const formatted = new Promise<void>((resolve, reject) => {
    const child = spawn("npx", ["oxfmt", "--write", ...files], {
      stdio: "ignore",
    });
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`oxfmt exited ${String(code)}`)),
    );
    child.on("error", reject);
  });
  return formatted;
}

await main();
