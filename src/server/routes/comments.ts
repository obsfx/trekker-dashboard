import { Hono } from "hono";
import * as commentService from "../services/comment.service";

const app = new Hono();

app.delete("/:id", async (c) => {
  await commentService.remove(c.req.param("id"));
  return c.json({ success: true });
});

export default app;
