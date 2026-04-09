import {
  comments,
  dependencies,
  epics,
  events,
  idCounters,
  projectConfig,
  projects,
  tasks,
} from '@server/lib/schema';
import { PROJECT_CONFIG_DEFAULTS } from '@server/lib/types';
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';

export { comments, dependencies, epics, idCounters, projectConfig, projects, tasks };

const schema = {
  projects,
  projectConfig,
  epics,
  tasks,
  comments,
  dependencies,
  idCounters,
  events,
};

// Infer types from schema
export type Project = typeof projects.$inferSelect;
export type Epic = typeof epics.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Dependency = typeof dependencies.$inferSelect;

let sqliteInstance: Database | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let currentDbPath: string | null = null;

function seedProjectConfig(sqlite: Database): void {
  for (const [key, value] of Object.entries(PROJECT_CONFIG_DEFAULTS)) {
    sqlite.query('INSERT OR IGNORE INTO project_config (key, value) VALUES (?, ?)').run(key, value);
  }
}

function migrateProjectConfigTable(sqlite: Database): void {
  sqlite.run(`
    CREATE TABLE IF NOT EXISTS project_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  seedProjectConfig(sqlite);
}

export function getDb() {
  const dbPath = process.env.TREKKER_DB_PATH;
  if (!dbPath) {
    throw new Error('TREKKER_DB_PATH environment variable not set');
  }

  if (db && currentDbPath === dbPath) {
    return db;
  }

  if (sqliteInstance) {
    sqliteInstance.close();
    sqliteInstance = null;
    db = null;
  }

  sqliteInstance = new Database(dbPath);
  migrateProjectConfigTable(sqliteInstance);
  db = drizzle(sqliteInstance, { schema });
  currentDbPath = dbPath;
  return db;
}

export function getSqliteInstance() {
  if (!sqliteInstance) {
    getDb(); // Initialize if not already
  }
  return sqliteInstance;
}

export function resetDb() {
  if (sqliteInstance) {
    sqliteInstance.close();
  }
  sqliteInstance = null;
  db = null;
  currentDbPath = null;
}
