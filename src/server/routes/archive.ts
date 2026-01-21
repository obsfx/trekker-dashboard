import { Hono } from "hono";
import * as archiveService from "../services/archive.service";

const app = new Hono();

app.post("/", async (c) => {
  const result = await archiveService.bulkArchiveCompleted();
  return c.json(result);
});

export default app;
