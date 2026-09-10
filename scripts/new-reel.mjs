/**
 * Scaffold a reel.
 *
 *   npm run new:reel -- release-17
 *   npm run new:reel -- release-17 --title "Release 17" \
 *     --meta "Release reel · 40s" --seconds 40 --icon RocketIcon
 *
 * Creates the route, a starting composition, the folder its screenshots go in,
 * and the card on `/reels`. It deliberately does NOT create a finished video.
 *
 * The skeleton it writes is two beats and an end card — enough to render
 * something on the first `npm run reel`, and far too little to ship. That is
 * the point. The engine this replaced handed you a fixed card shape and a JSON
 * spec of headline plus sub, so every release came out looking like the last
 * one. Here the scaffold gets the wiring right and then gets out of the way:
 * rewrite the composition for what this release actually shipped.
 */

import { access, mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"

const REGISTRY = "src/lib/reels-data.ts"
const ICON_IMPORT_BLOCK =
  /import \{([^}]*)\} from "@hugeicons\/core-free-icons"/
const SENTINEL = "  // `npm run new:reel` appends new reels above this line."

const OPTIONS = {
  title: "",
  description: "",
  meta: "",
  eyebrow: "Release reel",
  icon: "VideoReplayIcon",
  seconds: "38",
}

function parseArgs(argv) {
  const args = { ...OPTIONS, slug: "" }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]

    if (!arg.startsWith("--")) {
      if (args.slug) throw new Error(`Unexpected second slug: ${arg}`)
      args.slug = arg.replace(/^\//, "")
      continue
    }

    const key = arg.slice(2)
    if (!(key in OPTIONS)) throw new Error(`Unknown option --${key}`)
    args[key] = argv[++i] ?? ""
  }

  if (!args.slug) {
    throw new Error("Which reel? e.g. npm run new:reel -- release-17")
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(args.slug)) {
    throw new Error(`Slug must be kebab-case: ${args.slug}`)
  }

  return args
}

/** `release-17` → `Release 17`. A starting point the author overrides. */
function titleFrom(slug) {
  return slug
    .split("-")
    .map((word, index) =>
      index === 0 ? word[0].toUpperCase() + word.slice(1) : word,
    )
    .join(" ")
}

/** `release-17` → `Release17Reel`, the component name. */
function componentFrom(slug) {
  return `${slug
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("")}Reel`
}

async function exists(target) {
  try {
    await access(target)
    return true
  } catch {
    return false
  }
}

function routeFile({ slug, title, eyebrow }) {
  const component = componentFrom(slug)

  return `import { ReelPage } from "@/components/reels/reel-page"
import { ${component}, DURATION } from "@/components/reels/${slug}/reel"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ render?: string }>
}) {
  const { render } = await searchParams

  return (
    <ReelPage
      title="${title}"
      eyebrow="${eyebrow}"
      duration={DURATION}
      render={render === "1"}
    >
      <${component} />
    </ReelPage>
  )
}
`
}

function compositionFile({ slug, title, seconds: length }) {
  const component = componentFrom(slug)

  return `"use client"

import { FPS, seconds } from "@/lib/reels/anim"
import { Appear, Scene } from "@/components/reels/stage"
import { Shot } from "@/components/reels/shot"
import { Brandmark, Headline, Kicker, Lead } from "@/components/reels/type"

/**
 * ${title}.
 *
 * THIS IS A STARTING POINT, NOT A TEMPLATE. Rewrite it for what this release
 * actually shipped — different beats, different layouts, different pacing. The
 * shared toolkit keeps it on brand; nothing keeps it interesting except you.
 *
 * Read the Reels section of AGENTS.md before editing. The rule that matters:
 * a reel is a pure function of one frame number. No transitions, no timers —
 * everything moves through \`interpolate\` from src/lib/reels/anim.ts.
 *
 * SHOTS: drop 2x screenshots into public/reels/${slug}/, then point \`focus\`
 * at the region that matters, in the screenshot's own pixels.
 */

const HOOK = { from: 0, duration: seconds(4.5) }
const BEAT = { from: 125, duration: seconds(9) }
const END = { from: 380, duration: seconds(4) }

export const DURATION = ${length} * FPS

export function ${component}() {
  return (
    <>
      <Brandmark>${title}</Brandmark>

      {/* The problem, before the product appears. A reel that opens on a
          screenshot has skipped the only question the viewer has. */}
      <Scene {...HOOK}>
        <div className="flex size-full flex-col justify-center gap-6 px-32">
          <Appear delay={0}>
            <Kicker>${title}</Kicker>
          </Appear>
          <Appear delay={6} exitAt={12}>
            <Headline size="display">One sentence on the problem.</Headline>
          </Appear>
          <Appear delay={16} exitAt={12}>
            <Lead>Only if the headline genuinely cannot carry it alone.</Lead>
          </Appear>
        </div>
      </Scene>

      {/* One feature, shown working. Copy this block per feature and give each
          one a different layout — text left, text above, shot bled off an
          edge. Three identical beats read as a slideshow. */}
      <Scene {...BEAT}>
        <div className="flex size-full flex-col gap-10 px-32 pt-24">
          <div className="flex flex-col gap-3">
            <Appear delay={0}>
              <Kicker>What it does</Kicker>
            </Appear>
            <Appear delay={6}>
              <Headline size="h2">Six words, twelve at the outside</Headline>
            </Appear>
          </div>

          <Appear delay={10} className="self-center">
            <Shot
              alt="Describe what this screenshot shows"
              src="/reels/${slug}/screen.png"
              width={2880}
              height={1545}
              frameWidth={1400}
              focus={{ x: 900, y: 280, width: 1540, height: 840 }}
              at={[20, 150]}
            />
          </Appear>
        </div>
      </Scene>

      <Scene {...END}>
        <div className="flex size-full flex-col items-center justify-center gap-4">
          <Appear delay={0}>
            <Headline size="h1">${title}</Headline>
          </Appear>
          <Appear delay={8}>
            <Lead className="text-center">sarj.ai</Lead>
          </Appear>
        </div>
      </Scene>
    </>
  )
}
`
}

