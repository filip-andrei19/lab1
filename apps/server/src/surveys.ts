import { NewSurvey } from "@office/shared";
import { Hono } from "hono";
import { createSurvey, listSurveys } from "./db/surveys";

export const surveys = new Hono();

surveys.get("/", (c) => {
  // Aici luăm entranceId direct ca string, conform noului contract
  const entranceId = c.req.query("entranceId");
  return c.json(listSurveys(entranceId));
});

surveys.post("/", async (c) => {
  const body = await c.req.json();
  const result = NewSurvey.safeParse(body);

  if (!result.success) {
    c.status(400);
    return c.json({ errors: result.error.flatten().fieldErrors });
  }

  c.status(201);
  return c.json(createSurvey(result.data));
});
