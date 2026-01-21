import { Hono } from "hono";
import * as projectService from "../services/project.service";

const app = new Hono();

app.get("/", async (c) => {
  const project = await projectService.get();
  return c.json(project);
});

export default app;
