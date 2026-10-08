import { DEFAULT_PRIORITY } from '@/lib/constants';
import type { Epic, Task } from '@/types';

interface CreateSelectOption {
  value: string;
  label: string;
}

export function buildEpicOptions(epics: Epic[]): CreateSelectOption[] {
  return epics.map((epic) => ({
    value: epic.id,
    label: `${epic.id}: ${epic.title}`,
  }));
}

export function buildParentTaskOptions(parentTasks: Task[]): CreateSelectOption[] {
  return parentTasks.map((task) => ({
    value: task.id,
    label: `${task.id}: ${task.title}`,
  }));
}

export function getDefaultCreateFormValues(defaultStatus?: string) {
  return {
    title: '',
    description: '',
    status: defaultStatus ?? 'todo',
    priority: DEFAULT_PRIORITY,
    tags: '',
    epicId: null,
    parentTaskId: '',
  };
}
