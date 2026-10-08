'use client';

import { ActionIcon, getActionColor } from '@/components/shared';
import { HistoryChangeList } from '@/components/shared/history-change-list';
import { Badge } from '@/components/ui/badge';
import type { HistoryEntityType, HistoryEvent } from '@/hooks/use-history';
import { formatRelativeTime } from '@/lib/date';
import { cn } from '@/lib/utils';

interface HistoryEventItemProps {
  event: HistoryEvent;
  onEntityClick: (type: HistoryEntityType, id: string) => void;
}

export function HistoryEventItem({ event, onEntityClick }: HistoryEventItemProps) {
  const canClick =
    event.action !== 'delete' && ['epic', 'task', 'subtask'].includes(event.entityType);

  return (
    <div className="flex gap-3 p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
      <div className="mt-0.5">
        <ActionIcon action={event.action} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <button
            className={cn(
              'font-mono text-sm',
              canClick && 'hover:underline cursor-pointer',
              event.action === 'delete' && 'line-through text-muted-foreground'
            )}
            onClick={() => canClick && onEntityClick(event.entityType, event.entityId)}
            disabled={!canClick}
          >
            {event.entityId}
          </button>
          <span className={cn('text-sm font-medium', getActionColor(event.action))}>
            {event.action}d
          </span>
          <Badge variant="outline" className="text-xs">
            {event.entityType}
          </Badge>
        </div>

        {event.title && (
          <p
            className={cn(
              'text-sm mb-2',
              event.action === 'delete' && 'line-through text-muted-foreground'
            )}
          >
            {event.title}
          </p>
        )}

        <HistoryChangeList changes={event.changes} />
      </div>
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {formatRelativeTime(event.timestamp)}
      </div>
    </div>
  );
}
