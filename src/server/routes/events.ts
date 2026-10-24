import { SSE_HEARTBEAT_INTERVAL_MS } from '@server/lib/constants';
import * as eventService from '@server/services/event.service';
import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';

const app = new Hono();

app.get('/', async (c) => {
  await eventService.initialize();

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      data: JSON.stringify({ type: 'connected' }),
    });

    const unsubscribe = eventService.subscribe((event) => {
      void stream.writeSSE({
        data: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
        }),
      });
    });

    const heartbeat = setInterval(() => {
      void stream.writeSSE({ event: 'ping', data: '' });
    }, SSE_HEARTBEAT_INTERVAL_MS);

    await new Promise<void>((resolve) => {
      stream.onAbort(() => {
        clearInterval(heartbeat);
        unsubscribe();
        resolve();
      });
    });
  });
});

export default app;
