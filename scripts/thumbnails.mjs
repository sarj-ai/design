/**
 * Card thumbnails for the index.
 *
 *   npm run thumbs                    build, shoot every mockup, write them
 *   npm run thumbs -- --check         shoot nothing; fail if any is stale
 *   npm run thumbs -- --slugs a,b     just these
 *   npm run thumbs -- --skip-build    reuse the last build
 *
 * A card that names a screen in prose asks the reader to reconstruct it. A
 * picture of the screen does not — and at the 624px a card gives it, a real
 * mockup is still legible: column headers, dialog titles, status chips.
 *
 * The whole risk is staleness. A thumbnail of a design that has changed is
 * worse than no thumbnail, because a reviewer believes it. So each one is
 * fingerprinted against the mockup it shows: the hash covers every file the
 * route's import graph reaches — the same walk `npm run registry` publishes
 * from — and `--check` fails the moment source and screenshot disagree. Run it
 * in CI and a stale thumbnail cannot reach main.
 *
 * Generated at the desk and committed, rather than built on Vercel. Shooting
 * them during the deploy would mean building the app, serving it, driving a
 * browser over it and building again with the results — twice the build for an
 * image that changes a few times a week.
 *
 * A TOP crop, not the whole viewport and never the full page. Full-page shots
 * (what `npm run shots` takes) squeeze a 2600px screen into a card and read as
 * grey noise; the top of a screen is also the part that identifies it.
 */

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

/** Where the images land, and where the page reads the fingerprints from. */
const OUT_DIR = path.join(ROOT, "public/thumbs")
const MANIFEST = path.join(ROOT, "src/lib/thumbnails.json")

/* The shot. 1440x900 is the viewport every review screenshot uses.

   The crop starts below MockupShell's own header, which is workspace chrome
   and not the design — it would put a back link and a repeat of the card's
   own title across the top of all twelve.

   600 of the remaining 855 is roughly 2.4:1. It is a trade: every pixel here
   is a pixel of index the reader has to scroll past twelve times over, and
   the top of a screen already says what the screen is. At the full viewport
   the index was exactly twice as long. */
const VIEWPORT = { height: 900, width: 1440 }
const SHELL_HEADER = 45
const CROP_HEIGHT = 600

/* The card gives an image 624px. Twice that covers a retina screen, and past
   it the extra pixels are weight nobody sees. */
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

/* Any HTTP answer means the server is up — a 401 from the site password is a
   reply, not a failure to start. */
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

/**
 * What the mockup is made of, as one string.
 *
 * Paths as well as contents, so renaming a component invalidates the shot even
 * when nothing inside it changed — the route renders a different file then,
 * and the screen can look different for it. Sorted, because the walk visits in
 * import order and that is not stable.
 */
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

/**
 * `?toolbar=0` turns the Vercel toolbar off and, with it, the comment toggle in
 * the shell header. A capture is of the design, not of the chrome a reviewer
 * uses to talk about it.
 */
function captureUrl(route, baseUrl) {
  const url = new URL(route, baseUrl)
  url.searchParams.set("toolbar", "0")
  return url.href
}

/** Shoot one route and write its thumbnail. */
async function capture(page, baseUrl, slug) {
  await page.goto(captureUrl(`/${slug}`, baseUrl), {
    waitUntil: "networkidle",
  })
  /* Entrance animations and font swap. The mockups animate on mount, and a
     shot taken mid-transition shows a half-faded screen. */
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

/**
 * Basic-auth credentials for the capture browser, when `SITE_PASSWORD` is set.
 *
 * `src/proxy.ts` gates every route and every asset once there is a password, so
 * without this a capture comes back as a blank 401. Any username is accepted;
 * only the password is checked.
 */
/* `.env.local` is read by Next, not by Node, so the capture has to load it
   itself — otherwise the server it just started gates a browser holding no
   password, and every shot comes back blank. */
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
  /* The page needs the intrinsic size to reserve the space before the image
     loads, and it must be the size actually written rather than a second copy
     of the crop arithmetic that can fall out of step with it. */
  let size

  try {
    const page = await browser.newPage({
      /* See screenshots.mjs — the gate covers thumbnails too. */
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

  /* Merged, not replaced, so `--slugs` does not drop every other mockup's
     fingerprint and mark them all stale. */
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
