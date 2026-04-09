'use client';

import { EpicDetailModal } from '@/components/epic-detail';
import { TaskDetailModal } from '@/components/task-detail';
import type { Epic, Task } from '@/types';

interface EntityDetailModalsProps {
  allTasks: Task[];
  epics: Epic[];
  selectedEpic: Epic | null;
  selectedEpicTasks: Task[];
  selectedTask: Task | null;
  onCloseEpicDetail: () => void;
  onCloseTaskDetail: () => void;
  onEpicDetailTaskClick: (task: Task) => void;
  onTaskDetailEpicClick: (epic: Epic) => void;
  onTaskDetailTaskClick: (task: Task) => void;
  onUpdate: () => void;
}

export function EntityDetailModals({
  allTasks,
  epics,
  selectedEpic,
  selectedEpicTasks,
  selectedTask,
  onCloseEpicDetail,
  onCloseTaskDetail,
  onEpicDetailTaskClick,
  onTaskDetailEpicClick,
  onTaskDetailTaskClick,
  onUpdate,
}: EntityDetailModalsProps) {
  return (
    <>
      <TaskDetailModal
        task={selectedTask}
        epics={epics}
        allTasks={allTasks}
        open={selectedTask !== null}
        onClose={onCloseTaskDetail}
        onUpdate={onUpdate}
        onTaskClick={onTaskDetailTaskClick}
        onEpicClick={onTaskDetailEpicClick}
      />

      <EpicDetailModal
        epic={selectedEpic}
        tasks={selectedEpicTasks}
        open={selectedEpic !== null}
        onClose={onCloseEpicDetail}
        onUpdate={onUpdate}
        onTaskClick={onEpicDetailTaskClick}
      />
    </>
  );
}
