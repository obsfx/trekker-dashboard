'use client';

import type { BreadcrumbItem } from '@/components/breadcrumb';
import { EpicSidebar } from '@/components/epic-detail/epic-sidebar';
import { DetailModalShell } from '@/components/shared';
import type { Epic, Task } from '@/types';

interface EpicViewProps {
  epic: Epic;
  tasks: Task[];
  breadcrumbItems: BreadcrumbItem[];
  status: string;
  priority: number;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: number) => void;
  onTaskClick?: (task: Task) => void;
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