function registryEntry({ slug, title, meta, description, icon, seconds: length }) {
  return `  {
    href: "/reels/${slug}",
    title: "${title}",
    meta: "${meta}",
    description:
      "${description}",
    icon: ${icon},
    duration: ${length} * FPS,
  },
`
}

/** Add the glyph to the registry's existing HugeIcons import, alphabetically. */
function withIconImport(source, icon) {
  const match = source.match(ICON_IMPORT_BLOCK)
  if (!match) throw new Error("No HugeIcons import block in the registry")

  const names = match[1]
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)

  if (names.includes(icon)) return source

  const sorted = [...names, icon].sort((a, b) => a.localeCompare(b))
  return source.replace(
    ICON_IMPORT_BLOCK,
    `import {\n  ${sorted.join(",\n  ")},\n} from "@hugeicons/core-free-icons"`,
  )
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const title = args.title || titleFrom(args.slug)
  const meta = args.meta || `${args.eyebrow} · ${args.seconds}s`
  const description =
    args.description || `${title}. Replace this with what the reel covers.`

  const routeDir = path.join("src", "app", "reels", args.slug)
  const componentDir = path.join("src", "components", "reels", args.slug)
  const shotsDir = path.join("public", "reels", args.slug)

  if (await exists(routeDir)) {
    throw new Error(`/reels/${args.slug} already exists`)
  }

  let registry = await readFile(REGISTRY, "utf8")
  if (registry.includes(`href: "/reels/${args.slug}"`)) {
    throw new Error(`${args.slug} is already on the reel index`)
  }
  if (!registry.includes(SENTINEL)) {
    throw new Error(`Lost the sentinel in ${REGISTRY}`)
  }

  await mkdir(routeDir, { recursive: true })
  await mkdir(componentDir, { recursive: true })
  await mkdir(shotsDir, { recursive: true })

  await writeFile(path.join(routeDir, "page.tsx"), routeFile({ ...args, title }))
  await writeFile(
    path.join(componentDir, "reel.tsx"),
    compositionFile({ ...args, title }),
  )
  /* Git does not track an empty directory, and the composition points at a
     screenshot that is not there yet — so leave a note rather than a silence. */
  await writeFile(
    path.join(shotsDir, "README.md"),
    `# ${title} — screenshots\n\nDrop 2x captures of the product here, then point each \`<Shot focus={…}>\`\nat the region that matters, in the screenshot's own pixels.\n\nCrop off the design-lab shell header and the Agentation dev overlay — neither\nis product UI. Real customer names must not reach a video that leaves the\ncompany.\n`,
  )

  registry = withIconImport(registry, args.icon)
  registry = registry.replace(
    SENTINEL,
    `${registryEntry({ ...args, title, meta, description })}${SENTINEL}`,
  )
  await writeFile(REGISTRY, registry)

  console.log(`
  ${routeDir}/page.tsx
  ${componentDir}/reel.tsx
  ${shotsDir}/README.md
  ${REGISTRY} — card added

Next:
  1. Put 2x screenshots in ${shotsDir}
  2. Rewrite ${componentDir}/reel.tsx — the skeleton is wiring, not a design
  3. npm run reel -- ${args.slug}
`)
}

await main()
