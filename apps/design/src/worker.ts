interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  ASSETS: AssetsBinding;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set("X-Robots-Tag", "all");

    return new Response(response.body, {
      headers,
      status: response.status,
      statusText: response.statusText,
    });
  },
};
