// Usage: npm run thumbs [-- --check] [--slugs a,b] [--skip-build] [--url <base>]

import { spawn } from "node:child_process"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

/* CJS: the named export only exists on `default`. */
import nextEnv from "@next/env"
import process from "node:process"

import { chromium } from "playwright"
import sharp from "sharp"

import { ROOT, collect, readMockups, routeFile } from "./lib/import-graph.mjs"

const OUT_DIR = path.join(ROOT, "public/thumbs")
const MANIFEST = path.join(ROOT, "src/lib/site/thumbnails.json")

// The crop starts below MockupShell's header, which is workspace chrome, not the design.
const VIEWPORT = { height: 900, width: 1440 }
const SHELL_HEADER = 45
const CROP_HEIGHT = 600

const OUTPUT_WIDTH = 1280

const DEFAULTS = { port: "3102", slugs: "", url: "" }

function parseArgs(argv) {
  const args = { ...DEFAULTS, check: false, "skip-build": false }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg.startsWith("--")) continue

    const key = arg.slice(2)
    if (key === "check" || key === "skip-build") {
      args[key] = true
      continue
    }
    if (!(key in DEFAULTS)) throw new Error(`Unknown option --${key}`)
    args[key] = argv[++i] ?? ""
  }

  return args
}

function run(command, commandArgs, options = {}) {
  return spawn(command, commandArgs, {
    shell: false,
    stdio: options.quiet ? "ignore" : "inherit",
    ...options,
  })
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`exited with ${code}`)),
    )
    child.on("error", reject)
  })
}

// Any HTTP answer, a 401 included, means the server is up.
async function reachable(url) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(1500) })
    return true
  } catch {
    return false
  }
}

async function waitUntilReachable(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    if (await reachable(url)) return
    await new Promise((resolve) => setTimeout(resolve, 400))
  }

  throw new Error(`Server never came up at ${url}`)
}

// Paths as well as contents, so a rename invalidates the shot. Sorted: the walk order is not stable.
function fingerprint(slug) {
  const { files } = collect(routeFile(slug))
  const hash = createHash("sha256")

  for (const file of [...files].sort()) {
    hash.update(path.relative(ROOT, file).split(path.sep).join("/"))
    hash.update("\0")
    hash.update(readFileSync(file))
    hash.update("\0")
  }

  return hash.digest("hex").slice(0, 16)
}

async function readManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST, "utf8"))
  } catch {
    return { fingerprints: {}, height: 0, width: 0 }
  }
}

function captureUrl(route, baseUrl) {
  return new URL(route, baseUrl).href
}

async function capture(page, baseUrl, slug) {
  await page.goto(captureUrl(`/${slug}`, baseUrl), {
    waitUntil: "networkidle",
  })
  // Wait out mount animations and the font swap.
  await page.waitForTimeout(900)

  const png = await page.screenshot({
    clip: {
      height: CROP_HEIGHT,
      width: VIEWPORT.width,
      x: 0,
      y: SHELL_HEADER,
    },
  })

  const { height, width } = await sharp(png)
    .resize({ width: OUTPUT_WIDTH })
    .webp({ quality: 82 })
    .toFile(path.join(OUT_DIR, `${slug}.webp`))

  return { height, width }
}

// .env.local is read by Next, not Node: load it so the capture browser gets the site password.
nextEnv.loadEnvConfig(process.cwd(), true, {
  error: () => {},
  info: () => {},
})

function credentials() {
  const password = process.env.SITE_PASSWORD
  return password ? { httpCredentials: { password, username: "capture" } } : {}
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  const wanted = args.slugs
    ? new Set(args.slugs.split(",").map((slug) => slug.trim()))
    : null
  const mockups = readMockups().filter(
    ({ slug }) => !wanted || wanted.has(slug),
  )

  const current = Object.fromEntries(
    mockups.map(({ slug }) => [slug, fingerprint(slug)]),
  )

  if (args.check) {
    const { fingerprints } = await readManifest()
    const stale = mockups
      .map(({ slug }) => slug)
      .filter((slug) => fingerprints[slug] !== current[slug])

    if (stale.length) {
      console.error(
        `\nStale thumbnails — the mockup changed since the screenshot:\n${stale
          .map((slug) => `  /${slug}`)
          .join("\n")}\n\nRun: npm run thumbs\n`,
      )
      process.exitCode = 1
      return
    }

    console.log(`✔ ${mockups.length} thumbnails match their mockups`)
    return
  }

  let baseUrl = args.url
  let server

  if (!baseUrl) {
    baseUrl = `http://localhost:${args.port}`

    if (await reachable(baseUrl)) {
      console.log(`Reusing the server already on ${baseUrl}`)
    } else {
      if (!args["skip-build"]) {
        console.log("Building…")
        await waitForExit(run("npx", ["next", "build"]))
      }

      console.log(`Starting next start on ${baseUrl}…`)
      server = run("npx", ["next", "start", "-p", args.port], { quiet: true })
      await waitUntilReachable(baseUrl)
    }
  }

  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch()
  // The size actually written, not a second copy of the crop arithmetic.
  let size

  try {
    const page = await browser.newPage({
      ...credentials(),
      deviceScaleFactor: 2,
      viewport: VIEWPORT,
    })

    for (const { slug } of mockups) {
      size = await capture(page, baseUrl, slug)
      console.log(`  /${slug}`)
    }
  } finally {
    await browser.close()
    server?.kill()
  }

  // Merged, not replaced, so `--slugs` keeps every other mockup's fingerprint.
  const previous = await readManifest()
  const merged = { ...previous.fingerprints, ...current }
  const fingerprints = Object.fromEntries(
    Object.keys(merged)
      .sort()
      .map((slug) => [slug, merged[slug]]),
  )

  await writeFile(
    MANIFEST,
    `${JSON.stringify(
      {
        fingerprints,
        height: size?.height ?? previous.height,
        width: size?.width ?? previous.width,
      },
      null,
      2,
    )}\n`,
  )
  console.log(`\n${mockups.length} thumbnails → public/thumbs`)
}

await main()
