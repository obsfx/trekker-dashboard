'use client';

import {
  type LinkSectionViewModel,
  LinksSectionView,
} from '@/components/task-detail/sidebar/links-section-view';
import type { Task } from '@/types';

interface LinksSectionProps {
  dependsOn: string[];
  blocks: string[];
  onTaskClick?: (task: Task) => void;
  getTaskById: (id: string) => Task | undefined;
}

export function LinksSection({ dependsOn, blocks, onTaskClick, getTaskById }: LinksSectionProps) {
  const sections: LinkSectionViewModel[] = [];

  if (dependsOn.length > 0) {
    sections.push({ title: 'Depends on', taskIds: dependsOn, variant: 'depends' });
  }

  if (blocks.length > 0) {
    sections.push({ title: 'Blocks', taskIds: blocks, variant: 'blocks' });
  }

  if (sections.length === 0) {
    return null;
  }

  function handleTaskClick(taskId: string) {
    const task = getTaskById(taskId);
    if (task && onTaskClick) {
      onTaskClick(task);
    }
  }

  return <LinksSectionView sections={sections} onTaskClick={handleTaskClick} />;
}
