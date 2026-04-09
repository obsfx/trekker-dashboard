import * as archiveService from '@server/services/archive.service';
import { Hono } from 'hono';

const app = new Hono();

app.post('/', async (c) => {
  const result = await archiveService.bulkArchiveCompleted();
  return c.json(result);
});

export default app;
