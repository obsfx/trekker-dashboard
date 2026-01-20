import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb, comments } from "../lib/db";

const app = new Hono();

// DELETE /api/comments/:id - Delete a comment
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = getDb();

    const existing = await db.select().from(comments).where(eq(comments.id, id));
    if (!existing[0]) {
      return c.json({ error: "Comment not found" }, 404);
    }

    await db.delete(comments).where(eq(comments.id, id));

    return c.json({ success: true });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

export default app;
