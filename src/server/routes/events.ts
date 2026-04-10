import { EVENT_POLL_INTERVAL_MS } from '@server/lib/constants';
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

    let running = true;

    const checkForChanges = async () => {
      while (running) {
        try {
          const events = await eventService.getChanges();
          for (const event of events) {
            await stream.writeSSE({
              data: JSON.stringify({
                ...event,
                timestamp: new Date().toISOString(),
              }),
            });
          }
        } catch {
          // Ignore errors during polling
        }
        await stream.sleep(EVENT_POLL_INTERVAL_MS);
      }
    };

    c.req.raw.signal.addEventListener('abort', () => {
      running = false;
    });

    await checkForChanges();
  });
});

export default app;
