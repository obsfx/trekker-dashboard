import { afterEach, describe, expect, it } from 'bun:test';

import {
  type ApiErrorResponse,
  cleanupApiTestContexts,
  type CommentResponse,
  createApiTestContext,
  type TaskResponse,
} from './api-test-helpers';

const cleanupDirs: string[] = [];

afterEach(() => {
  cleanupApiTestContexts(cleanupDirs);
});

describe('comment and dependency API', () => {
  it('maintains relationship data and cascades comment and dependency cleanup on task delete', async () => {
    const context = createApiTestContext(cleanupDirs);

    const blockedTask = await context.createTask({ title: 'Blocked task' });
    const dependencyTask = await context.createTask({ title: 'Dependency task' });
    const comment = await context.createComment(blockedTask.id, {
      author: 'Tester',
      content: 'Important note',
    });
    await context.createDependency({
      taskId: blockedTask.id,
      dependsOnId: dependencyTask.id,
    });

    const commentsBeforeDelete = await context.requestJson<CommentResponse[]>(
      `/api/tasks/${blockedTask.id}/comments`
    );
    expect(commentsBeforeDelete.status).toBe(200);
    expect(commentsBeforeDelete.body.map((item) => item.id)).toEqual([comment.id]);

    const blockedView = await context.requestJson<TaskResponse>(`/api/tasks/${blockedTask.id}`);
    expect(blockedView.status).toBe(200);
    expect(blockedView.body.dependsOn).toEqual([dependencyTask.id]);

    const dependencyView = await context.requestJson<TaskResponse>(
      `/api/tasks/${dependencyTask.id}`
    );
    expect(dependencyView.status).toBe(200);
    expect(dependencyView.body.blocks).toEqual([blockedTask.id]);

    const deleteTask = await context.requestJson<{ success: boolean }>(
      `/api/tasks/${blockedTask.id}`,
      {
        method: 'DELETE',
      }
    );
    expect(deleteTask.status).toBe(200);

    const dependencyAfterDelete = await context.requestJson<TaskResponse>(
      `/api/tasks/${dependencyTask.id}`
    );
    expect(dependencyAfterDelete.status).toBe(200);
    expect(dependencyAfterDelete.body.blocks).toEqual([]);

    const commentsAfterDelete = await context.requestJson<CommentResponse[]>(
      `/api/tasks/${blockedTask.id}/comments`
    );
    expect(commentsAfterDelete.status).toBe(200);
    expect(commentsAfterDelete.body).toEqual([]);
  });

  it('rejects invalid, duplicate, and cyclic dependencies', async () => {
    const context = createApiTestContext(cleanupDirs);

    const taskA = await context.createTask({ title: 'Task A' });
    const taskB = await context.createTask({ title: 'Task B' });
    const taskC = await context.createTask({ title: 'Task C' });

    const selfDependency = await context.requestJson<ApiErrorResponse>('/api/dependencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: taskA.id,
        dependsOnId: taskA.id,
      }),
    });
    expect(selfDependency.status).toBe(400);
    expect(selfDependency.body.error).toContain('cannot depend on itself');

    await context.createDependency({ taskId: taskA.id, dependsOnId: taskB.id });

    const duplicateDependency = await context.requestJson<ApiErrorResponse>('/api/dependencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: taskA.id,
        dependsOnId: taskB.id,
      }),
    });
    expect(duplicateDependency.status).toBe(409);
    expect(duplicateDependency.body.code).toBe('CONFLICT');

    await context.createDependency({ taskId: taskB.id, dependsOnId: taskC.id });

    const cyclicDependency = await context.requestJson<ApiErrorResponse>('/api/dependencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: taskC.id,
        dependsOnId: taskA.id,
      }),
    });
    expect(cyclicDependency.status).toBe(400);
    expect(cyclicDependency.body.error).toContain('create a cycle');

    const missingDependsOnId = await context.requestJson<ApiErrorResponse>(
      `/api/dependencies?taskId=${taskA.id}`,
      {
        method: 'DELETE',
      }
    );
    expect(missingDependsOnId.status).toBe(400);
    expect(missingDependsOnId.body.error).toContain('dependsOnId query param is required');

    const removeDependency = await context.requestJson<{ success: boolean }>(
      `/api/dependencies?taskId=${taskA.id}&dependsOnId=${taskB.id}`,
      {
        method: 'DELETE',
      }
    );
    expect(removeDependency.status).toBe(200);

    const taskAfterRemove = await context.requestJson<TaskResponse>(`/api/tasks/${taskA.id}`);
    expect(taskAfterRemove.status).toBe(200);
    expect(taskAfterRemove.body.dependsOn).toEqual([]);
  });

  it('allows comments to be deleted directly', async () => {
    const context = createApiTestContext(cleanupDirs);

    const task = await context.createTask({ title: 'Comment target' });
    const comment = await context.createComment(task.id, {
      author: 'Reviewer',
      content: 'Delete me',
    });

    const deleteComment = await context.requestJson<{ success: boolean }>(
      `/api/comments/${comment.id}`,
      {
        method: 'DELETE',
      }
    );
    expect(deleteComment.status).toBe(200);

    const remainingComments = await context.requestJson<CommentResponse[]>(
      `/api/tasks/${task.id}/comments`
    );
    expect(remainingComments.status).toBe(200);
    expect(remainingComments.body).toEqual([]);
  });
});
