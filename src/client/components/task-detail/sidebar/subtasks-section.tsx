'use client';

import { SectionHeader } from '@/components/shared';
import { SubtaskItem } from '@/components/task-detail/sidebar/subtask-item';
import type { Task } from '@/types';

interface SubtasksSectionProps {
  subtasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function SubtasksSection({ subtasks, onTaskClick }: SubtasksSectionProps) {
  if (subtasks.length === 0) {
    return null;
  }

  const completedCount = subtasks.filter((s) => s.status === 'completed').length;

  return (
    <div>
      <SectionHeader count={{ current: completedCount, total: subtasks.length }}>
        Subtasks
      </SectionHeader>
      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <SubtaskItem key={subtask.id} subtask={subtask} onClick={() => onTaskClick?.(subtask)} />
        ))}
      </div>
    </div>
  );
}
