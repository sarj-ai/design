/**
 * The design lab as an MCP server.
 *
 *   https://mock-up-repo.vercel.app/api/mcp
 *
 * Engineers point their editor at this endpoint and ask for a design by its
 * Linear ticket. The alternative it replaces is a person opening the index,
 * finding the right card, copying a command out of a menu and remembering
 * which directory to run it in.
 *
 * It is hosted here rather than shipped as a package on purpose: there is
 * nothing to install, nothing to keep in step with a deployment, and the tools
 * always describe the registry that is actually live. The trade is that it
 * cannot write to the caller's disk — so it returns a complete install brief
 * and the caller's agent runs the one command in it.
 */

import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"

import { createDesignLabServer } from "@/lib/mcp/tools"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Browser-based MCP clients preflight; editors do not. Costs nothing to allow. */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version",
}

/**
 * The origin to hand out in URLs and install commands.
 *
 * Taken from the request so a server running on localhost hands out localhost
 * — an install command that quietly points at production is the kind of thing
 * you notice only after wondering why your edits had no effect. The env var
 * still wins, which is how a preview deployment can publish the real origin.
 */
function originOf(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_REGISTRY_ORIGIN
  if (configured) return configured.replace(/\/$/, "")

  const host = request.headers.get("host")
  if (host) {
    const protocol =
      request.headers.get("x-forwarded-proto") ??
      (host.startsWith("localhost") ? "http" : "https")
    return `${protocol}://${host}`
  }

  return new URL(request.url).origin
}

export async function POST(request: Request) {
  const server = createDesignLabServer(originOf(request))

  /* Stateless: a server and a transport per request, no session held between
     invocations. Anything else needs somewhere to keep that session, and this
     runs on serverless functions that do not share memory. */
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })

  await server.connect(transport)
  const response = await transport.handleRequest(request)

  /* Safe to close here only because enableJsonResponse means the body is
     already a complete string rather than a stream still being written. */
  await server.close()

  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(CORS)) headers.set(key, value)

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/** No SSE stream and no session to end — say so rather than hanging. */
function methodNotAllowed() {
  return Response.json(
    {
      jsonrpc: "2.0",
      error: { code: -32000, message: "This server is stateless. Use POST." },
      id: null,
    },
    { status: 405, headers: { ...CORS, Allow: "POST, OPTIONS" } },
  )
}

export const GET = methodNotAllowed
export const DELETE = methodNotAllowed

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}
