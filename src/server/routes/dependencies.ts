import { zValidator } from '@hono/zod-validator';
import { ValidationError } from '@server/errors';
import { HTTP_STATUS_CREATED } from '@server/lib/constants';
import * as dependencyService from '@server/services/dependency.service';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono();

// Schemas
const createDependencySchema = z.object({
  taskId: z.string().min(1, 'taskId is required'),
  dependsOnId: z.string().min(1, 'dependsOnId is required'),
});

// Routes
app.post('/', zValidator('json', createDependencySchema), async (c) => {
  const input = c.req.valid('json');
  const dependency = await dependencyService.create(input);
  return c.json(dependency, HTTP_STATUS_CREATED);
});

app.delete('/', async (c) => {
  const taskId = c.req.query('taskId');
  const dependsOnId = c.req.query('dependsOnId');

  if (!taskId) {
    throw new ValidationError('taskId query param is required');
  }
  if (!dependsOnId) {
    throw new ValidationError('dependsOnId query param is required');
  }

  await dependencyService.remove(taskId, dependsOnId);
  return c.json({ success: true });
});

export default app;
