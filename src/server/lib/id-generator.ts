import { getDb, idCounters } from '@server/lib/db';
import { ENTITY_CONFIG_KEY_MAP, type EntityType } from '@server/lib/types';
import { listProjectConfig } from '@server/services/config.service';
import { eq, sql } from 'drizzle-orm';

export async function generateId(entityType: EntityType): Promise<string> {
  const db = getDb();
  const config = await listProjectConfig();
  const prefix = config[ENTITY_CONFIG_KEY_MAP[entityType]];

  // Atomically increment the counter and return the new value
  await db
    .update(idCounters)
    .set({ counter: sql`${idCounters.counter} + 1` })
    .where(eq(idCounters.entityType, entityType));

  const result = await db
    .select({ counter: idCounters.counter })
    .from(idCounters)
    .where(eq(idCounters.entityType, entityType));

  if (!result[0]) {
    throw new Error(`Counter not found for entity type: ${entityType}`);
  }

  return `${prefix}-${result[0].counter}`;
}

export function generateUuid(): string {
  return crypto.randomUUID();
}
