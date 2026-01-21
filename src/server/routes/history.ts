import { Hono } from "hono";
import { getDb, getSqliteInstance } from "../lib/db";
import { DatabaseError } from "../errors";

const app = new Hono();

type HistoryEntityType = "epic" | "task" | "subtask" | "comment" | "dependency";
type HistoryAction = "create" | "update" | "delete";

interface HistoryResultRow {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  snapshot: string | null;
  changes: string | null;
  created_at: number;
}

app.get("/", async (c) => {
  getDb();
  const sqlite = getSqliteInstance();
  if (!sqlite) {
    throw new DatabaseError("Database not initialized");
  }

  const entityId = c.req.query("entityId");
  const typeParam = c.req.query("type");
  const types = typeParam ? (typeParam.split(",") as HistoryEntityType[]) : undefined;
  const actionParam = c.req.query("action");
  const actions = actionParam ? (actionParam.split(",") as HistoryAction[]) : undefined;
  const since = c.req.query("since");
  const until = c.req.query("until");
  const limit = parseInt(c.req.query("limit") || "50", 10);
  const page = parseInt(c.req.query("page") || "1", 10);
  const offset = (page - 1) * limit;

  // Build WHERE conditions
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (entityId) {
    conditions.push("entity_id = ?");
    params.push(entityId);
  }

  if (types && types.length > 0) {
    const placeholders = types.map(() => "?").join(", ");
    conditions.push(`entity_type IN (${placeholders})`);
    params.push(...types);
  }

  if (actions && actions.length > 0) {
    const placeholders = actions.map(() => "?").join(", ");
    conditions.push(`action IN (${placeholders})`);
    params.push(...actions);
  }

  if (since) {
    const sinceDate = new Date(since);
    conditions.push("created_at >= ?");
    params.push(sinceDate.getTime());
  }

  if (until) {
    const untilDate = new Date(until);
    conditions.push("created_at <= ?");
    params.push(untilDate.getTime());
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Count total results
  const countQuery = `SELECT COUNT(*) as total FROM events ${whereClause}`;
  const countResult = sqlite.query(countQuery).get(...params) as { total: number } | null;
  const total = countResult?.total ?? 0;

  // Get paginated results (newest first)
  const selectQuery = `
    SELECT id, action, entity_type, entity_id, snapshot, changes, created_at
    FROM events
    ${whereClause}
    ORDER BY created_at DESC, id DESC
    LIMIT ? OFFSET ?
  `;

  const results = sqlite.query(selectQuery).all(...params, limit, offset) as HistoryResultRow[];

  return c.json({
    total,
    page,
    limit,
    events: results.map((row) => ({
      id: row.id,
      action: row.action as HistoryAction,
      entityType: row.entity_type as HistoryEntityType,
      entityId: row.entity_id,
      snapshot: row.snapshot ? JSON.parse(row.snapshot) : null,
      changes: row.changes ? JSON.parse(row.changes) : null,
      timestamp: new Date(row.created_at).toISOString(),
    })),
  });
});

export default app;
