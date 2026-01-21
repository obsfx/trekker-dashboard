import { and, eq } from "drizzle-orm";
import { getDb, tasks, dependencies } from "../lib/db";
import { generateUuid } from "../lib/id-generator";
import { NotFoundError, ValidationError, ConflictError } from "../errors";
import type { Dependency } from "../lib/db";

export interface CreateDependencyInput {
  taskId: string;
  dependsOnId: string;
}

async function assertTaskExists(taskId: string, label: string): Promise<void> {
  const db = getDb();
  const result = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!result[0]) {
    throw new NotFoundError(label, taskId);
  }
}

async function wouldCreateCycle(taskId: string, dependsOnId: string): Promise<boolean> {
  const db = getDb();
  const visited = new Set<string>();
  const stack = [dependsOnId];

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (current === taskId) {
      return true;
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

export async function create(input: CreateDependencyInput): Promise<Dependency> {
  const db = getDb();
  const { taskId, dependsOnId } = input;

  // Validate task can't depend on itself
  if (taskId === dependsOnId) {
    throw new ValidationError("A task cannot depend on itself");
  }

  // Validate both tasks exist
  await assertTaskExists(taskId, "Task");
  await assertTaskExists(dependsOnId, "Dependency task");

  // Validate dependency doesn't already exist
  const existingDep = await db
    .select()
    .from(dependencies)
    .where(and(eq(dependencies.taskId, taskId), eq(dependencies.dependsOnId, dependsOnId)));

  if (existingDep[0]) {
    throw new ConflictError("Dependency already exists");
  }

  // Validate adding this dependency won't create a cycle
  const wouldCycle = await wouldCreateCycle(taskId, dependsOnId);
  if (wouldCycle) {
    throw new ValidationError("Adding this dependency would create a cycle");
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

  return dependency;
}

export async function remove(taskId: string, dependsOnId: string): Promise<void> {
  const db = getDb();

  // Validate dependency exists
  const existingDep = await db
    .select()
    .from(dependencies)
    .where(and(eq(dependencies.taskId, taskId), eq(dependencies.dependsOnId, dependsOnId)));

  if (!existingDep[0]) {
    throw new NotFoundError("Dependency", `${taskId} -> ${dependsOnId}`);
  }

  await db
    .delete(dependencies)
    .where(and(eq(dependencies.taskId, taskId), eq(dependencies.dependsOnId, dependsOnId)));
}
