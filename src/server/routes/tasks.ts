import { zValidator } from '@hono/zod-validator';
import { HTTP_STATUS_CREATED, MAX_PRIORITY } from '@server/lib/constants';
import { TASK_STATUSES } from '@server/lib/types';
import * as commentService from '@server/services/comment.service';
import * as taskService from '@server/services/task.service';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono();

// Schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullish(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.number().int().min(0).max(MAX_PRIORITY).optional(),
  epicId: z.string().nullish(),
  parentTaskId: z.string().nullish(),
  tags: z.string().nullish(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.number().int().min(0).max(MAX_PRIORITY).optional(),
  epicId: z.string().nullable().optional(),
  tags: z.string().nullable().optional(),
});

const createCommentSchema = z.object({
  author: z.string().min(1, 'Author is required'),
  content: z.string().min(1, 'Content is required'),
});

// Routes
app.get('/', async (c) => {
  const tasks = await taskService.getAll();
  return c.json(tasks);
});

app.post('/', zValidator('json', createTaskSchema), async (c) => {
  const input = c.req.valid('json');
  const task = await taskService.create(input);
  return c.json(task, HTTP_STATUS_CREATED);
});

app.get('/:id', async (c) => {
  const task = await taskService.getById(c.req.param('id'));
  return c.json(task);
});

app.put('/:id', zValidator('json', updateTaskSchema), async (c) => {
  const task = await taskService.update(c.req.param('id'), c.req.valid('json'));
  return c.json(task);
});

app.delete('/:id', async (c) => {
  await taskService.remove(c.req.param('id'));
  return c.json({ success: true });
});

// Nested comment routes
app.get('/:id/comments', async (c) => {
  const comments = await commentService.getByTaskId(c.req.param('id'));
  return c.json(comments);
});

app.post('/:id/comments', zValidator('json', createCommentSchema), async (c) => {
  const comment = await commentService.create(c.req.param('id'), c.req.valid('json'));
  return c.json(comment, HTTP_STATUS_CREATED);
});

export default app;
