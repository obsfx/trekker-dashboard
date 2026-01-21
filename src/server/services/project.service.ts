import { getDb, projects } from "../lib/db";
import type { Project } from "../lib/db";

export async function get(): Promise<Project | null> {
  const db = getDb();
  const result = await db.select().from(projects);
  return result[0] || null;
}
