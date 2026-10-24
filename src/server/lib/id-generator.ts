import { getDb, idCounters } from '@server/lib/db';
import { ENTITY_CONFIG_KEY_MAP, type EntityType } from '@server/lib/types';
import { listProjectConfig } from '@server/services/config.service';
import { eq, sql } from 'drizzle-orm';

export async function generateId(entityType: EntityType): Promise<string> {
  const db = getDb();
  const config = await listProjectConfig();
  const prefix = config[ENTITY_CONFIG_KEY_MAP[entityType]];

  const [result] = await db
    .update(idCounters)
    .set({ counter: sql`${idCounters.counter} + 1` })
    .where(eq(idCounters.entityType, entityType))
    .returning({ counter: idCounters.counter });

  if (!result) {
    throw new Error(`Counter not found for entity type: ${entityType}`);
  }

  return `${prefix}-${result.counter}`;
}

export function generateUuid(): string {
  return crypto.randomUUID();
}
