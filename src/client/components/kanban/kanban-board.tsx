'use client';

import { KanbanColumn } from '@/components/kanban/kanban-column';
import type { Epic, Task } from '@/types';

const STATUS_COLUMNS = [
  { key: 'todo', label: 'TODO' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'wont_fix', label: "Won't Fix" },
] as const;

interface KanbanBoardProps {
  tasks: Task[];
  epics: Epic[];
  onAddClick: (status: string) => void;
  onTaskClick: (task: Task) => void;
  onEpicClick: (epic: Epic) => void;
  onArchiveAllCompleted?: () => void;
}

export function KanbanBoard({
  tasks,
  epics,
  onAddClick,
  onTaskClick,
  onEpicClick,
  onArchiveAllCompleted,
}: KanbanBoardProps) {
  const topLevelTasks = tasks.filter((task) => !task.parentTaskId);

  const getTasksByStatus = (status: string) =>
    topLevelTasks.filter((task) => task.status === status);

  const getEpicsByStatus = (status: string) => epics.filter((epic) => epic.status === status);

  function getArchiveHandler(columnKey: (typeof STATUS_COLUMNS)[number]['key']) {
    if (columnKey === 'completed') {
      return onArchiveAllCompleted;
    }
  }

  return (
    <div className="flex gap-4 items-start flex-nowrap min-h-[calc(100vh-180px)]">
      {STATUS_COLUMNS.map((column) => (
        <KanbanColumn
          key={column.key}
          label={column.label}
          tasks={getTasksByStatus(column.key)}
          epics={getEpicsByStatus(column.key)}
          allTasks={tasks}
          allEpics={epics}
          onAddClick={() => onAddClick(column.key)}
          onTaskClick={onTaskClick}
          onEpicClick={onEpicClick}
          onArchiveAll={getArchiveHandler(column.key)}
        />
      ))}
    </div>
  );
}
