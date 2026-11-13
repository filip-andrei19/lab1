// apps/server/src/entrances.ts — the entrances API connected to the database
import { fieldErrors, NewEntrance } from "@office/shared";
import { Hono } from "hono";
import {
  createEntrance,
  deleteEntrance,
  listEntrances,
  searchEntrances,
} from "./db/entrances";

export const entrances = new Hono();

entrances.get("/", (c) => {
  const q = c.req.query("q");
  if (q) {
    return c.json(searchEntrances(q));
  }
  return c.json(listEntrances());
});

entrances.post("/", async (c) => {
  const body = await c.req.json();
  const result = NewEntrance.safeParse(body);

  if (!result.success) {
    c.status(400);
    return c.json({ errors: fieldErrors(result.error) });
  }

  c.status(201);
  return c.json(createEntrance(result.data));
});

entrances.delete("/:id", (c) => {
  // Am eliminat Number(...) pentru că ID-ul este acum UUID (string)
  if (deleteEntrance(c.req.param("id")) === 0) {
    c.status(404);
    return c.json({ error: "not found" });
  }
  c.status(204);
  return c.body(null);
});
