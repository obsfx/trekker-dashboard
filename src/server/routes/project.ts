import { Hono } from "hono";
import { getDb, projects } from "../lib/db";

const app = new Hono();

// GET /api/project - Get the project
app.get("/", async (c) => {
  try {
    const db = getDb();
    const result = await db.select().from(projects);
    return c.json(result[0] || null);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

export default app;
