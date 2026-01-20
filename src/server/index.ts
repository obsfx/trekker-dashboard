import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { existsSync } from "fs";
import { resolve, dirname } from "path";

import tasksRoutes from "./routes/tasks";
import epicsRoutes from "./routes/epics";
import commentsRoutes from "./routes/comments";
import dependenciesRoutes from "./routes/dependencies";
import projectRoutes from "./routes/project";
import eventsRoutes from "./routes/events";

const app = new Hono();

// CORS for development
app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
  })
);

// Mount API routes
app.route("/api/tasks", tasksRoutes);
app.route("/api/epics", epicsRoutes);
app.route("/api/comments", commentsRoutes);
app.route("/api/dependencies", dependenciesRoutes);
app.route("/api/project", projectRoutes);
app.route("/api/events", eventsRoutes);

// Serve static files in production
const scriptDir = dirname(import.meta.url.replace("file://", ""));
const distClientPath = resolve(scriptDir, "../../dist/client");

if (existsSync(distClientPath)) {
  app.use("/*", serveStatic({ root: distClientPath }));

  // SPA fallback - serve index.html for non-API routes
  app.get("*", serveStatic({ path: resolve(distClientPath, "index.html") }));
}

// Export for CLI to use
export default app;

// Start server if run directly
const port = parseInt(process.env.PORT || "3001", 10);
console.log(`Server starting on http://localhost:${port}`);

export const server = Bun.serve({
  port,
  fetch: app.fetch,
});
