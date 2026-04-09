import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createApp } from '@server/index';
import { resetDb } from '@server/lib/db';
import { Database } from 'bun:sqlite';
import { afterEach, describe, expect, it } from 'bun:test';

const TREKKER_CLI_PATH = join(import.meta.dir, '../../../trekker/src/index.ts');

interface ProjectResponse {
  id: string;
  name: string;
  config: {
    issuePrefix: string;
    epicPrefix: string;
    commentPrefix: string;
  };
}

function createTempProject(initArgs: string[] = []): string {
  const cwd = mkdtempSync(join(tmpdir(), 'trekker-dashboard-test-'));
  const result = spawnSync('bun', ['run', TREKKER_CLI_PATH, 'init', ...initArgs], {
    cwd,
    encoding: 'utf-8',
    env: { ...process.env, NO_COLOR: '1' },
  });

  if ((result.status ?? 1) !== 0) {
    throw new Error(result.stderr || result.stdout || 'Failed to initialize Trekker project');
  }

  return cwd;
}

function getDbPath(cwd: string): string {
  return join(cwd, '.trekker', 'trekker.db');
}

function setProjectDb(cwd: string): void {
  process.env.TREKKER_DB_PATH = getDbPath(cwd);
  resetDb();
}

async function requestJson<T>(
  path: string,
  init?: RequestInit
): Promise<{ status: number; body: T }> {
  const app = createApp();
  const response = await app.request(path, init);
  return {
    status: response.status,
    body: (await response.json()) as T,
  };
}

const cleanupDirs: string[] = [];

afterEach(() => {
  resetDb();
  delete process.env.TREKKER_DB_PATH;

  while (cleanupDirs.length > 0) {
    const cwd = cleanupDirs.pop();
    if (cwd) {
      rmSync(cwd, { recursive: true, force: true });
    }
  }
});

describe('project config API', () => {
  it('returns project config from GET /api/project', async () => {
    const cwd = createTempProject();
    cleanupDirs.push(cwd);
    setProjectDb(cwd);

    const { status, body } = await requestJson<ProjectResponse>('/api/project');

    expect(status).toBe(200);
    expect(body.name).toBeTruthy();
    expect(body.config).toEqual({
      issuePrefix: 'TREK',
      epicPrefix: 'EPIC',
      commentPrefix: 'CMT',
    });
  });

  it('updates prefixes and uses them for new epic, task, and comment IDs', async () => {
    const cwd = createTempProject();
    cleanupDirs.push(cwd);
    setProjectDb(cwd);

    const patch = await requestJson<ProjectResponse['config']>('/api/project/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issuePrefix: 'feat',
        epicPrefix: 'plan',
        commentPrefix: 'note',
      }),
    });

    expect(patch.status).toBe(200);
    expect(patch.body).toEqual({
      issuePrefix: 'FEAT',
      epicPrefix: 'PLAN',
      commentPrefix: 'NOTE',
    });

    const epic = await requestJson<{ id: string }>('/api/epics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Configured Epic' }),
    });
    expect(epic.status).toBe(201);
    expect(epic.body.id).toBe('PLAN-1');

    const task = await requestJson<{ id: string }>('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Configured Task', epicId: epic.body.id }),
    });
    expect(task.status).toBe(201);
    expect(task.body.id).toBe('FEAT-1');

    const comment = await requestJson<{ id: string }>(`/api/tasks/${task.body.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: 'agent', content: 'Tracked' }),
    });
    expect(comment.status).toBe(201);
    expect(comment.body.id).toBe('NOTE-1');
  });

  it('rejects duplicate prefixes through PATCH /api/project/config', async () => {
    const cwd = createTempProject();
    cleanupDirs.push(cwd);
    setProjectDb(cwd);

    const result = await requestJson<{ error: string }>('/api/project/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issuePrefix: 'epic',
      }),
    });

    expect(result.status).toBe(400);
    expect(result.body.error).toContain('must be unique');
  });

  it('recreates and seeds project_config for older databases missing the table', async () => {
    const cwd = createTempProject();
    cleanupDirs.push(cwd);

    const db = new Database(getDbPath(cwd));
    db.run('DROP TABLE project_config');
    db.close();

    setProjectDb(cwd);

    const { status, body } = await requestJson<ProjectResponse>('/api/project');

    expect(status).toBe(200);
    expect(body.config).toEqual({
      issuePrefix: 'TREK',
      epicPrefix: 'EPIC',
      commentPrefix: 'CMT',
    });
  });
});
