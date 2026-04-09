'use client';

import { ArrowLeftToLine, ArrowRightFromLine } from 'lucide-react';

import { cn } from '@/lib/utils';

interface TaskLinkProps {
  onClick: () => void;
  taskId: string;
  variant: 'depends' | 'blocks';
}

export function TaskLink({ taskId, variant, onClick }: TaskLinkProps) {
  let Icon = ArrowRightFromLine;
  let title = 'Blocks this task';
  if (variant === 'depends') {
    Icon = ArrowLeftToLine;
    title = 'Depends on this task';
  }

  return (
    <button
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-xs',
        'transition-colors hover:ring-1',
        variant === 'depends' &&
          'bg-amber-500/10 text-amber-600 hover:ring-amber-500/50 dark:text-amber-400',
        variant === 'blocks' &&
          'bg-rose-500/10 text-rose-600 hover:ring-rose-500/50 dark:text-rose-400'
      )}
      onClick={onClick}
      title={title}
    >
      <Icon className="h-3 w-3" />
      {taskId}
    </button>
  );
}
