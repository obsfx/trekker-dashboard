'use client';

import { TaskHistoryEventItemView } from '@/components/task-detail/task-history-event-item-view';
import type { HistoryEvent } from '@/hooks/use-history';

interface TaskHistoryEventItemProps {
  event: HistoryEvent;
}

export function TaskHistoryEventItem({ event }: TaskHistoryEventItemProps) {
  return (
    <TaskHistoryEventItemView
      action={event.action}
      changes={event.changes}
      showCreatedMessage={event.action === 'create' && Boolean(event.snapshot)}
      timestamp={event.timestamp}
    />
  );
}
