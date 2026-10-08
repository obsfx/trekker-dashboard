'use client';

import { EpicDetailModal } from '@/components/epic-detail';
import { TaskDetailModal } from '@/components/task-detail';
import { useAppData } from '@/hooks/use-data';
import { useTaskDetailActions } from '@/hooks/use-task-detail-actions';

export function EntityDetailModals() {
  const { epics, refetch, tasks } = useAppData();
  const {
    closeEpicDetail,
    closeTaskDetail,
    handleEpicModalTaskClick,
    handleTaskModalEpicClick,
    openTaskDetail,
    selectedEpic,
    selectedEpicTasks,
    selectedTask,
  } = useTaskDetailActions(tasks, epics);

  return (
    <>
      <TaskDetailModal
        task={selectedTask}
        epics={epics}
        allTasks={tasks}
        open={selectedTask !== null}
        onClose={closeTaskDetail}
        onUpdate={refetch}
        onTaskClick={(task) => openTaskDetail(task.id)}
        onEpicClick={handleTaskModalEpicClick}
      />

      <EpicDetailModal
        epic={selectedEpic}
        tasks={selectedEpicTasks}
        open={selectedEpic !== null}
        onClose={closeEpicDetail}
        onUpdate={refetch}
        onTaskClick={handleEpicModalTaskClick}
      />
    </>
  );
}
