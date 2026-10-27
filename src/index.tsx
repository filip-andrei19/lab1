// src/index.tsx — the same server with a framework
import { Hono } from "hono";
import { logger } from "hono/logger";
import { stringPages } from "./string-pages";
import { etaPages } from "./eta-pages";
import { team } from "./data";
import { Layout } from "./views/Layout";
import { serveStatic } from "@hono/bun";
import { readdir } from "node:fs/promises";

const app = new Hono();
app.use(logger()); // one line: every request logged with status and time

// --- RUTA / ---
app.get("/", (c) => {
  c.header("X-Course", "advanced-web");
  return c.text("Hello from Hono!\n");
});
// 405 pentru restul metodelor pe /
app.all("/", (c) => {
  c.header("Allow", "GET");
  return c.text("Method Not Allowed", 405);
});

// --- RUTA /echo ---
app.get("/echo", (c) => c.json({ hello: c.req.query("name") ?? "stranger" }));
app.post("/echo", async (c) => {
  const body = await c.req.text();
  return c.json({ youSent: body, contentType: c.req.header("content-type") });
});
// 405 pentru restul metodelor pe /echo
app.all("/echo", (c) => {
  c.header("Allow", "GET, POST");
  return c.text("Method Not Allowed", 405);
});

// --- RUTA /headers ---
app.get('/headers', (c) => {
  return c.json(c.req.header());
});
// 405 pentru restul metodelor pe /headers
app.all('/headers', (c) => {
  c.header("Allow", "GET");
  return c.text("Method Not Allowed", 405);
});

// --- RUTA /time ---
app.get("/time", (c) => {
  c.header("Cache-Control", "no-store");
  return c.json({ now: new Date().toISOString() });
});
// 405 pentru restul metodelor pe /time
app.all('/time', (c) => {
  c.header("Allow", "GET");
  return c.text("Method Not Allowed", 405);
});

// --- RUTA NOUĂ /status/:code ---
app.get('/status/:code', (c) => {
  const code = parseInt(c.req.param("code"));
  if (isNaN(code) || code < 200 || code > 599) {
    return c.text("Bad Request", 400);
  }
  return c.json({ status: code }, code as any);
});
// 405 pentru restul metodelor pe /status/:code
app.all('/status/:code', (c) => {
  c.header("Allow", "GET");
  return c.text("Method Not Allowed", 405);
});

// step 7b: a page that lists a folder
app.get("/files", async (c) => {
  const names = await readdir("./public");
  const files = names.map((name) => ({ name, size: Bun.file(`./public/${name}`).size }));
  return c.html(
    <Layout title="Files">
      <h1>public/</h1>
      <ul>
        {files.map((file) => (
          <li>
            <a href={`/${file.name}`}>{file.name}</a> — {file.size} bytes
          </li>
        ))}
      </ul>
    </Layout>,
  );
});

// --- EROAREA STANDARD 404 ---
app.notFound((c) => c.json({ error: "Not found", path: c.req.path }, 404));

app.route("/strings", stringPages);

app.route("/eta", etaPages);

// step 6: pages from components
app.get("/", (c) => {
  const name = c.req.query("name") ?? "stranger";
  return c.html(
    <Layout title="Home">
      <h1>Hello, {name}!</h1>
      <p>The office side of the building survey.</p>
    </Layout>,
  );
});

app.get("/team", (c) =>
  c.html(
    <Layout title="Team">
      <h1>Team</h1>
      <ul>
        {team.map((member) => (
          <li>{member}</li>
        ))}
      </ul>
    </Layout>,
  ),
);

app.use("*", serveStatic({ root: "./public" }));

export default app; // Bun sees a default export with fetch() and serves it