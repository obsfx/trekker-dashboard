import { eq } from "drizzle-orm";
import { getDb, epics, projects } from "../lib/db";
import { generateId } from "../lib/id-generator";
import { NotFoundError, ValidationError } from "../errors";
import type { Epic } from "../lib/db";

export interface CreateEpicInput {
  title: string;
  description?: string | null;
  status?: string;
  priority?: number;
}

export interface UpdateEpicInput {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: number;
}

async function getProject() {
  const db = getDb();
  const result = await db.select().from(projects);
  if (!result[0]) {
    throw new ValidationError("Project not initialized");
  }
  return result[0];
}

export async function getAll(): Promise<Epic[]> {
  const db = getDb();
  return db.select().from(epics);
}

export async function getById(id: string): Promise<Epic> {
  const db = getDb();
  const result = await db.select().from(epics).where(eq(epics.id, id));

  if (!result[0]) {
    throw new NotFoundError("Epic", id);
  }

  return result[0];
}

export async function create(input: CreateEpicInput): Promise<Epic> {
  const db = getDb();
  const project = await getProject();
  const id = generateId("epic");
  const now = new Date();

  const epic = {
    id,
    projectId: project.id,
    title: input.title,
    description: input.description || null,
    status: input.status || "todo",
    priority: input.priority ?? 2,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(epics).values(epic);

  return epic;
}

export async function update(id: string, input: UpdateEpicInput): Promise<Epic> {
  const db = getDb();

  // Verify epic exists
  await getById(id);

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.status !== undefined) updates.status = input.status;
  if (input.priority !== undefined) updates.priority = input.priority;

  await db.update(epics).set(updates).where(eq(epics.id, id));

  return getById(id);
}

export async function remove(id: string): Promise<void> {
  const db = getDb();

  // Verify epic exists
  await getById(id);

  // Note: We don't delete tasks, we orphan them (set epicId to null)
  // This is safer as it preserves task data

  await db.delete(epics).where(eq(epics.id, id));
}
