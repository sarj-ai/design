/**
 * Render a reel to MP4.
 *
 *   npm run reel -- callback-tool
 *   npm run reel -- callback-tool --scale 2          # 4K
 *   npm run reel -- callback-tool --skip-build       # reuse a running server
 *
 * How it works: the reel route already draws itself from a single frame
 * number, so rendering is just "set the number, take a picture", 30 times a
 * second of finished video. `?render=1` drops the player chrome and pins the
 * canvas to exactly 1920x1080 so nothing is scaled on the way out.
 *
 * The page is loaded ONCE and then seeked, rather than reloaded per frame. A
 * reload per frame would re-decode every screenshot 1140 times for a 38-second
 * reel and turn a two-minute render into most of an hour.
 *
 * Frames go straight down a pipe into ffmpeg instead of onto disk. A 38-second
 * reel is ~1140 PNGs at roughly 2 MB each — about 2.3 GB of temporary files
 * that exist only to be read back immediately.
 */

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

/* `.env.local` is read by Next, not by Node, so the render has to load it
   itself — otherwise the browser holds no site password and every frame comes
   back as a blank 401. Same reasoning as scripts/screenshots.mjs. */
nextEnv.loadEnvConfig(process.cwd(), true, { error: () => {}, info: () => {} })

function credentials() {
  const password = process.env.SITE_PASSWORD
  return password ? { httpCredentials: { password, username: "render" } } : {}
}

/** The gallery card's poster. 16:9 off a 1920x1080 canvas. */
const POSTER = { width: 1280, height: 720 }
const POSTER_MANIFEST = "src/lib/reel-posters.json"

/**
 * Record the poster so the gallery can render it.
 *
 * Fingerprinted on the image's own bytes rather than on the composition's
 * source, which is the same job `thumbnails.json` does for mockup cards and for
 * the same reason: the filename is reused on every render, so without a cache
 * key a reader who has seen the old poster keeps seeing it. Hashing the bytes
 * means the key moves exactly when the picture does — a re-render that changes
 * nothing visible does not invalidate anyone's cache.
 */
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

    /* In render mode the canvas is the only thing that should exist. Frames are
       taken from the canvas element, so anything overlapping it lands in the
       video — the toast viewport, and in dev the Agentation overlay, which sits
       exactly where a reel's end card does. Hiding every sibling is what lets
       `--url http://localhost:3000` be a usable fast path against a dev server
       instead of a render with a floating dev button baked into it. */
    await page.addStyleTag({
      content: "body > *:not([data-reel-root]) { display: none !important }",
    })

    /* The composition registers this once React can service a seek. Waiting on
       it rather than on a timeout is what makes the first frame reliable. */
    await page.waitForFunction(() => Boolean(window.__reel), null, {
      timeout: 30_000,
    })

    /* Fonts and screenshots have to be decoded before frame 0, or the opening
       second of the video renders in a fallback face with blank panels — and
       it is invisible until someone watches the export. */
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
        /* Lets a player start the video before the whole file has arrived,
           which is what Slack and Drive previews need. */
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

      /* Respect backpressure — ffmpeg encodes slower than Chromium can hand
         over frames, and ignoring this grows an unbounded buffer in Node. */
      if (!ffmpeg.stdin.write(buffer)) await once(ffmpeg.stdin, "drain")

      /* Frame 0 is almost always blank — a reel opens on an empty canvas and
         fades its first line in, so a poster taken there is a white rectangle.
         A third of the way in lands on a real beat. */
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
