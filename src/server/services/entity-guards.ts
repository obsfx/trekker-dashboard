import { NotFoundError, ValidationError } from '@server/errors';
import type { Project } from '@server/lib/db';
import { epics, getDb, projects, tasks } from '@server/lib/db';
import { eq } from 'drizzle-orm';

export async function assertTaskExists(taskId: string, label = 'Task'): Promise<void> {
  const db = getDb();
  const result = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!result[0]) {
    throw new NotFoundError(label, taskId);
  }
}

export async function assertEpicExists(epicId: string): Promise<void> {
  const db = getDb();
  const result = await db.select().from(epics).where(eq(epics.id, epicId));
  if (!result[0]) {
    throw new NotFoundError('Epic', epicId);
  }
}

export async function getInitializedProject(): Promise<Project> {
  const db = getDb();
  const result = await db.select().from(projects);
  if (!result[0]) {
    throw new ValidationError('Project not initialized');
  }
  return result[0];
}
