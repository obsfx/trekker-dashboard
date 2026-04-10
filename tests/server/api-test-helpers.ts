import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createApp } from '@server/index';
import { resetDb, runWithDbPath } from '@server/lib/db';
import { expect } from 'bun:test';

const TREKKER_CLI_PATH = join(import.meta.dir, '../../../trekker/src/index.ts');

export const JSON_HEADERS = { 'Content-Type': 'application/json' };

export interface ApiErrorResponse {
  code: string;
  error: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  config: {
    issuePrefix: string;
    epicPrefix: string;
    commentPrefix: string;
  };
}

export interface EpicResponse {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskResponse {
  id: string;
  projectId: string;
  epicId: string | null;
  parentTaskId: string | null;
  title: string;
  description: string | null;
  priority: number;
  status: string;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
  dependsOn: string[];
  blocks: string[];
}

export interface CommentResponse {
  id: string;
  taskId: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface DependencyResponse {
  id: string;
  taskId: string;
  dependsOnId: string;
  createdAt: string;
}

export interface ArchiveResponse {
  tasksArchived: number;
  epicsArchived: number;
}

export interface ListItemResponse {
  type: 'epic' | 'task' | 'subtask';
  id: string;
  title: string;
  status: string;
  priority: number;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListResponse {
  total: number;
  page: number;
  limit: number;
  items: ListItemResponse[];
}

export interface HistoryEventResponse {
  id: number;
  action: 'create' | 'update' | 'delete';
  entityType: 'epic' | 'task' | 'subtask' | 'comment' | 'dependency';
  entityId: string;
  snapshot: Record<string, unknown> | null;
  changes: Record<string, { from: unknown; to: unknown }> | null;
  timestamp: string;
}

export interface HistoryResponse {
  total: number;
  page: number;
  limit: number;
  events: HistoryEventResponse[];
}

export interface SearchResultResponse {
  type: 'epic' | 'task' | 'subtask' | 'comment';
  id: string;
  title: string | null;
  snippet: string;
  score: number;
  status: string | null;
  parentId: string | null;
}

export interface SearchResponse {
  query: string;
  total: number;
  page: number;
  limit: number;
  results: SearchResultResponse[];
}

interface RequestResult<T> {
  status: number;
  body: T;
}

interface CreateEpicInput {
  title: string;
  description?: string | null;
  status?: string;
  priority?: number;
}

interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: string;
  priority?: number;
  epicId?: string | null;
  parentTaskId?: string | null;
  tags?: string | null;
}

interface CreateCommentInput {
  author: string;
  content: string;
}

interface CreateDependencyInput {
  taskId: string;
  dependsOnId: string;
}

export interface ApiTestContext {
  cwd: string;
  dbPath: string;
  createComment: (taskId: string, input: CreateCommentInput) => Promise<CommentResponse>;
  createDependency: (input: CreateDependencyInput) => Promise<DependencyResponse>;
  createEpic: (input: CreateEpicInput) => Promise<EpicResponse>;
  createTask: (input: CreateTaskInput) => Promise<TaskResponse>;
  requestJson: <T>(path: string, init?: RequestInit) => Promise<RequestResult<T>>;
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

export function getDbPath(cwd: string): string {
  return join(cwd, '.trekker', 'trekker.db');
}

export function createApiTestContext(cleanupDirs: string[], initArgs: string[] = []): ApiTestContext {
  const cwd = createTempProject(initArgs);
  const dbPath = getDbPath(cwd);
  const app = createApp();
  cleanupDirs.push(cwd);

  async function requestJson<T>(path: string, init?: RequestInit): Promise<RequestResult<T>> {
    const response = await runWithDbPath(dbPath, () => app.request(path, init));
    return {
      status: response.status,
      body: (await response.json()) as T,
    };
  }

  async function createEpic(input: CreateEpicInput): Promise<EpicResponse> {
    const response = await requestJson<EpicResponse>('/api/epics', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(input),
    });

    expect(response.status).toBe(201);
    return response.body;
  }

  async function createTask(input: CreateTaskInput): Promise<TaskResponse> {
    const response = await requestJson<TaskResponse>('/api/tasks', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(input),
    });

    expect(response.status).toBe(201);
    return response.body;
  }

  async function createComment(taskId: string, input: CreateCommentInput): Promise<CommentResponse> {
    const response = await requestJson<CommentResponse>(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(input),
    });

    expect(response.status).toBe(201);
    return response.body;
  }

  async function createDependency(input: CreateDependencyInput): Promise<DependencyResponse> {
    const response = await requestJson<DependencyResponse>('/api/dependencies', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(input),
    });

    expect(response.status).toBe(201);
    return response.body;
  }

  return {
    cwd,
    dbPath,
    createComment,
    createDependency,
    createEpic,
    createTask,
    requestJson,
  };
}

export function cleanupApiTestContexts(cleanupDirs: string[]): void {
  resetDb();
  delete process.env.TREKKER_DB_PATH;

  while (cleanupDirs.length > 0) {
    const cwd = cleanupDirs.pop();
    if (cwd) {
      rmSync(cwd, { recursive: true, force: true });
    }
  }
}
