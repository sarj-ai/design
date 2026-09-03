/**
 * Capture every mockup.
 *
 *   npm run shots
 *   npm run shots -- --routes /reports,/knowledge-bases
 *   npm run shots -- --url http://localhost:3000 --skip-build
 *
 * Why this exists: fourteen mockups is fourteen screenshots by hand, so in
 * practice nobody took them, and review happened against whatever was open.
 *
 * The workspace is light and left-to-right, so there is one pass and one
 * screenshot per route — no theme, no direction, no mode subfolders.
 *
 * Runs against a production build by default. The dev server renders the
 * Agentation overlay and compiles routes on first visit, neither of which
 * belongs in a review screenshot.
 *
 * What it does NOT do: open dialogs, drawers, or any state behind a click. It
 * captures each route as it loads. Mockups whose subject is an overlay should
 * open it on mount if they want it in the sweep.
 */

import { spawn } from "node:child_process"
import { mkdir, rm } from "node:fs/promises"
import path from "node:path"

/* CJS: the named export only exists on `default`. */
import nextEnv from "@next/env"
import process from "node:process"

import { chromium } from "playwright"

const DEFAULTS = {
  routes: "",
  out: "screenshots",
  url: "",
  port: "3100",
  width: "1440",
  height: "900",
}

function parseArgs(argv) {
  const args = { ...DEFAULTS, "skip-build": false }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg.startsWith("--")) continue

    const key = arg.slice(2)
    if (key === "skip-build") {
      args["skip-build"] = true
      continue
    }
    if (!(key in DEFAULTS)) {
      throw new Error(`Unknown option --${key}`)
    }
    args[key] = argv[++i] ?? ""
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

/** The index is the registry — every mockup is a card with a link on it. */
async function discoverRoutes(page, baseUrl) {
  await page.goto(baseUrl, { waitUntil: "networkidle" })

  const hrefs = await page.$$eval("main a[href^='/']", (links) =>
    links.map((link) => link.getAttribute("href")),
  )

  return ["/", ...new Set(hrefs.filter((href) => href && href !== "/"))]
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

function fileNameFor(route) {
  return route === "/" ? "index" : route.replace(/^\//, "").replaceAll("/", "-")
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
  await rm(outDir, { recursive: true, force: true })

  const browser = await chromium.launch()
  let captured = 0

  try {
    const probe = await browser.newPage({ ...credentials() })
    const routes = args.routes
      ? args.routes
          .split(",")
          .map((route) => route.trim())
          .filter(Boolean)
      : await discoverRoutes(probe, baseUrl)
    await probe.close()

    console.log(`${routes.length} routes → ${outDir}\n`)
    await mkdir(outDir, { recursive: true })

    const context = await browser.newContext({
      /* The site password, when one is set — `src/proxy.ts` gates every route
         and every asset, so a capture without this comes back blank. */
      ...credentials(),
      viewport: { width: Number(args.width), height: Number(args.height) },
      deviceScaleFactor: 2,
    })

    const page = await context.newPage()

    for (const route of routes) {
      await page.goto(captureUrl(route, baseUrl), {
        waitUntil: "networkidle",
      })
      await page.evaluate(() => document.fonts.ready)

      const file = path.join(outDir, `${fileNameFor(route)}.png`)
      await page.screenshot({ path: file, fullPage: true })
      captured += 1
      console.log(`  ${route}`)
    }

    await context.close()
  } finally {
    await browser.close()
    server?.kill()
  }

  console.log(`\n${captured} screenshots in ${outDir}`)
}

await main()
