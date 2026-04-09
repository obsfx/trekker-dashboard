'use client';

import { TaskHistoryEventItem } from '@/components/task-detail/history-event-item';
import { useHistory } from '@/hooks/use-history';
import { DEFAULT_HISTORY_PAGE_SIZE } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';

interface HistoryTabProps {
  taskId: string;
}

export function HistoryTab({ taskId }: HistoryTabProps) {
  const { data, isLoading, error } = useHistory({
    entityId: taskId,
    limit: DEFAULT_HISTORY_PAGE_SIZE,
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-sm text-destructive">Error: {getErrorMessage(error, 'Unknown error')}</p>
      </div>
    );
  }

  if (!data?.events.length) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground italic">No history</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h4 className="text-sm font-medium mb-3">History ({data.events.length})</h4>
      <div>
        {data.events.map((event) => (
          <TaskHistoryEventItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
