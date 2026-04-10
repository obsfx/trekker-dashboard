'use client';

import { PrioritySelect, SectionHeader, StatusSelect } from '@/components/shared';
import { DetailRow } from '@/components/task-detail/sidebar/detail-row';
import { EpicLinkRow } from '@/components/task-detail/sidebar/epic-link-row';
import { TaskTagsRow } from '@/components/task-detail/sidebar/task-tags-row';
import { TASK_STATUSES } from '@/lib/constants';
import type { Epic, Task } from '@/types';

interface DetailsSectionProps {
  task: Task;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: number) => void;
  onEpicClick?: (epic: Epic) => void;
  getEpicById: (id: string) => Epic | undefined;
}

export function DetailsSection({
  task,
  onStatusChange,
  onPriorityChange,
  onEpicClick,
  getEpicById,
}: DetailsSectionProps) {
  let epic: Epic | null = null;
  if (task.epicId) {
    epic = getEpicById(task.epicId) ?? null;
  }

  const tags =
    task.tags
      ?.split(',')
      .map((tag) => tag.trim())
      .filter(Boolean) ?? [];

  return (
    <div>
      <SectionHeader>Details</SectionHeader>

      <div className="space-y-2">
        <DetailRow label="Status">
          <StatusSelect
            value={task.status}
            onChange={onStatusChange}
            statuses={TASK_STATUSES}
            triggerClassName="w-auto h-8 text-right"
          />
        </DetailRow>

        <DetailRow label="Priority">
          <PrioritySelect
            value={task.priority}
            onChange={onPriorityChange}
            triggerClassName="w-auto h-8 text-right"
          />
        </DetailRow>

        {epic && <EpicLinkRow epic={epic} onEpicClick={onEpicClick} />}
        <TaskTagsRow tags={tags} />
      </div>
    </div>
  );
}
