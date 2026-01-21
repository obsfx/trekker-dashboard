import { eq } from "drizzle-orm";
import { getDb, comments, tasks } from "../lib/db";
import { generateId } from "../lib/id-generator";
import { NotFoundError } from "../errors";
import type { Comment } from "../lib/db";

export interface CreateCommentInput {
  author: string;
  content: string;
}

async function assertTaskExists(taskId: string): Promise<void> {
  const db = getDb();
  const result = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!result[0]) {
    throw new NotFoundError("Task", taskId);
  }
}

export async function getByTaskId(taskId: string): Promise<Comment[]> {
  const db = getDb();
  return db
    .select()
    .from(comments)
    .where(eq(comments.taskId, taskId))
    .orderBy(comments.createdAt);
}

export async function getById(id: string): Promise<Comment> {
  const db = getDb();
  const result = await db.select().from(comments).where(eq(comments.id, id));

  if (!result[0]) {
    throw new NotFoundError("Comment", id);
  }

  return result[0];
}

export async function create(taskId: string, input: CreateCommentInput): Promise<Comment> {
  const db = getDb();

  // Verify task exists
  await assertTaskExists(taskId);

  const id = generateId("comment");
  const now = new Date();

  const comment = {
    id,
    taskId,
    author: input.author,
    content: input.content,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(comments).values(comment);

  return comment;
}

export async function remove(id: string): Promise<void> {
  const db = getDb();

  // Verify comment exists
  await getById(id);

  await db.delete(comments).where(eq(comments.id, id));
}
