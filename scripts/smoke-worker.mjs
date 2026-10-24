/** Exercise the built Worker: next build alone cannot catch adapter failures. */
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { createServer } from "node:net"
import { fileURLToPath } from "node:url"
import { setTimeout as delay } from "node:timers/promises"

const root = fileURLToPath(new URL("../", import.meta.url))
const socket = createServer()
await new Promise((resolve, reject) => {
  socket.once("error", reject)
  socket.listen(0, "127.0.0.1", resolve)
})
const { port } = socket.address()
await new Promise((resolve, reject) =>
  socket.close((error) => (error ? reject(error) : resolve())),
)

const origin = `http://127.0.0.1:${port}`
const worker = spawn(
  process.execPath,
  [
    "node_modules/wrangler/bin/wrangler.js",
    "dev",
    "--local",
    "--ip",
    "127.0.0.1",
    "--port",
    String(port),
    "--inspector-port",
    "0",
    "--show-interactive-dev-session=false",
  ],
  {
    cwd: root,
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
    stdio: ["ignore", "pipe", "pipe"],
  },
)

let logs = ""
let startError
for (const stream of [worker.stdout, worker.stderr]) {
  stream.on("data", (chunk) => {
    logs = (logs + chunk.toString()).slice(-32_000)
  })
}
const exited = new Promise((resolve) => {
  worker.once("exit", resolve)
  worker.once("error", (error) => {
    startError = error
    resolve()
  })
})

async function request(path, options) {
  return fetch(new URL(path, origin), {
    ...options,
    redirect: "manual",
    signal: AbortSignal.timeout(10_000),
  })
}

async function waitForWorker() {
  const deadline = Date.now() + 60_000
  while (Date.now() < deadline) {
    if (startError) throw startError
    if (worker.exitCode !== null || worker.signalCode !== null) {
      throw new Error("Wrangler exited before the Worker was ready")
    }
    try {
      const response = await request("/")
      await response.body?.cancel()
      return
    } catch {
      await delay(250)
    }
  }
  throw new Error("Timed out waiting for the local Worker")
}

try {
  await waitForWorker()
  for (const path of ["/", "/design-system", "/reels", "/live-scenarios"]) {
    const response = await request(path)
    assert.equal(response.status, 200, `${path} must render in Workers`)
    assert.match(response.headers.get("content-type") ?? "", /text\/html/)
    assert.match(await response.text(), /<title>[^<]+<\/title>/)
    console.log(`PASS ${path} -> 200 HTML`)
  }

  const missing = await request("/__worker_smoke_not_found__")
  assert.equal(missing.status, 404, "Unknown routes must render a 404")
  await missing.body?.cancel()
  console.log("PASS unknown route -> 404")

  const mcp = await request("/api/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "worker-smoke", version: "1.0.0" },
      },
    }),
  })
  assert.equal(mcp.status, 200, "The dynamic MCP route must initialize")
  const message = await mcp.json()
  assert.equal(message.id, 1)
  assert.equal(message.result?.serverInfo?.name, "sarj-design-lab")
  console.log("PASS /api/mcp -> 200 initialize")
} catch (error) {
  console.error(logs)
  throw error
} finally {
  worker.kill("SIGTERM")
  await Promise.race([exited, delay(5000, undefined, { ref: false })])
  if (worker.exitCode === null && worker.signalCode === null) {
    worker.kill("SIGKILL")
    await exited
  }
}
