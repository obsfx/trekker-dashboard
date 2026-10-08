import { DEFAULT_PRIORITY } from '@/lib/constants';
import { readApiErrorMessage } from '@/lib/errors';
import type { EpicFormData } from '@/lib/work-item-schema';
import type { Epic } from '@/types';

interface UpdateEpicRequestPayload {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: number;
}

export function getEpicFormValues(epic: Epic | null): EpicFormData {
  if (!epic) {
    return {
      title: '',
      description: '',
      status: 'todo',
      priority: DEFAULT_PRIORITY,
    };
  }

  return {
    title: epic.title,
    description: epic.description ?? '',
    status: epic.status,
    priority: epic.priority,
  };
}

export async function updateEpicRequest(
  id: string,
  payload: UpdateEpicRequestPayload
): Promise<void> {
  const response = await fetch(`/api/epics/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await readApiErrorMessage(response, 'Failed to update epic');
    throw new Error(message);
  }
}

export async function deleteEpicRequest(id: string) {
  const response = await fetch(`/api/epics/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const message = await readApiErrorMessage(response, 'Failed to delete epic');
    throw new Error(message);
  }
}
