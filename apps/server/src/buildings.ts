import { NewBuilding } from "@office/shared";
import { Hono } from "hono";
import { createBuilding, deleteBuilding, listBuildings } from "./db/buildings";

export const buildings = new Hono();

buildings.get("/", (c) => c.json(listBuildings()));

buildings.post("/", async (c) => {
  const body = await c.req.json();
  const result = NewBuilding.safeParse(body);

  if (!result.success) {
    c.status(400);
    // În funcție de cum e configurat fieldErrors în proiectul tău, s-ar putea să fie nevoie doar de result.error
    return c.json({ errors: result.error.flatten().fieldErrors });
  }

  c.status(201);
  return c.json(createBuilding(result.data));
});

buildings.delete("/:id", (c) => {
  // Aici am scos Number(), conform noului contract
  if (deleteBuilding(c.req.param("id")) === 0) {
    c.status(404);
    return c.json({ error: "not found" });
  }
  c.status(204);
  return c.body(null);
});
