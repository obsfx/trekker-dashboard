'use client';

import { DetailModalShell } from '@/components/shared';
import type { WorkItemViewProps } from '@/components/shared/work-item-view-props';
import { TaskSidebar, type TaskSidebarProps } from '@/components/task-detail/task-sidebar';

interface TaskViewProps extends WorkItemViewProps, TaskSidebarProps {}

export function TaskView({
  task,
  breadcrumbItems,
  status,
  priority,
  open,
  onClose,
  onEdit,
  ...sidebarProps
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
      <TaskSidebar {...sidebarProps} task={{ ...task, status, priority }} />
    </DetailModalShell>
  );
}
