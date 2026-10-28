import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"

import { createDesignLabServer } from "@/lib/mcp/tools"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version",
}

/** From the request so a local server hands out localhost. The env var still wins. */
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

  // Stateless: a new server and transport per request, since serverless instances share no memory.
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })

  await server.connect(transport)
  const response = await transport.handleRequest(request)

  // Safe to close here only because enableJsonResponse makes the body a complete string, not a stream.
  await server.close()

  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(CORS)) headers.set(key, value)

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

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
