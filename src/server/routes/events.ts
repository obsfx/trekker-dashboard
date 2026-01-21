import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import * as eventService from "../services/event.service";

const app = new Hono();

app.get("/", async (c) => {
  await eventService.initialize();

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      data: JSON.stringify({ type: "connected" }),
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
        await stream.sleep(2000);
      }
    };

    c.req.raw.signal.addEventListener("abort", () => {
      running = false;
    });

    await checkForChanges();
  });
});

export default app;
