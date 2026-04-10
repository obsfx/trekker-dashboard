import type { BreadcrumbItem } from '@/components/breadcrumb';
import type { Epic, Task } from '@/types';

interface BuildTaskBreadcrumbItemsOptions {
  onEpicClick?: (epic: Epic) => void;
  onTaskClick?: (task: Task) => void;
  task: Task;
}

export function findEpicById(epics: Epic[], id: string): Epic | undefined {
  return epics.find((epic) => epic.id === id);
}

export function findTaskById(tasks: Task[], id: string): Task | undefined {
  return tasks.find((task) => task.id === id);
}

function findParentTask(tasks: Task[], parentTaskId: string | null): Task | null {
  if (!parentTaskId) {
    return null;
  }

  return findTaskById(tasks, parentTaskId) ?? null;
}

export function getSubtasksForTask(tasks: Task[], taskId: string): Task[] {
  return tasks.filter((task) => task.parentTaskId === taskId);
}

export function buildTaskBreadcrumbItems(
  epics: Epic[],
  tasks: Task[],
  options: BuildTaskBreadcrumbItemsOptions
): BreadcrumbItem[] {
  const { onEpicClick, onTaskClick, task } = options;
  const items: BreadcrumbItem[] = [];
  let epic: Epic | null = null;
  if (task.epicId) {
    epic = findEpicById(epics, task.epicId) ?? null;
  }

  const parentTask = findParentTask(tasks, task.parentTaskId);
  let epicClickHandler: (() => void) | undefined;
  if (onEpicClick && epic) {
    epicClickHandler = () => onEpicClick(epic);
  }

  let parentTaskClickHandler: (() => void) | undefined;
  if (onTaskClick && parentTask) {
    parentTaskClickHandler = () => onTaskClick(parentTask);
  }

  let taskType: BreadcrumbItem['type'] = 'task';
  if (task.parentTaskId) {
    taskType = 'subtask';
  }

  if (epic) {
    items.push({
      id: epic.id,
      title: epic.title,
      type: 'epic',
      onClick: epicClickHandler,
    });
  }

  if (parentTask) {
    items.push({
      id: parentTask.id,
      title: parentTask.title,
      type: 'task',
      onClick: parentTaskClickHandler,
    });
  }

  items.push({
    id: task.id,
    title: task.title,
    type: taskType,
  });

  return items;
}
