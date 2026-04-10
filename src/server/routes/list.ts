import { DatabaseError, ValidationError } from '@server/errors';
import { DEFAULT_LIST_QUERY_LIMIT, DEFAULT_PAGE, SQLITE_MILLISECONDS } from '@server/lib/constants';
import { getDb, getSqliteInstance } from '@server/lib/db';
import { parseCsvQuery, parseNumberCsvQuery, parseQueryNumber } from '@server/lib/query';
import { Hono } from 'hono';

const app = new Hono();

type ListEntityType = 'epic' | 'task' | 'subtask';

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

const VALID_SORT_FIELDS = ['created', 'updated', 'title', 'priority', 'status'];

function getSortField(field: string): string {
  if (field === 'created') {
    return 'created_at';
  }

  if (field === 'updated') {
    return 'updated_at';
  }

  return field;
}

function parseSort(sortStr: string): { field: string; direction: 'asc' | 'desc' }[] {
  const parts = sortStr.split(',').map((s) => s.trim());
  const result: { field: string; direction: 'asc' | 'desc' }[] = [];

  for (const part of parts) {
    const [field, dir] = part.split(':').map((s) => s.trim().toLowerCase());

    if (!VALID_SORT_FIELDS.includes(field)) {
      throw new ValidationError(
        `Invalid sort field: ${field}. Valid fields: ${VALID_SORT_FIELDS.join(', ')}`
      );
    }

    let direction: 'asc' | 'desc' = 'desc';
    if (dir === 'asc') {
      direction = 'asc';
    }

    result.push({ field, direction });
  }

  return result;
}

app.get('/', async (c) => {
  getDb();
  const sqlite = getSqliteInstance();
  if (!sqlite) {
    throw new DatabaseError('Database not initialized');
  }

  const typeParam = c.req.query('type');
  const types = parseCsvQuery(typeParam) as ListEntityType[] | undefined;
  const statusParam = c.req.query('status');
  const statuses = parseCsvQuery(statusParam);
  const priorityParam = c.req.query('priority');
  const priorities = parseNumberCsvQuery(priorityParam);
  const since = c.req.query('since');
  const until = c.req.query('until');
  const sortParam = c.req.query('sort');
  const limit = parseQueryNumber(c.req.query('limit'), DEFAULT_LIST_QUERY_LIMIT);
  const page = parseQueryNumber(c.req.query('page'), DEFAULT_PAGE);
  const offset = (page - 1) * limit;

  // Build filter conditions
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (types && types.length > 0) {
    const placeholders = types.map(() => '?').join(', ');
    conditions.push(`type IN (${placeholders})`);
    params.push(...types);
  }

  if (statuses && statuses.length > 0) {
    const placeholders = statuses.map(() => '?').join(', ');
    conditions.push(`status IN (${placeholders})`);
    params.push(...statuses);
  }

  if (priorities && priorities.length > 0) {
    const placeholders = priorities.map(() => '?').join(', ');
    conditions.push(`priority IN (${placeholders})`);
    params.push(...priorities);
  }

  if (since) {
    const sinceDate = new Date(since);
    conditions.push('created_at >= ?');
    params.push(Math.floor(sinceDate.getTime() / SQLITE_MILLISECONDS));
  }

  if (until) {
    const untilDate = new Date(until);
    conditions.push('created_at <= ?');
    params.push(Math.floor(untilDate.getTime() / SQLITE_MILLISECONDS));
  }

  let whereClause = '';
  if (conditions.length > 0) {
    whereClause = `WHERE ${conditions.join(' AND ')}`;
  }

  // Build sort clause
  let orderClause = 'ORDER BY created_at DESC';
  if (sortParam) {
    const sorts = parseSort(sortParam);
    const sortParts = sorts.map((s) => {
      const field = getSortField(s.field);
      return `${field} ${s.direction.toUpperCase()}`;
    });
    orderClause = `ORDER BY ${sortParts.join(', ')}`;
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
  let total = 0;
  if (countResult) {
    total = countResult.total;
  }

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
      createdAt: new Date(row.created_at * SQLITE_MILLISECONDS).toISOString(),
      updatedAt: new Date(row.updated_at * SQLITE_MILLISECONDS).toISOString(),
    })),
  });
});

export default app;
