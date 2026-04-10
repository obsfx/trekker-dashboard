import type { EpicFormData } from '@/components/epic-detail/schema';
import type { Epic } from '@/types';

interface UpdateEpicRequestPayload {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: number;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'error' in error && typeof error.error === 'string') {
    return error.error;
  }

  return fallback;
}

export function getEpicFormValues(epic: Epic | null): EpicFormData {
  if (!epic) {
    return {
      title: '',
      description: '',
      status: 'todo',
      priority: 2,
    };
  }

  return {
    title: epic.title,
    description: epic.description ?? '',
    status: epic.status,
    priority: epic.priority,
  };
}

export async function updateEpicRequest(id: string, payload: UpdateEpicRequestPayload) {
  const response = await fetch(`/api/epics/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(getErrorMessage(error, 'Failed to update epic'));
  }

  return response.json();
}

export async function deleteEpicRequest(id: string) {
  const response = await fetch(`/api/epics/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(getErrorMessage(error, 'Failed to delete epic'));
  }
}
