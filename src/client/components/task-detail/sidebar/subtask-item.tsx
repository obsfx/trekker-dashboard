'use client';

import { StatusIcon } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { isTerminalStatus } from '@/lib/status';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface SubtaskItemProps {
  onClick: () => void;
  subtask: Task;
}

export function SubtaskItem({ subtask, onClick }: SubtaskItemProps) {
  const isDone = isTerminalStatus(subtask.status);

  return (
    <Button variant="ghost" className="h-auto w-full justify-start gap-2 p-1.5" onClick={onClick}>
      <StatusIcon status={subtask.status} />
      <span className="font-mono text-xs text-muted-foreground">{subtask.id}</span>
      <span
        className={cn(
          'flex-1 truncate text-left text-sm',
          isDone && 'text-muted-foreground line-through'
        )}
      >
        {subtask.title}
      </span>
    </Button>
  );
}
