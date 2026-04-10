import { ValidationError } from '@server/errors';
import { getDb, projectConfig } from '@server/lib/db';
import {
  PROJECT_CONFIG_DEFAULTS,
  PROJECT_CONFIG_KEYS,
  type ProjectConfig,
  type ProjectConfigKey,
} from '@server/lib/types';
import { eq } from 'drizzle-orm';

const PROJECT_CONFIG_KEY_SET: ReadonlySet<string> = new Set(PROJECT_CONFIG_KEYS);
const PREFIX_PATTERN = /^[A-Z][A-Z0-9]*$/;

function assertProjectConfigKey(key: string): asserts key is ProjectConfigKey {
  if (!PROJECT_CONFIG_KEY_SET.has(key)) {
    throw new ValidationError(
      `Unsupported config key: ${key}. Valid keys: ${PROJECT_CONFIG_KEYS.join(', ')}`
    );
  }
}

function normalizePrefixValue(value: string): string {
  const normalized = value.trim().toUpperCase();

  if (!normalized) {
    throw new ValidationError('Prefix value is required.');
  }

  if (!PREFIX_PATTERN.test(normalized)) {
    throw new ValidationError(
      'Invalid prefix value. Use uppercase letters and numbers only, and start with a letter.'
    );
  }

  return normalized;
}

function validateUniquePrefixes(config: ProjectConfig): void {
  const seen = new Map<string, ProjectConfigKey>();

  for (const key of PROJECT_CONFIG_KEYS) {
    const prefix = config[key];
    const existingKey = seen.get(prefix);
    if (existingKey) {
      throw new ValidationError(
        `Prefix values must be unique. ${existingKey} and ${key} cannot both use ${prefix}.`
      );
    }
    seen.set(prefix, key);
  }
}

function resolveProjectConfig(
  updates?: Partial<Record<ProjectConfigKey, string>>,
  baseConfig: ProjectConfig = PROJECT_CONFIG_DEFAULTS
): ProjectConfig {
  const normalizedUpdates: Partial<ProjectConfig> = {};

  if (updates) {
    for (const [rawKey, rawValue] of Object.entries(updates)) {
      if (rawValue === undefined) {
        continue;
      }

      assertProjectConfigKey(rawKey);
      normalizedUpdates[rawKey] = normalizePrefixValue(rawValue);
    }
  }

  const nextConfig: ProjectConfig = {
    ...baseConfig,
    ...normalizedUpdates,
  };

  validateUniquePrefixes(nextConfig);
  return nextConfig;
}

export async function listProjectConfig(): Promise<ProjectConfig> {
  const db = getDb();
  const rows = await db.select().from(projectConfig);
  const config: ProjectConfig = { ...PROJECT_CONFIG_DEFAULTS };

  for (const row of rows) {
    if (PROJECT_CONFIG_KEY_SET.has(row.key)) {
      config[row.key as ProjectConfigKey] = row.value;
    }
  }

  return config;
}

async function upsertProjectConfigValue(key: ProjectConfigKey, value: string): Promise<void> {
  const db = getDb();
  const existing = await db.select().from(projectConfig).where(eq(projectConfig.key, key));

  if (existing[0]) {
    await db.update(projectConfig).set({ value }).where(eq(projectConfig.key, key));
    return;
  }

  await db.insert(projectConfig).values({ key, value });
}

export async function setProjectConfigValues(
  updates: Partial<Record<ProjectConfigKey, string>>
): Promise<ProjectConfig> {
  const currentConfig = await listProjectConfig();
  const nextConfig = resolveProjectConfig(updates, currentConfig);

  for (const key of PROJECT_CONFIG_KEYS) {
    const nextValue = nextConfig[key];
    if (nextValue !== currentConfig[key]) {
      await upsertProjectConfigValue(key, nextValue);
    }
  }

  return nextConfig;
}
