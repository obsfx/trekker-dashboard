import { DatabaseError } from '@server/errors';
import { DEFAULT_HISTORY_QUERY_LIMIT } from '@server/lib/constants';
import { getDb, getSqliteInstance } from '@server/lib/db';
import { addInCondition, parseCsvQuery, parsePagination, type SqlParam } from '@server/lib/query';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono();

type HistoryEntityType = 'epic' | 'task' | 'subtask' | 'comment' | 'dependency';
type HistoryAction = 'create' | 'update' | 'delete';

interface HistoryResultRow {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  snapshot: string | null;
  changes: string | null;
  created_at: number;
}

const historyValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const historySnapshotSchema = z.record(z.string(), historyValueSchema);
const historyChangesSchema = z.record(
  z.string(),
  z.object({ from: historyValueSchema, to: historyValueSchema })
);
const historyTitleSchema = z.string().min(1);

type HistorySnapshot = z.infer<typeof historySnapshotSchema>;
type HistoryChanges = z.infer<typeof historyChangesSchema>;

function parseHistorySnapshot(value: string | null): HistorySnapshot | null {
  if (!value) {
    return null;
  }

  return historySnapshotSchema.parse(JSON.parse(value));
}

function parseHistoryChanges(value: string | null): HistoryChanges | null {
  if (!value) {
    return null;
  }

  return historyChangesSchema.parse(JSON.parse(value));
}

function deriveHistoryTitle(
  snapshot: HistorySnapshot | null,
  changes: HistoryChanges | null
): string | null {
  const candidates = [snapshot?.title, changes?.title?.to, changes?.title?.from];
  for (const candidate of candidates) {
    const parsed = historyTitleSchema.safeParse(candidate);
    if (parsed.success) {
      return parsed.data;
    }
  }

  return null;
}

function toHistoryEvent(row: HistoryResultRow) {
  const snapshot = parseHistorySnapshot(row.snapshot);
  const changes = parseHistoryChanges(row.changes);

  return {
    id: row.id,
    action: row.action as HistoryAction,
    entityType: row.entity_type as HistoryEntityType,
    entityId: row.entity_id,
    title: deriveHistoryTitle(snapshot, changes),
    snapshot,
    changes,
    timestamp: new Date(row.created_at).toISOString(),
  };
}

app.get('/', async (c) => {
  getDb();
  const sqlite = getSqliteInstance();
  if (!sqlite) {
    throw new DatabaseError('Database not initialized');
  }

  const entityId = c.req.query('entityId');
  const typeParam = c.req.query('type');
  const types = parseCsvQuery(typeParam) as HistoryEntityType[] | undefined;
  const actionParam = c.req.query('action');
  const actions = parseCsvQuery(actionParam) as HistoryAction[] | undefined;
  const since = c.req.query('since');
  const until = c.req.query('until');
  const { limit, page, offset } = parsePagination(
    c.req.query('limit'),
    c.req.query('page'),
    DEFAULT_HISTORY_QUERY_LIMIT
  );

  // Build WHERE conditions
  const conditions: string[] = [];
  const params: SqlParam[] = [];

  if (entityId) {
    conditions.push('entity_id = ?');
    params.push(entityId);
  }

  addInCondition(conditions, params, 'entity_type', types);

  addInCondition(conditions, params, 'action', actions);

  if (since) {
    const sinceDate = new Date(since);
    conditions.push('created_at >= ?');
    params.push(sinceDate.getTime());
  }

  if (until) {
    const untilDate = new Date(until);
    conditions.push('created_at <= ?');
    params.push(untilDate.getTime());
  }

  let whereClause = '';
  if (conditions.length > 0) {
    whereClause = `WHERE ${conditions.join(' AND ')}`;
  }

  // Count total results
  const countQuery = `SELECT COUNT(*) as total FROM events ${whereClause}`;
  const countResult = sqlite.query(countQuery).get(...params) as { total: number } | null;
  let total = 0;
  if (countResult) {
    total = countResult.total;
  }

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
    events: results.map(toHistoryEvent),
  });
});

export { app as historyRoutes };
