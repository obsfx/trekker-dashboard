import type { TaskFormData } from '@/components/task-detail/schema';
import type { Task } from '@/types';

interface UpdateTaskRequestPayload {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: number;
  tags?: string | null;
  epicId?: string | null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'error' in error && typeof error.error === 'string') {
    return error.error;
  }

  return fallback;
}

export function getTaskFormValues(task: Task | null): TaskFormData {
  if (!task) {
    return {
      title: '',
      description: '',
      status: 'todo',
      priority: 2,
      tags: '',
      epicId: null,
    };
  }

  return {
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    priority: task.priority,
    tags: task.tags ?? '',
    epicId: task.epicId,
  };
}

export async function updateTaskRequest(id: string, payload: UpdateTaskRequestPayload) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(getErrorMessage(error, 'Failed to update task'));
  }

  return response.json();
}

export async function deleteTaskRequest(id: string) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(getErrorMessage(error, 'Failed to delete task'));
  }
}
