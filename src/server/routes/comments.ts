import * as commentService from '@server/services/comment.service';
import { Hono } from 'hono';

const app = new Hono();

app.delete('/:id', async (c) => {
  await commentService.remove(c.req.param('id'));
  return c.json({ success: true });
});

export default app;
