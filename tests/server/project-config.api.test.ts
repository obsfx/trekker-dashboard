import { Database } from 'bun:sqlite';
import { afterEach, describe, expect, it } from 'bun:test';

import {
  type ApiErrorResponse,
  cleanupApiTestContexts,
  createApiTestContext,
  type ProjectResponse,
} from './api-test-helpers';

const cleanupDirs: string[] = [];

afterEach(() => {
  cleanupApiTestContexts(cleanupDirs);
});

describe('project config API', () => {
  it('returns project config from GET /api/project', async () => {
    const context = createApiTestContext(cleanupDirs);

    const { status, body } = await context.requestJson<ProjectResponse>('/api/project');

    expect(status).toBe(200);
    expect(body.name).toBeTruthy();
    expect(body.config).toEqual({
      issuePrefix: 'TREK',
      epicPrefix: 'EPIC',
      commentPrefix: 'CMT',
    });
  });

  it('updates prefixes and uses them for new epic, task, and comment IDs', async () => {
    const context = createApiTestContext(cleanupDirs);

    const patch = await context.requestJson<ProjectResponse['config']>('/api/project/config', {
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

    const epic = await context.createEpic({ title: 'Configured Epic' });
    expect(epic.id).toBe('PLAN-1');

    const task = await context.createTask({ title: 'Configured Task', epicId: epic.id });
    expect(task.id).toBe('FEAT-1');

    const comment = await context.createComment(task.id, {
      author: 'agent',
      content: 'Tracked',
    });
    expect(comment.id).toBe('NOTE-1');
  });

  it('rejects duplicate prefixes through PATCH /api/project/config', async () => {
    const context = createApiTestContext(cleanupDirs);

    const result = await context.requestJson<ApiErrorResponse>('/api/project/config', {
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
    const context = createApiTestContext(cleanupDirs);

    const db = new Database(context.dbPath);
    db.run('DROP TABLE project_config');
    db.close();

    const { status, body } = await context.requestJson<ProjectResponse>('/api/project');

    expect(status).toBe(200);
    expect(body.config).toEqual({
      issuePrefix: 'TREK',
      epicPrefix: 'EPIC',
      commentPrefix: 'CMT',
    });
  });
});
