import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb, epics, projects } from "../lib/db";
import { generateId } from "../lib/id-generator";
import { EPIC_STATUSES } from "../lib/types";

const app = new Hono();

// GET /api/epics - List all epics
app.get("/", async (c) => {
  try {
    const db = getDb();
    const allEpics = await db.select().from(epics);
    return c.json(allEpics);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// POST /api/epics - Create an epic
app.post("/", async (c) => {
  try {
    const db = getDb();
    const body = await c.req.json();

    const { title, description, status = "todo", priority = 2 } = body;

    if (!title || typeof title !== "string") {
      return c.json({ error: "Title is required" }, 400);
    }

    if (status && !EPIC_STATUSES.includes(status)) {
      return c.json({ error: `Invalid status: ${status}` }, 400);
    }

    if (priority < 0 || priority > 5) {
      return c.json({ error: "Priority must be 0-5" }, 400);
    }

    const project = await db.select().from(projects);
    if (!project[0]) {
      return c.json({ error: "Project not initialized" }, 400);
    }

    const id = generateId("epic");
    const now = new Date();

    const epic = {
      id,
      projectId: project[0].id,
      title,
      description: description || null,
      status,
      priority,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(epics).values(epic);

    return c.json(epic, 201);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// GET /api/epics/:id - Get a single epic
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = getDb();
    const result = await db.select().from(epics).where(eq(epics.id, id));

    if (!result[0]) {
      return c.json({ error: "Epic not found" }, 404);
    }

    return c.json(result[0]);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// PUT /api/epics/:id - Update an epic
app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = getDb();
    const body = await c.req.json();

    const existing = await db.select().from(epics).where(eq(epics.id, id));
    if (!existing[0]) {
      return c.json({ error: "Epic not found" }, 404);
    }

    const { title, description, status, priority } = body;

    if (status && !EPIC_STATUSES.includes(status)) {
      return c.json({ error: `Invalid status: ${status}` }, 400);
    }

    if (priority !== undefined && (priority < 0 || priority > 5)) {
      return c.json({ error: "Priority must be 0-5" }, 400);
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;

    await db.update(epics).set(updates).where(eq(epics.id, id));

    const updated = await db.select().from(epics).where(eq(epics.id, id));
    return c.json(updated[0]);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// DELETE /api/epics/:id - Delete an epic
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = getDb();

    const existing = await db.select().from(epics).where(eq(epics.id, id));
    if (!existing[0]) {
      return c.json({ error: "Epic not found" }, 404);
    }

    await db.delete(epics).where(eq(epics.id, id));

    return c.json({ success: true });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

export default app;
