import { createApp } from '@server/index';

const port = parseInt(process.env.PORT || '3001', 10);
console.log(`Server starting on http://localhost:${port}`);

Bun.serve({
  port,
  fetch: createApp().fetch,
});
