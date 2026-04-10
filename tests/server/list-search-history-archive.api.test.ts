import { afterEach, describe, expect, it } from 'bun:test';

import {
  type ApiErrorResponse,
  type ArchiveResponse,
  cleanupApiTestContexts,
  createApiTestContext,
  type EpicResponse,
  type HistoryResponse,
  type ListResponse,
  type SearchResponse,
  type TaskResponse,
} from './api-test-helpers';

const cleanupDirs: string[] = [];

afterEach(() => {
  cleanupApiTestContexts(cleanupDirs);
});

describe('list, search, history, and archive APIs', () => {
  it('supports list filters, sorting, and pagination across epics, tasks, and subtasks', async () => {
    const context = createApiTestContext(cleanupDirs);

    const epic = await context.createEpic({
      title: 'Zulu Epic',
      status: 'todo',
      priority: 4,
    });
    const task = await context.createTask({
      title: 'Alpha Task',
      status: 'in_progress',
      priority: 3,
      epicId: epic.id,
    });
    const parentTask = await context.createTask({
      title: 'Beta Parent',
      status: 'completed',
      priority: 2,
    });
    const subtask = await context.createTask({
      title: 'Gamma Subtask',
      status: 'completed',
      priority: 0,
      parentTaskId: parentTask.id,
    });

    const paginated = await context.requestJson<ListResponse>('/api/list?sort=title:asc&limit=2&page=2');
    expect(paginated.status).toBe(200);
    expect(paginated.body.total).toBe(4);
    expect(paginated.body.page).toBe(2);
    expect(paginated.body.items.map((item) => item.title)).toEqual(['Gamma Subtask', 'Zulu Epic']);

    const subtaskOnly = await context.requestJson<ListResponse>('/api/list?type=subtask');
    expect(subtaskOnly.status).toBe(200);
    expect(subtaskOnly.body.total).toBe(1);
    expect(subtaskOnly.body.items[0]?.id).toBe(subtask.id);
    expect(subtaskOnly.body.items[0]?.parentId).toBe(parentTask.id);

    const filtered = await context.requestJson<ListResponse>('/api/list?status=completed&priority=0');
    expect(filtered.status).toBe(200);
    expect(filtered.body.total).toBe(1);
    expect(filtered.body.items[0]?.id).toBe(subtask.id);
    expect(filtered.body.items[0]?.type).toBe('subtask');

    const invalidSort = await context.requestJson<ApiErrorResponse>('/api/list?sort=invalid:asc');
    expect(invalidSort.status).toBe(400);
    expect(invalidSort.body.error).toContain('Invalid sort field');

    expect(task.id).toBeTruthy();
  });

  it('returns searchable results and history events for create, update, and delete flows', async () => {
    const context = createApiTestContext(cleanupDirs);

    const epic = await context.createEpic({
      title: 'Needle Epic',
      description: 'epic needle context',
    });
    const task = await context.createTask({
      title: 'Needle Task',
      description: 'task needle description',
      epicId: epic.id,
    });
    const supportingTask = await context.createTask({ title: 'Supporting task' });
    const comment = await context.createComment(task.id, {
      author: 'Auditor',
      content: 'needle comment body',
    });
    await context.createDependency({
      taskId: task.id,
      dependsOnId: supportingTask.id,
    });

    const searchByContent = await context.requestJson<SearchResponse>('/api/search?q=needle');
    expect(searchByContent.status).toBe(200);
    expect(searchByContent.body.total).toBeGreaterThanOrEqual(3);
    const searchTypes = new Set(searchByContent.body.results.map((result) => result.type));
    expect(searchTypes.has('epic')).toBe(true);
    expect(searchTypes.has('task')).toBe(true);
    expect(searchTypes.has('comment')).toBe(true);

    const updateTask = await context.requestJson<TaskResponse>(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Needle Task Updated',
        status: 'completed',
        tags: 'needle,updated',
      }),
    });
    expect(updateTask.status).toBe(200);

    const searchByStatus = await context.requestJson<SearchResponse>(
      '/api/search?q=updated&type=task&status=completed'
    );
    expect(searchByStatus.status).toBe(200);
    expect(searchByStatus.body.results.map((result) => result.id)).toEqual([task.id]);

    const deleteComment = await context.requestJson<{ success: boolean }>(`/api/comments/${comment.id}`, {
      method: 'DELETE',
    });
    expect(deleteComment.status).toBe(200);

    const taskHistory = await context.requestJson<HistoryResponse>(
      `/api/history?entityId=${task.id}&type=task`
    );
    expect(taskHistory.status).toBe(200);
    const taskActions = new Set(taskHistory.body.events.map((event) => event.action));
    expect(taskActions.has('create')).toBe(true);
    expect(taskActions.has('update')).toBe(true);
    const taskUpdateEvent = taskHistory.body.events.find((event) => event.action === 'update');
    expect(taskUpdateEvent?.changes?.title?.to).toBe('Needle Task Updated');

    const commentHistory = await context.requestJson<HistoryResponse>(
      `/api/history?entityId=${comment.id}&type=comment`
    );
    expect(commentHistory.status).toBe(200);
    const commentActions = new Set(commentHistory.body.events.map((event) => event.action));
    expect(commentActions.has('create')).toBe(true);
    expect(commentActions.has('delete')).toBe(true);

    const dependencyHistory = await context.requestJson<HistoryResponse>(
      '/api/history?action=create&type=dependency'
    );
    expect(dependencyHistory.status).toBe(200);
    expect(dependencyHistory.body.total).toBeGreaterThanOrEqual(1);
    expect(dependencyHistory.body.events[0]?.snapshot).toBeTruthy();

    const searchWithoutQuery = await context.requestJson<ApiErrorResponse>('/api/search');
    expect(searchWithoutQuery.status).toBe(400);
    expect(searchWithoutQuery.body.error).toContain("Query parameter 'q' is required");
  });

  it('archives only completed tasks and epics', async () => {
    const context = createApiTestContext(cleanupDirs);

    const completedEpic = await context.createEpic({
      title: 'Completed epic',
      status: 'completed',
    });
    const activeEpic = await context.createEpic({
      title: 'Active epic',
      status: 'todo',
    });
    const completedTask = await context.createTask({
      title: 'Completed task',
      status: 'completed',
    });
    const activeTask = await context.createTask({
      title: 'Active task',
      status: 'todo',
    });

    const archive = await context.requestJson<ArchiveResponse>('/api/bulk-archive-completed', {
      method: 'POST',
    });
    expect(archive.status).toBe(200);
    expect(archive.body).toEqual({
      tasksArchived: 1,
      epicsArchived: 1,
    });

    const archivedTask = await context.requestJson<TaskResponse>(`/api/tasks/${completedTask.id}`);
    expect(archivedTask.status).toBe(200);
    expect(archivedTask.body.status).toBe('archived');

    const archivedEpic = await context.requestJson<EpicResponse>(`/api/epics/${completedEpic.id}`);
    expect(archivedEpic.status).toBe(200);
    expect(archivedEpic.body.status).toBe('archived');

    const untouchedTask = await context.requestJson<TaskResponse>(`/api/tasks/${activeTask.id}`);
    expect(untouchedTask.status).toBe(200);
    expect(untouchedTask.body.status).toBe('todo');

    const untouchedEpic = await context.requestJson<EpicResponse>(`/api/epics/${activeEpic.id}`);
    expect(untouchedEpic.status).toBe(200);
    expect(untouchedEpic.body.status).toBe('todo');
  });
});
