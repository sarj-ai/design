// Usage: npm run reel -- <slug> [--scale 2] [--skip-build] [--url <base>]

import { spawn } from "node:child_process"
import { once } from "node:events"
import { createHash } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"

/* CJS: the named export only exists on `default`. */
import nextEnv from "@next/env"
import { chromium } from "playwright"
import sharp from "sharp"

const DEFAULTS = {
  out: "reels",
  url: "",
  port: "3100",
  scale: "1",
  crf: "18",
}

function parseArgs(argv) {
  const args = { ...DEFAULTS, "skip-build": false, slug: "" }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]

    if (!arg.startsWith("--")) {
      if (!args.slug) args.slug = arg.replace(/^\//, "")
      continue
    }

    const key = arg.slice(2)
    if (key === "skip-build") {
      args["skip-build"] = true
      continue
    }
    if (!(key in DEFAULTS)) throw new Error(`Unknown option --${key}`)
    args[key] = argv[++i] ?? ""
  }

  if (!args.slug) {
    throw new Error("Which reel? e.g. npm run reel -- callback-tool")
  }

  return args
}

function run(command, commandArgs, options = {}) {
  return spawn(command, commandArgs, {
    stdio: options.quiet ? "ignore" : "inherit",
    shell: false,
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

// .env.local is read by Next, not Node: load it so the capture browser gets the site password.
nextEnv.loadEnvConfig(process.cwd(), true, { error: () => {}, info: () => {} })

function credentials() {
  const password = process.env.SITE_PASSWORD
  return password ? { httpCredentials: { password, username: "render" } } : {}
}

const POSTER = { width: 1280, height: 720 }
const POSTER_MANIFEST = "src/lib/site/reel-posters.json"

async function writePosterManifest(slug, buffer) {
  let previous = { fingerprints: {} }

  try {
    previous = JSON.parse(await readFile(POSTER_MANIFEST, "utf8"))
  } catch {
    /* First reel — there is no manifest yet. */
  }

  const fingerprints = {
    ...previous.fingerprints,
    [slug]: createHash("sha256").update(buffer).digest("hex").slice(0, 16),
  }

  await writeFile(
    POSTER_MANIFEST,
    `${JSON.stringify(
      {
        fingerprints: Object.fromEntries(
          Object.entries(fingerprints).sort(([a], [b]) => a.localeCompare(b)),
        ),
        height: POSTER.height,
        width: POSTER.width,
      },
      null,
      2,
    )}\n`,
  )
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const scale = Number(args.scale)

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

  const outDir = path.resolve(args.out)
  await mkdir(outDir, { recursive: true })
  const outFile = path.join(outDir, `${args.slug}.mp4`)

  const browser = await chromium.launch()
  let ffmpeg

  try {
    const context = await browser.newContext({
      ...credentials(),
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: scale,
    })

    const page = await context.newPage()
    const target = new URL(`/reels/${args.slug}?render=1`, baseUrl).href

    console.log(`Loading ${target}`)
    await page.goto(target, { waitUntil: "networkidle" })

    // Frames are taken from the canvas, so hide every sibling (toasts, the dev overlay) or it lands in the video.
    await page.addStyleTag({
      content: "body > *:not([data-reel-root]) { display: none !important }",
    })

    // Wait on the composition's seek hook, not a timeout, so frame 0 is reliable.
    await page.waitForFunction(() => Boolean(window.__reel), null, {
      timeout: 30_000,
    })

    // Decode fonts and images before frame 0, or the opening renders in a fallback face with blank panels.
    await page.evaluate(() => document.fonts.ready)
    await page.evaluate(() =>
      Promise.all(
        Array.from(document.images)
          .filter((image) => !image.complete)
          .map(
            (image) =>
              new Promise((resolve) => {
                image.onload = resolve
                image.onerror = resolve
              }),
          ),
      ),
    )

    const { duration, fps } = await page.evaluate(() => ({
      duration: window.__reel.duration,
      fps: window.__reel.fps,
    }))

    const width = 1920 * scale
    const height = 1080 * scale
    console.log(
      `${duration} frames at ${fps}fps → ${width}x${height} → ${outFile}`,
    )

    ffmpeg = run(
      "ffmpeg",
      [
        "-y",
        "-f",
        "image2pipe",
        "-vcodec",
        "png",
        "-framerate",
        String(fps),
        "-i",
        "-",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        args.crf,
        "-preset",
        "slow",
        // Lets Slack and Drive previews start before the whole file arrives.
        "-movflags",
        "+faststart",
        outFile,
      ],
      { stdio: ["pipe", "ignore", "ignore"] },
    )

    const canvas = page.locator("[data-reel-canvas]")
    const posterFrame = Math.floor(duration * 0.35)
    const started = Date.now()
    let poster

    for (let frame = 0; frame < duration; frame += 1) {
      await page.evaluate((n) => window.__reel.seek(n), frame)
      const buffer = await canvas.screenshot({ type: "png" })

      // Respect backpressure: ffmpeg encodes slower than Chromium hands over frames.
      if (!ffmpeg.stdin.write(buffer)) await once(ffmpeg.stdin, "drain")

      // Frame 0 is usually a blank canvas, so the poster is taken a third of the way in.
      if (frame === posterFrame) {
        poster = await sharp(buffer)
          .resize({ width: POSTER.width })
          .webp({ quality: 82 })
          .toBuffer()

        await writeFile(
          path.join("public", "reels", args.slug, "poster.webp"),
          poster,
        )
      }

      if (frame % 60 === 0 || frame === duration - 1) {
        const pct = Math.round(((frame + 1) / duration) * 100)
        process.stdout.write(`\r  ${pct}%  frame ${frame + 1}/${duration}`)
      }
    }

    ffmpeg.stdin.end()
    await waitForExit(ffmpeg)
    ffmpeg = undefined

    if (poster) await writePosterManifest(args.slug, poster)

    const took = Math.round((Date.now() - started) / 1000)
    console.log(`\n\nDone in ${took}s → ${outFile}`)

    await context.close()
  } finally {
    ffmpeg?.kill()
    await browser.close()
    server?.kill()
  }
}

await main()
