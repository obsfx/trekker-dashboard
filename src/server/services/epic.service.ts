import { NotFoundError } from '@server/errors';
import { DEFAULT_PRIORITY } from '@server/lib/constants';
import type { Epic } from '@server/lib/db';
import { epics, getDb, tasks } from '@server/lib/db';
import { generateId } from '@server/lib/id-generator';
import { getInitializedProject } from '@server/services/entity-guards';
import { eq } from 'drizzle-orm';

interface CreateEpicInput {
  title: string;
  description?: string | null;
  status?: string;
  priority?: number;
}

interface UpdateEpicInput {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: number;
}

export async function getAll(): Promise<Epic[]> {
  const db = getDb();
  return db.select().from(epics);
}

export async function getById(id: string): Promise<Epic> {
  const db = getDb();
  const result = await db.select().from(epics).where(eq(epics.id, id));

  if (!result[0]) {
    throw new NotFoundError('Epic', id);
  }

  return result[0];
}

export async function create(input: CreateEpicInput): Promise<Epic> {
  const db = getDb();
  const project = await getInitializedProject();
  const id = await generateId('epic');
  const now = new Date();

  const epic = {
    id,
    projectId: project.id,
    title: input.title,
    description: input.description || null,
    status: input.status || 'todo',
    priority: input.priority ?? DEFAULT_PRIORITY,
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

  await db
    .update(epics)
    .set({
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      updatedAt: new Date(),
    })
    .where(eq(epics.id, id));

  return getById(id);
}

export async function remove(id: string): Promise<void> {
  const db = getDb();

  // Verify epic exists
  await getById(id);

  await db.update(tasks).set({ epicId: null, updatedAt: new Date() }).where(eq(tasks.epicId, id));

  await db.delete(epics).where(eq(epics.id, id));
}
