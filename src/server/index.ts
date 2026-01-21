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
import searchRoutes from "./routes/search";
import listRoutes from "./routes/list";
import historyRoutes from "./routes/history";
import archiveRoutes from "./routes/archive";
import { errorHandler } from "./middleware/error-handler";

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
app.route("/api/search", searchRoutes);
app.route("/api/list", listRoutes);
app.route("/api/history", historyRoutes);
app.route("/api/bulk-archive-completed", archiveRoutes);

// Centralized error handling
app.onError(errorHandler);

// Serve static files in production
const scriptDir = dirname(import.meta.url.replace("file://", ""));
const distClientPath = resolve(scriptDir, "../../dist/client");

if (existsSync(distClientPath)) {
  const indexPath = resolve(distClientPath, "index.html");

  const serveIndex = async () => {
    if (existsSync(indexPath)) {
      const file = Bun.file(indexPath);
      return new Response(file, {
        headers: { "Content-Type": "text/html" },
      });
    }
    return new Response("Not Found", { status: 404 });
  };

  // SPA routes - serve index.html for client-side routing
  app.get("/", async () => serveIndex());
  app.get("/list", async () => serveIndex());
  app.get("/history", async () => serveIndex());

  // Serve static files (JS, CSS, images, etc.)
  app.use(
    "/*",
    serveStatic({
      root: distClientPath,
    })
  );
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
