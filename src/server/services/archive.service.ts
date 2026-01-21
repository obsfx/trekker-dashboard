import { eq } from "drizzle-orm";
import { getDb, tasks, epics } from "../lib/db";

export interface BulkArchiveResult {
  tasksArchived: number;
  epicsArchived: number;
}

export async function bulkArchiveCompleted(): Promise<BulkArchiveResult> {
  const db = getDb();
  const now = new Date();

  // Get and archive completed tasks
  const completedTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.status, "completed"));

  for (const task of completedTasks) {
    await db
      .update(tasks)
      .set({ status: "archived", updatedAt: now })
      .where(eq(tasks.id, task.id));
  }

  // Get and archive completed epics
  const completedEpics = await db
    .select()
    .from(epics)
    .where(eq(epics.status, "completed"));

  for (const epic of completedEpics) {
    await db
      .update(epics)
      .set({ status: "archived", updatedAt: now })
      .where(eq(epics.id, epic.id));
  }

  return {
    tasksArchived: completedTasks.length,
    epicsArchived: completedEpics.length,
  };
}
