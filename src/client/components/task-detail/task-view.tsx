'use client';

import type { BreadcrumbItem } from '@/components/breadcrumb';
import { DetailModalShell } from '@/components/shared';
import { TaskSidebar } from '@/components/task-detail/task-sidebar';
import type { Epic, Task } from '@/types';

interface TaskViewProps {
  task: Task;
  subtasks: Task[];
  breadcrumbItems: BreadcrumbItem[];
  status: string;
  priority: number;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: number) => void;
  onTaskClick?: (task: Task) => void;
  onEpicClick?: (epic: Epic) => void;
  getEpicById: (id: string) => Epic | undefined;
  getTaskById: (id: string) => Task | undefined;
}

export function TaskView({
  task,
  subtasks,
  breadcrumbItems,
  status,
  priority,
  open,
  onClose,
  onEdit,
  onStatusChange,
  onPriorityChange,
  onTaskClick,
  onEpicClick,
  getEpicById,
  getTaskById,
}: TaskViewProps) {
  return (
    <DetailModalShell
      open={open}
      onClose={onClose}
      breadcrumbItems={breadcrumbItems}
      title={task.title}
      description={task.description}
      onEdit={onEdit}
    >
      <TaskSidebar
        task={{ ...task, status, priority }}
        subtasks={subtasks}
        onStatusChange={onStatusChange}
        onPriorityChange={onPriorityChange}
        onTaskClick={onTaskClick}
        onEpicClick={onEpicClick}
        getEpicById={getEpicById}
        getTaskById={getTaskById}
      />
    </DetailModalShell>
  );
}
