import { zValidator } from '@hono/zod-validator';
import { HTTP_STATUS_CREATED, MAX_PRIORITY } from '@server/lib/constants';
import { EPIC_STATUSES } from '@server/lib/types';
import * as epicService from '@server/services/epic.service';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono();

// Schemas
const createEpicSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullish(),
  status: z.enum(EPIC_STATUSES).optional(),
  priority: z.number().int().min(0).max(MAX_PRIORITY).optional(),
});

const updateEpicSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(EPIC_STATUSES).optional(),
  priority: z.number().int().min(0).max(MAX_PRIORITY).optional(),
});

// Routes
app.get('/', async (c) => {
  const epics = await epicService.getAll();
  return c.json(epics);
});

app.post('/', zValidator('json', createEpicSchema), async (c) => {
  const input = c.req.valid('json');
  const epic = await epicService.create(input);
  return c.json(epic, HTTP_STATUS_CREATED);
});

app.get('/:id', async (c) => {
  const epic = await epicService.getById(c.req.param('id'));
  return c.json(epic);
});

app.put('/:id', zValidator('json', updateEpicSchema), async (c) => {
  const epic = await epicService.update(c.req.param('id'), c.req.valid('json'));
  return c.json(epic);
});

app.delete('/:id', async (c) => {
  await epicService.remove(c.req.param('id'));
  return c.json({ success: true });
});

export default app;
