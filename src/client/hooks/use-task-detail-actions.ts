import { useUIStore } from '@/stores';
import type { Epic, Task } from '@/types';

function findSelectedTask(tasks: Task[], selectedTaskId: string | null): Task | null {
  if (!selectedTaskId) {
    return null;
  }

  return tasks.find((task) => task.id === selectedTaskId) ?? null;
}

function findSelectedEpic(epics: Epic[], selectedEpicId: string | null): Epic | null {
  if (!selectedEpicId) {
    return null;
  }

  return epics.find((epic) => epic.id === selectedEpicId) ?? null;
}

export function useTaskDetailActions(tasks: Task[], epics: Epic[]) {
  const {
    selectedEpicId,
    selectedTaskId,
    closeEpicDetail,
    closeTaskDetail,
    openEpicDetail,
    openTaskDetail,
  } = useUIStore();

  const selectedTask = findSelectedTask(tasks, selectedTaskId);
  const selectedEpic = findSelectedEpic(epics, selectedEpicId);
  let selectedEpicTasks: Task[] = [];
  if (selectedEpic) {
    selectedEpicTasks = tasks.filter((task) => task.epicId === selectedEpic.id);
  }

  function openHistoryEntity(type: 'epic' | 'task' | 'subtask', id: string) {
    if (type === 'epic') {
      openEpicDetail(id);
      return;
    }

    openTaskDetail(id);
  }

  function handleTaskModalEpicClick(epic: Epic) {
    closeTaskDetail();
    openEpicDetail(epic.id);
  }

  function handleEpicModalTaskClick(task: Task) {
    closeEpicDetail();
    const fullTask = tasks.find((currentTask) => currentTask.id === task.id);
    if (fullTask) {
      openTaskDetail(fullTask.id);
    }
  }

  return {
    closeEpicDetail,
    closeTaskDetail,
    handleEpicModalTaskClick,
    handleTaskModalEpicClick,
    openEpicDetail,
    openHistoryEntity,
    openTaskDetail,
    selectedEpic,
    selectedEpicTasks,
    selectedTask,
  };
}
