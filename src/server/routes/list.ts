import { Hono } from "hono";
import { getDb, getSqliteInstance } from "../lib/db";
import { ValidationError, DatabaseError } from "../errors";

const app = new Hono();

type ListEntityType = "epic" | "task" | "subtask";

interface ListResultRow {
  type: string;
  id: string;
  title: string;
  status: string;
  priority: number;
  parent_id: string | null;
  created_at: number;
  updated_at: number;
}

const VALID_SORT_FIELDS = ["created", "updated", "title", "priority", "status"];

function parseSort(sortStr: string): { field: string; direction: "asc" | "desc" }[] {
  const parts = sortStr.split(",").map((s) => s.trim());
  const result: { field: string; direction: "asc" | "desc" }[] = [];

  for (const part of parts) {
    const [field, dir] = part.split(":").map((s) => s.trim().toLowerCase());

    if (!VALID_SORT_FIELDS.includes(field)) {
      throw new ValidationError(
        `Invalid sort field: ${field}. Valid fields: ${VALID_SORT_FIELDS.join(", ")}`
      );
    }

    const direction = dir === "asc" ? "asc" : "desc";
    result.push({ field, direction });
  }

  return result;
}

app.get("/", async (c) => {
  getDb();
  const sqlite = getSqliteInstance();
  if (!sqlite) {
    throw new DatabaseError("Database not initialized");
  }

  const typeParam = c.req.query("type");
  const types = typeParam ? (typeParam.split(",") as ListEntityType[]) : undefined;
  const statusParam = c.req.query("status");
  const statuses = statusParam ? statusParam.split(",") : undefined;
  const priorityParam = c.req.query("priority");
  const priorities = priorityParam
    ? priorityParam.split(",").map((p) => parseInt(p, 10))
    : undefined;
  const since = c.req.query("since");
  const until = c.req.query("until");
  const sortParam = c.req.query("sort");
  const limit = parseInt(c.req.query("limit") || "50", 10);
  const page = parseInt(c.req.query("page") || "1", 10);
  const offset = (page - 1) * limit;

  // Build filter conditions
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (types && types.length > 0) {
    const placeholders = types.map(() => "?").join(", ");
    conditions.push(`type IN (${placeholders})`);
    params.push(...types);
  }

  if (statuses && statuses.length > 0) {
    const placeholders = statuses.map(() => "?").join(", ");
    conditions.push(`status IN (${placeholders})`);
    params.push(...statuses);
  }

  if (priorities && priorities.length > 0) {
    const placeholders = priorities.map(() => "?").join(", ");
    conditions.push(`priority IN (${placeholders})`);
    params.push(...priorities);
  }

  if (since) {
    const sinceDate = new Date(since);
    conditions.push("created_at >= ?");
    params.push(Math.floor(sinceDate.getTime() / 1000));
  }

  if (until) {
    const untilDate = new Date(until);
    conditions.push("created_at <= ?");
    params.push(Math.floor(untilDate.getTime() / 1000));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Build sort clause
  let orderClause = "ORDER BY created_at DESC";
  if (sortParam) {
    const sorts = parseSort(sortParam);
    const sortParts = sorts.map((s) => {
      const field =
        s.field === "created" ? "created_at" : s.field === "updated" ? "updated_at" : s.field;
      return `${field} ${s.direction.toUpperCase()}`;
    });
    orderClause = `ORDER BY ${sortParts.join(", ")}`;
  }

  // Base query using UNION ALL
  const baseQuery = `
    SELECT 'epic' as type, id, title, status, priority, NULL as parent_id, created_at, updated_at FROM epics
    UNION ALL
    SELECT 'task' as type, id, title, status, priority, epic_id as parent_id, created_at, updated_at FROM tasks WHERE parent_task_id IS NULL
    UNION ALL
    SELECT 'subtask' as type, id, title, status, priority, parent_task_id as parent_id, created_at, updated_at FROM tasks WHERE parent_task_id IS NOT NULL
  `;

  // Count total results
  const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) ${whereClause}`;
  const countResult = sqlite.query(countQuery).get(...params) as { total: number } | null;
  const total = countResult?.total ?? 0;

  // Get paginated results
  const selectQuery = `
    SELECT * FROM (${baseQuery})
    ${whereClause}
    ${orderClause}
    LIMIT ? OFFSET ?
  `;

  const results = sqlite.query(selectQuery).all(...params, limit, offset) as ListResultRow[];

  return c.json({
    total,
    page,
    limit,
    items: results.map((row) => ({
      type: row.type as ListEntityType,
      id: row.id,
      title: row.title,
      status: row.status,
      priority: row.priority,
      parentId: row.parent_id,
      createdAt: new Date(row.created_at * 1000).toISOString(),
      updatedAt: new Date(row.updated_at * 1000).toISOString(),
    })),
  });
});

export default app;
