import type { Database } from 'bun:sqlite';

const FTS_SYNTAX_ERROR = /fts5|no such column|unknown special query|unterminated string/i;

function toLiteralTerms(query: string): string {
  return query
    .split(/\s+/)
    .filter((term) => term.length > 0)
    .map((term) => `"${term.replaceAll('"', '""')}"`)
    .join(' ');
}

export function resolveMatchQuery(sqlite: Database, query: string): string {
  try {
    sqlite.query('SELECT 1 FROM search_index WHERE search_index MATCH ? LIMIT 1').get(query);
    return query;
  } catch (error) {
    if (error instanceof Error && FTS_SYNTAX_ERROR.test(error.message)) {
      return toLiteralTerms(query);
    }
    throw error;
  }
}
