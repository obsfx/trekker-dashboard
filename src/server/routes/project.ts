import { zValidator } from '@hono/zod-validator';
import * as projectService from '@server/services/project.service';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono();

const updateProjectConfigSchema = z.object({
  issuePrefix: z.string().min(1).optional(),
  epicPrefix: z.string().min(1).optional(),
  commentPrefix: z.string().min(1).optional(),
});

app.get('/', async (c) => {
  const project = await projectService.get();
  return c.json(project);
});

app.patch('/config', zValidator('json', updateProjectConfigSchema), async (c) => {
  const config = await projectService.updateConfig(c.req.valid('json'));
  return c.json(config);
});

export default app;
