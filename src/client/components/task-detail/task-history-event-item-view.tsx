'use client';

import { ActionIcon, getActionColor } from '@/components/shared';
import { HistoryChangeList } from '@/components/shared/history-change-list';
import type { HistoryEvent } from '@/hooks/use-history';
import { formatRelativeTime } from '@/lib/date';
import { cn } from '@/lib/utils';

interface TaskHistoryEventItemViewProps {
  action: HistoryEvent['action'];
  changes: HistoryEvent['changes'];
  showCreatedMessage: boolean;
  timestamp: string;
}

export function TaskHistoryEventItemView({
  action,
  changes,
  showCreatedMessage,
  timestamp,
}: TaskHistoryEventItemViewProps) {
  return (
    <div className="flex gap-2.5 border-b py-2.5 last:border-b-0">
      <div className="mt-0.5">
        <ActionIcon action={action} className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <span className={cn('text-xs font-medium capitalize', getActionColor(action))}>
            {action}d
          </span>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(timestamp)}</span>
        </div>

        <HistoryChangeList changes={changes} compact />

        {showCreatedMessage && <p className="text-xs text-muted-foreground">Task created</p>}
      </div>
    </div>
  );
}
