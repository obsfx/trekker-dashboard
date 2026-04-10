'use client';

import { SectionHeader } from '@/components/shared';
import { TaskLink } from '@/components/task-detail/sidebar/task-link';

export interface LinkSectionViewModel {
  title: string;
  taskIds: string[];
  variant: 'depends' | 'blocks';
}

interface LinksSectionViewProps {
  sections: readonly LinkSectionViewModel[];
  onTaskClick: (taskId: string) => void;
}

export function LinksSectionView({ sections, onTaskClick }: LinksSectionViewProps) {
  return (
    <div>
      <SectionHeader>Dependencies</SectionHeader>

      <div className="space-y-2">
        {sections.map(({ title, taskIds, variant }) => (
          <div key={variant}>
            <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground">
              {title}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {taskIds.map((taskId) => (
                <TaskLink
                  key={taskId}
                  taskId={taskId}
                  variant={variant}
                  onClick={() => onTaskClick(taskId)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
