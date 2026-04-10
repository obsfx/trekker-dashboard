'use client';

import {
  Metadata,
  PrioritySelect,
  SectionHeader,
  StatusIcon,
  StatusSelect,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { EPIC_STATUSES } from '@/lib/constants';
import { isTerminalStatus } from '@/lib/status';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface EpicSidebarProps {
  status: string;
  priority: number;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: number) => void;
  onTaskClick?: (task: Task) => void;
}

export function EpicSidebar({
  status,
  priority,
  tasks,
  createdAt,
  updatedAt,
  onStatusChange,
  onPriorityChange,
  onTaskClick,
}: EpicSidebarProps) {
  const epicTasks = tasks.filter((t) => !t.parentTaskId);
  const completedTasks = epicTasks.filter((t) => isTerminalStatus(t.status)).length;

  return (
    <div className="p-4 bg-muted/30 rounded-b-md">
      <div className="space-y-6">
        {/* Details section */}
        <div>
          <SectionHeader>Details</SectionHeader>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusSelect
                value={status}
                onChange={onStatusChange}
                statuses={EPIC_STATUSES}
                triggerClassName="w-auto h-8 text-right"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Priority</span>
              <PrioritySelect
                value={priority}
                onChange={onPriorityChange}
                triggerClassName="w-auto h-8 text-right"
              />
            </div>
          </div>
        </div>

        {/* Tasks section */}
        {epicTasks.length > 0 && (
          <div>
            <SectionHeader count={{ current: completedTasks, total: epicTasks.length }}>
              Tasks
            </SectionHeader>
            <div className="space-y-1">
              {epicTasks.map((task) => {
                const isDone = isTerminalStatus(task.status);
                return (
                  <Button
                    key={task.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-1.5 gap-2 whitespace-normal"
                    onClick={() => onTaskClick?.(task)}
                  >
                    <StatusIcon status={task.status} />
                    <span className="font-mono text-xs text-muted-foreground shrink-0">
                      {task.id}
                    </span>
                    <span
                      className={cn(
                        'text-sm flex-1 text-left wrap-break-words',
                        isDone && 'line-through text-muted-foreground'
                      )}
                    >
                      {task.title}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <Metadata createdAt={createdAt} updatedAt={updatedAt} />
      </div>
    </div>
  );
}
