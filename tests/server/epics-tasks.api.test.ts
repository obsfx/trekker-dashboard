import { afterEach, describe, expect, it } from 'bun:test';

import {
  type ApiErrorResponse,
  cleanupApiTestContexts,
  createApiTestContext,
  type EpicResponse,
  type TaskResponse,
} from './api-test-helpers';

const cleanupDirs: string[] = [];

afterEach(() => {
  cleanupApiTestContexts(cleanupDirs);
});

describe('epic and task API', () => {
  it('supports CRUD and clears task epic links when deleting an epic', async () => {
    const context = createApiTestContext(cleanupDirs);

    const epic = await context.createEpic({
      title: 'Platform Work',
      description: 'Original epic description',
      status: 'in_progress',
      priority: 1,
    });
    const task = await context.createTask({
      title: 'Build API',
      description: 'Original task description',
      status: 'todo',
      priority: 2,
      epicId: epic.id,
      tags: 'backend,api',
    });
    const subtask = await context.createTask({
      title: 'Wire handlers',
      parentTaskId: task.id,
      status: 'in_progress',
      priority: 0,
    });

    const epicUpdate = await context.requestJson<EpicResponse>(`/api/epics/${epic.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Platform Work Updated',
        status: 'completed',
        priority: 0,
      }),
    });
    expect(epicUpdate.status).toBe(200);
    expect(epicUpdate.body.title).toBe('Platform Work Updated');
    expect(epicUpdate.body.status).toBe('completed');
    expect(epicUpdate.body.priority).toBe(0);

    const taskUpdate = await context.requestJson<TaskResponse>(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Build API Updated',
        description: 'Updated task description',
        status: 'in_progress',
        priority: 1,
        tags: 'backend,critical',
      }),
    });
    expect(taskUpdate.status).toBe(200);
    expect(taskUpdate.body.title).toBe('Build API Updated');
    expect(taskUpdate.body.tags).toBe('backend,critical');
    expect(taskUpdate.body.epicId).toBe(epic.id);

    const fetchedTask = await context.requestJson<TaskResponse>(`/api/tasks/${task.id}`);
    expect(fetchedTask.status).toBe(200);
    expect(fetchedTask.body.dependsOn).toEqual([]);
    expect(fetchedTask.body.blocks).toEqual([]);

    const allTasks = await context.requestJson<TaskResponse[]>('/api/tasks');
    expect(allTasks.status).toBe(200);
    expect(allTasks.body.map((item) => item.id).sort()).toEqual([subtask.id, task.id].sort());

    const deleteEpic = await context.requestJson<{ success: boolean }>(`/api/epics/${epic.id}`, {
      method: 'DELETE',
    });
    expect(deleteEpic.status).toBe(200);
    expect(deleteEpic.body.success).toBe(true);

    const orphanedTask = await context.requestJson<TaskResponse>(`/api/tasks/${task.id}`);
    expect(orphanedTask.status).toBe(200);
    expect(orphanedTask.body.epicId).toBeNull();

    const deleteTask = await context.requestJson<{ success: boolean }>(`/api/tasks/${task.id}`, {
      method: 'DELETE',
    });
    expect(deleteTask.status).toBe(200);
    expect(deleteTask.body.success).toBe(true);

    const missingParent = await context.requestJson<ApiErrorResponse>(`/api/tasks/${task.id}`);
    expect(missingParent.status).toBe(404);
    expect(missingParent.body.code).toBe('NOT_FOUND');

    const missingSubtask = await context.requestJson<ApiErrorResponse>(`/api/tasks/${subtask.id}`);
    expect(missingSubtask.status).toBe(404);
    expect(missingSubtask.body.code).toBe('NOT_FOUND');
  });
});
