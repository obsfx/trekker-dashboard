import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb, tasks, dependencies, epics, projects } from "../lib/db";
import { generateId } from "../lib/id-generator";
import { TASK_STATUSES } from "../lib/types";

const app = new Hono();

async function getTaskWithDeps(taskId: string) {
  const db = getDb();

  const [taskResult, allDeps] = await Promise.all([
    db.select().from(tasks).where(eq(tasks.id, taskId)),
    db.select().from(dependencies),
  ]);

  if (!taskResult[0]) {
    return null;
  }

  const task = taskResult[0];
  return {
    ...task,
    dependsOn: allDeps
      .filter((d) => d.taskId === task.id)
      .map((d) => d.dependsOnId),
    blocks: allDeps
      .filter((d) => d.dependsOnId === task.id)
      .map((d) => d.taskId),
  };
}

// GET /api/tasks - List all tasks
app.get("/", async (c) => {
  try {
    const db = getDb();
    const [allTasks, allDeps] = await Promise.all([
      db.select().from(tasks),
      db.select().from(dependencies),
    ]);

    const tasksWithDeps = allTasks.map((task) => ({
      ...task,
      dependsOn: allDeps
        .filter((d) => d.taskId === task.id)
        .map((d) => d.dependsOnId),
      blocks: allDeps
        .filter((d) => d.dependsOnId === task.id)
        .map((d) => d.taskId),
    }));

    return c.json(tasksWithDeps);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// POST /api/tasks - Create a task
app.post("/", async (c) => {
  try {
    const db = getDb();
    const body = await c.req.json();

    const {
      title,
      description,
      status = "todo",
      priority = 2,
      epicId,
      parentTaskId,
      tags,
    } = body;

    // Validate title
    if (!title || typeof title !== "string") {
      return c.json({ error: "Title is required" }, 400);
    }

    // Validate status
    if (status && !TASK_STATUSES.includes(status)) {
      return c.json({ error: `Invalid status: ${status}` }, 400);
    }

    // Validate priority
    if (priority < 0 || priority > 5) {
      return c.json({ error: "Priority must be 0-5" }, 400);
    }

    // Validate epic exists if provided
    if (epicId) {
      const epic = await db.select().from(epics).where(eq(epics.id, epicId));
      if (!epic[0]) {
        return c.json({ error: "Epic not found" }, 400);
      }
    }

    // Validate parent task exists if provided
    if (parentTaskId) {
      const parentTask = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, parentTaskId));
      if (!parentTask[0]) {
        return c.json({ error: "Parent task not found" }, 400);
      }
    }

    // Get project
    const project = await db.select().from(projects);
    if (!project[0]) {
      return c.json({ error: "Project not initialized" }, 400);
    }

    const id = generateId("task");
    const now = new Date();

    const task = {
      id,
      projectId: project[0].id,
      epicId: epicId || null,
      parentTaskId: parentTaskId || null,
      title,
      description: description || null,
      status,
      priority,
      tags: tags || null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(tasks).values(task);

    return c.json({ ...task, dependsOn: [], blocks: [] }, 201);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// GET /api/tasks/:id - Get a single task
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const task = await getTaskWithDeps(id);

    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }

    return c.json(task);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// PUT /api/tasks/:id - Update a task
app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = getDb();
    const body = await c.req.json();

    const existing = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!existing[0]) {
      return c.json({ error: "Task not found" }, 404);
    }

    const { title, description, status, priority, tags, epicId } = body;

    // Validate status if provided
    if (status && !TASK_STATUSES.includes(status)) {
      return c.json({ error: `Invalid status: ${status}` }, 400);
    }

    // Validate priority if provided
    if (priority !== undefined && (priority < 0 || priority > 5)) {
      return c.json({ error: "Priority must be 0-5" }, 400);
    }

    // Validate epic exists if provided
    if (epicId) {
      const epic = await db.select().from(epics).where(eq(epics.id, epicId));
      if (!epic[0]) {
        return c.json({ error: "Epic not found" }, 400);
      }
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (tags !== undefined) updates.tags = tags;
    if (epicId !== undefined) updates.epicId = epicId;

    await db.update(tasks).set(updates).where(eq(tasks.id, id));

    const updated = await getTaskWithDeps(id);
    return c.json(updated);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// DELETE /api/tasks/:id - Delete a task
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = getDb();

    const existing = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!existing[0]) {
      return c.json({ error: "Task not found" }, 404);
    }

    await db.delete(tasks).where(eq(tasks.id, id));

    return c.json({ success: true });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// GET /api/tasks/:id/comments - Get comments for a task
app.get("/:id/comments", async (c) => {
  try {
    const id = c.req.param("id");
    const db = getDb();
    const { comments } = await import("../lib/db");

    const taskComments = await db
      .select()
      .from(comments)
      .where(eq(comments.taskId, id))
      .orderBy(comments.createdAt);

    return c.json(taskComments);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// POST /api/tasks/:id/comments - Add a comment to a task
app.post("/:id/comments", async (c) => {
  try {
    const taskId = c.req.param("id");
    const db = getDb();
    const { comments } = await import("../lib/db");
    const body = await c.req.json();

    const { author, content } = body;

    if (!author || typeof author !== "string") {
      return c.json({ error: "Author is required" }, 400);
    }

    if (!content || typeof content !== "string") {
      return c.json({ error: "Content is required" }, 400);
    }

    // Verify task exists
    const task = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task[0]) {
      return c.json({ error: "Task not found" }, 404);
    }

    const id = `CMT-${Date.now()}`;
    const now = new Date();

    const comment = {
      id,
      taskId,
      author,
      content,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(comments).values(comment);

    return c.json(comment, 201);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

export default app;
