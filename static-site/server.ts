// server.ts — an HTTP server from nothing: no framework, just Bun.serve
const server = Bun.serve({
  // no port here: Bun uses $PORT if it is set, otherwise 3000
  async fetch(req) {
    const url = new URL(req.url);
    console.log(`${req.method} ${url.pathname}${url.search}`);

    // --- RUTA / ---
    if (url.pathname === "/") {
      if (req.method === "GET") {
        return new Response("Hello from a server I wrote!\n", {
          headers: { "X-Course": "advanced-web" },
        });
      }
      return new Response("Method Not Allowed", { status: 405, headers: { "Allow": "GET" } });
    }

    // --- RUTA /echo ---
    if (url.pathname === "/echo") {
      if (req.method === "GET") {
        const name = url.searchParams.get("name") ?? "stranger";
        return Response.json({ hello: name });
      }
      if (req.method === "POST") {
        const body = await req.text();
        return Response.json({
          youSent: body,
          contentType: req.headers.get("content-type"),
          length: body.length,
        });
      }
      return new Response("Method Not Allowed", { status: 405, headers: { "Allow": "GET, POST" } });
    }

    // --- RUTA /time ---
    if (url.pathname === "/time") {
      if (req.method === "GET") {
        return Response.json(
          { now: new Date().toISOString() },
          { headers: { "Cache-Control": "no-store" } },
        );
      }
      return new Response("Method Not Allowed", { status: 405, headers: { "Allow": "GET" } });
    }

    // --- RUTA /headers ---
    if (url.pathname === "/headers") {
      if (req.method === "GET") {
        const headers = Object.fromEntries(req.headers.entries());
        return Response.json(headers);
      }
      return new Response("Method Not Allowed", { status: 405, headers: { "Allow": "GET" } });
    }

    // --- RUTA NOUĂ /status/:code ---
    if (url.pathname.startsWith("/status/")) {
      if (req.method === "GET") {
        const code = parseInt(url.pathname.split("/")[2]);
        if (isNaN(code) || code < 200 || code > 599) {
          return new Response("Bad Request", { status: 400 });
        }
        return Response.json({ status: code }, { status: code });
      }
      return new Response("Method Not Allowed", { status: 405, headers: { "Allow": "GET" } });
    }

    // --- EROAREA STANDARD 404 ---
    return Response.json(
      { error: "Not found", path: url.pathname },
      { status: 404 },
    );
  },
});

console.log(`Listening on ${server.url}`);