import { AsyncLocalStorage } from 'node:async_hooks';

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

const dbPathStorage = new AsyncLocalStorage<string>();
const sqliteInstances = new Map<string, Database>();
const drizzleInstances = new Map<string, ReturnType<typeof drizzle<typeof schema>>>();

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

function getResolvedDbPath(): string {
  const dbPath = dbPathStorage.getStore() ?? process.env.TREKKER_DB_PATH;
  if (!dbPath) {
    throw new Error('TREKKER_DB_PATH environment variable not set');
  }

  return dbPath;
}

export function runWithDbPath<T>(dbPath: string, callback: () => T): T {
  return dbPathStorage.run(dbPath, callback);
}

export function getDb() {
  const dbPath = getResolvedDbPath();
  const existingDb = drizzleInstances.get(dbPath);
  if (existingDb) {
    return existingDb;
  }

  const sqliteInstance = new Database(dbPath);
  migrateProjectConfigTable(sqliteInstance);
  const db = drizzle(sqliteInstance, { schema });
  sqliteInstances.set(dbPath, sqliteInstance);
  drizzleInstances.set(dbPath, db);
  return db;
}

export function getSqliteInstance() {
  const dbPath = getResolvedDbPath();
  let sqliteInstance = sqliteInstances.get(dbPath);
  if (!sqliteInstance) {
    getDb(); // Initialize if not already
    sqliteInstance = sqliteInstances.get(dbPath);
  }

  return sqliteInstance;
}

export function resetDb(dbPath?: string) {
  if (dbPath) {
    sqliteInstances.get(dbPath)?.close();
    sqliteInstances.delete(dbPath);
    drizzleInstances.delete(dbPath);
    return;
  }

  for (const sqliteInstance of sqliteInstances.values()) {
    sqliteInstance.close();
  }

  sqliteInstances.clear();
  drizzleInstances.clear();
}
