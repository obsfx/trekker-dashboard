import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import * as epicService from "../services/epic.service";
import { EPIC_STATUSES } from "../lib/types";

const app = new Hono();

// Schemas
const createEpicSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullish(),
  status: z.enum(EPIC_STATUSES).optional(),
  priority: z.number().int().min(0).max(5).optional(),
});

const updateEpicSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(EPIC_STATUSES).optional(),
  priority: z.number().int().min(0).max(5).optional(),
});

// Routes
app.get("/", async (c) => {
  const epics = await epicService.getAll();
  return c.json(epics);
});

app.post("/", zValidator("json", createEpicSchema), async (c) => {
  const input = c.req.valid("json");
  const epic = await epicService.create(input);
  return c.json(epic, 201);
});

app.get("/:id", async (c) => {
  const epic = await epicService.getById(c.req.param("id"));
  return c.json(epic);
});

app.put("/:id", zValidator("json", updateEpicSchema), async (c) => {
  const epic = await epicService.update(c.req.param("id"), c.req.valid("json"));
  return c.json(epic);
});

app.delete("/:id", async (c) => {
  await epicService.remove(c.req.param("id"));
  return c.json({ success: true });
});

export default app;
