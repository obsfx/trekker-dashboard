import { DatabaseError } from '@server/errors';
import { DEFAULT_HISTORY_QUERY_LIMIT, DEFAULT_PAGE } from '@server/lib/constants';
import { getDb, getSqliteInstance } from '@server/lib/db';
import { parseCsvQuery, parseQueryNumber } from '@server/lib/query';
import { Hono } from 'hono';

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

function parseHistoryJson(value: string | null): unknown {
  if (!value) {
    return null;
  }

  return JSON.parse(value);
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
  const limit = parseQueryNumber(c.req.query('limit'), DEFAULT_HISTORY_QUERY_LIMIT);
  const page = parseQueryNumber(c.req.query('page'), DEFAULT_PAGE);
  const offset = (page - 1) * limit;

  // Build WHERE conditions
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (entityId) {
    conditions.push('entity_id = ?');
    params.push(entityId);
  }

  if (types && types.length > 0) {
    const placeholders = types.map(() => '?').join(', ');
    conditions.push(`entity_type IN (${placeholders})`);
    params.push(...types);
  }

  if (actions && actions.length > 0) {
    const placeholders = actions.map(() => '?').join(', ');
    conditions.push(`action IN (${placeholders})`);
    params.push(...actions);
  }

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
    events: results.map((row) => ({
      id: row.id,
      action: row.action as HistoryAction,
      entityType: row.entity_type as HistoryEntityType,
      entityId: row.entity_id,
      snapshot: parseHistoryJson(row.snapshot),
      changes: parseHistoryJson(row.changes),
      timestamp: new Date(row.created_at).toISOString(),
    })),
  });
});

export default app;
