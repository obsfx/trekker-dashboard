'use client';

import { EpicSidebar } from '@/components/epic-detail/epic-sidebar';
import { DetailModalShell } from '@/components/shared';
import type { WorkItemViewProps } from '@/components/shared/work-item-view-props';
import type { Epic, Task } from '@/types';

interface EpicViewProps extends WorkItemViewProps {
  epic: Epic;
  tasks: Task[];
}

export function EpicView({
  epic,
  tasks,
  breadcrumbItems,
  status,
  priority,
  open,
  onClose,
  onEdit,
  onStatusChange,
  onPriorityChange,
  onTaskClick,
}: EpicViewProps) {
  return (
    <DetailModalShell
      open={open}
      onClose={onClose}
      breadcrumbItems={breadcrumbItems}
      title={epic.title}
      description={epic.description}
      onEdit={onEdit}
    >
      <EpicSidebar
        status={status}
        priority={priority}
        tasks={tasks}
        createdAt={epic.createdAt}
        updatedAt={epic.updatedAt}
        onStatusChange={onStatusChange}
        onPriorityChange={onPriorityChange}
        onTaskClick={onTaskClick}
      />
    </DetailModalShell>
  );
}
