/// <reference types="bun" />
import { serve } from "bun";

async function handleEcho(req: Request, url: URL): Promise<Response> {
  if (req.method === "GET") {
    const name = url.searchParams.get("name") ?? "stranger";
    return Response.json({ hello: name });
  }
  if (req.method === "POST") {
    const body = await req.text();
    return Response.json({
      contentType: req.headers.get("content-type"),
      length: body.length,
      youSent: body,
    });
  }
  return new Response("Method Not Allowed", {
    headers: { Allow: "GET, POST" },
    status: 405,
  });
}

function handleStatus(req: Request, url: URL): Response {
  if (req.method === "GET") {
    const code = Number.parseInt(url.pathname.split("/")[2] || "", 10);
    if (Number.isNaN(code) || code < 200 || code > 599) {
      return new Response("Bad Request", { status: 400 });
    }
    return Response.json({ status: code }, { status: code });
  }
  return new Response("Method Not Allowed", {
    headers: { Allow: "GET" },
    status: 405,
  });
}

const server = serve({
  // no port here: Bun uses $PORT if it is set, otherwise 3000
  fetch(req: Request): Response | Promise<Response> {
    const url = new URL(req.url);
    console.log(`${req.method} ${url.pathname}${url.search}`);

    if (url.pathname === "/") {
      if (req.method === "GET") {
        return new Response("Hello from a server I wrote!\n", {
          headers: { "X-Course": "advanced-web" },
        });
      }
      return new Response("Method Not Allowed", {
        headers: { Allow: "GET" },
        status: 405,
      });
    }

    if (url.pathname === "/echo") {
      return handleEcho(req, url);
    }

    if (url.pathname === "/time") {
      if (req.method === "GET") {
        return Response.json(
          { now: new Date().toISOString() },
          { headers: { "Cache-Control": "no-store" } }
        );
      }
      return new Response("Method Not Allowed", {
        headers: { Allow: "GET" },
        status: 405,
      });
    }

    if (url.pathname === "/headers") {
      if (req.method === "GET") {
        return Response.json(Object.fromEntries(req.headers.entries()));
      }
      return new Response("Method Not Allowed", {
        headers: { Allow: "GET" },
        status: 405,
      });
    }

    if (url.pathname.startsWith("/status/")) {
      return handleStatus(req, url);
    }

    return Response.json(
      { error: "Not found", path: url.pathname },
      { status: 404 }
    );
  },
});

console.log(`Listening on ${server.url}`);
