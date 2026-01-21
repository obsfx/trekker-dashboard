import { eq, or } from "drizzle-orm";
import { getDb, tasks, dependencies, epics, projects, comments } from "../lib/db";
import { generateId } from "../lib/id-generator";
import { NotFoundError, ValidationError } from "../errors";
import type { Task, Dependency } from "../lib/db";

export interface TaskWithDeps extends Task {
  dependsOn: string[];
  blocks: string[];
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: string;
  priority?: number;
  epicId?: string | null;
  parentTaskId?: string | null;
  tags?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: number;
  epicId?: string | null;
  tags?: string | null;
}

function enrichWithDeps(task: Task, allDeps: Dependency[]): TaskWithDeps {
  return {
    ...task,
    dependsOn: allDeps.filter((d) => d.taskId === task.id).map((d) => d.dependsOnId),
    blocks: allDeps.filter((d) => d.dependsOnId === task.id).map((d) => d.taskId),
  };
}

async function getAllDeps(): Promise<Dependency[]> {
  const db = getDb();
  return db.select().from(dependencies);
}

async function assertEpicExists(epicId: string): Promise<void> {
  const db = getDb();
  const result = await db.select().from(epics).where(eq(epics.id, epicId));
  if (!result[0]) {
    throw new NotFoundError("Epic", epicId);
  }
}

async function assertTaskExists(taskId: string): Promise<void> {
  const db = getDb();
  const result = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!result[0]) {
    throw new NotFoundError("Task", taskId);
  }
}

async function getProject() {
  const db = getDb();
  const result = await db.select().from(projects);
  if (!result[0]) {
    throw new ValidationError("Project not initialized");
  }
  return result[0];
}

export async function getAll(): Promise<TaskWithDeps[]> {
  const db = getDb();
  const [allTasks, allDeps] = await Promise.all([
    db.select().from(tasks),
    db.select().from(dependencies),
  ]);
  return allTasks.map((task) => enrichWithDeps(task, allDeps));
}

export async function getById(id: string): Promise<TaskWithDeps> {
  const db = getDb();
  const [taskResult, allDeps] = await Promise.all([
    db.select().from(tasks).where(eq(tasks.id, id)),
    getAllDeps(),
  ]);

  if (!taskResult[0]) {
    throw new NotFoundError("Task", id);
  }

  return enrichWithDeps(taskResult[0], allDeps);
}

export async function create(input: CreateTaskInput): Promise<TaskWithDeps> {
  const db = getDb();

  if (input.epicId) {
    await assertEpicExists(input.epicId);
  }

  if (input.parentTaskId) {
    await assertTaskExists(input.parentTaskId);
  }

  const project = await getProject();
  const id = generateId("task");
  const now = new Date();

  const task = {
    id,
    projectId: project.id,
    epicId: input.epicId || null,
    parentTaskId: input.parentTaskId || null,
    title: input.title,
    description: input.description || null,
    status: input.status || "todo",
    priority: input.priority ?? 2,
    tags: input.tags || null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(tasks).values(task);

  return { ...task, dependsOn: [], blocks: [] };
}

export async function update(id: string, input: UpdateTaskInput): Promise<TaskWithDeps> {
  const db = getDb();

  // Verify task exists
  await getById(id);

  if (input.epicId) {
    await assertEpicExists(input.epicId);
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.status !== undefined) updates.status = input.status;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.tags !== undefined) updates.tags = input.tags;
  if (input.epicId !== undefined) updates.epicId = input.epicId;

  await db.update(tasks).set(updates).where(eq(tasks.id, id));

  return getById(id);
}

export async function remove(id: string): Promise<void> {
  const db = getDb();

  // Verify task exists
  await getById(id);

  // Cascade: delete comments
  await db.delete(comments).where(eq(comments.taskId, id));

  // Cascade: delete dependencies (both directions)
  await db
    .delete(dependencies)
    .where(or(eq(dependencies.taskId, id), eq(dependencies.dependsOnId, id)));

  // Cascade: delete subtasks
  const subtasks = await db.select().from(tasks).where(eq(tasks.parentTaskId, id));
  for (const subtask of subtasks) {
    await remove(subtask.id);
  }

  // Delete the task
  await db.delete(tasks).where(eq(tasks.id, id));
}

export async function getByTaskId(taskId: string): Promise<TaskWithDeps[]> {
  const db = getDb();
  const [taskResults, allDeps] = await Promise.all([
    db.select().from(tasks).where(eq(tasks.parentTaskId, taskId)),
    getAllDeps(),
  ]);
  return taskResults.map((task) => enrichWithDeps(task, allDeps));
}
