import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { getDb, tasks, dependencies } from "../lib/db";
import { generateUuid } from "../lib/id-generator";

const app = new Hono();

async function wouldCreateCycle(
  taskId: string,
  dependsOnId: string
): Promise<boolean> {
  const db = getDb();
  const visited = new Set<string>();
  const stack = [dependsOnId];

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (current === taskId) {
      return true; // Found a path from dependsOnId to taskId
    }

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    const deps = await db
      .select({ dependsOnId: dependencies.dependsOnId })
      .from(dependencies)
      .where(eq(dependencies.taskId, current));

    for (const dep of deps) {
      if (!visited.has(dep.dependsOnId)) {
        stack.push(dep.dependsOnId);
      }
    }
  }

  return false;
}

// POST /api/dependencies - Create a dependency
app.post("/", async (c) => {
  try {
    const db = getDb();
    const body = await c.req.json();

    const { taskId, dependsOnId } = body;

    // Validate required fields
    if (!taskId || typeof taskId !== "string") {
      return c.json({ error: "taskId is required" }, 400);
    }

    if (!dependsOnId || typeof dependsOnId !== "string") {
      return c.json({ error: "dependsOnId is required" }, 400);
    }

    // Validate task can't depend on itself
    if (taskId === dependsOnId) {
      return c.json({ error: "A task cannot depend on itself" }, 400);
    }

    // Validate both tasks exist
    const [task, dependsOnTask] = await Promise.all([
      db.select().from(tasks).where(eq(tasks.id, taskId)),
      db.select().from(tasks).where(eq(tasks.id, dependsOnId)),
    ]);

    if (!task[0]) {
      return c.json({ error: "Task not found" }, 404);
    }

    if (!dependsOnTask[0]) {
      return c.json({ error: "Dependency task not found" }, 404);
    }

    // Validate dependency doesn't already exist
    const existingDep = await db
      .select()
      .from(dependencies)
      .where(
        and(
          eq(dependencies.taskId, taskId),
          eq(dependencies.dependsOnId, dependsOnId)
        )
      );

    if (existingDep[0]) {
      return c.json({ error: "Dependency already exists" }, 400);
    }

    // Validate adding this dependency won't create a cycle
    const wouldCycle = await wouldCreateCycle(taskId, dependsOnId);
    if (wouldCycle) {
      return c.json(
        { error: "Adding this dependency would create a cycle" },
        400
      );
    }

    const id = generateUuid();
    const now = new Date();

    const dependency = {
      id,
      taskId,
      dependsOnId,
      createdAt: now,
    };

    await db.insert(dependencies).values(dependency);

    return c.json(dependency, 201);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

// DELETE /api/dependencies - Delete a dependency
app.delete("/", async (c) => {
  try {
    const db = getDb();
    const taskId = c.req.query("taskId");
    const dependsOnId = c.req.query("dependsOnId");

    // Validate required params
    if (!taskId) {
      return c.json({ error: "taskId query param is required" }, 400);
    }

    if (!dependsOnId) {
      return c.json({ error: "dependsOnId query param is required" }, 400);
    }

    // Validate dependency exists
    const existingDep = await db
      .select()
      .from(dependencies)
      .where(
        and(
          eq(dependencies.taskId, taskId),
          eq(dependencies.dependsOnId, dependsOnId)
        )
      );

    if (!existingDep[0]) {
      return c.json({ error: "Dependency not found" }, 404);
    }

    await db
      .delete(dependencies)
      .where(
        and(
          eq(dependencies.taskId, taskId),
          eq(dependencies.dependsOnId, dependsOnId)
        )
      );

    return c.json({ success: true });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

export default app;
