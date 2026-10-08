import { DEFAULT_PRIORITY } from '@/lib/constants';
import { readApiErrorMessage } from '@/lib/errors';
import type { TaskFormData } from '@/lib/work-item-schema';
import type { Task } from '@/types';

interface UpdateTaskRequestPayload {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: number;
  tags?: string | null;
  epicId?: string | null;
}

export function getTaskFormValues(task: Task | null): TaskFormData {
  if (!task) {
    return {
      title: '',
      description: '',
      status: 'todo',
      priority: DEFAULT_PRIORITY,
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

export async function updateTaskRequest(
  id: string,
  payload: UpdateTaskRequestPayload
): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await readApiErrorMessage(response, 'Failed to update task');
    throw new Error(message);
  }
}

export async function deleteTaskRequest(id: string) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const message = await readApiErrorMessage(response, 'Failed to delete task');
    throw new Error(message);
  }
}
