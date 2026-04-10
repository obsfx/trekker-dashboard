'use client';

import { HistoryEventItem } from '@/components/history-event-item';
import type { HistoryEntityType, HistoryResponse } from '@/hooks/use-history';
import { PageResultsFrame } from '@/pages/page-results-frame';

interface HistoryPageResultsProps {
  error: unknown;
  isLoading: boolean;
  onEntityClick: (type: HistoryEntityType, id: string) => void;
  response: HistoryResponse | undefined;
}

export function HistoryPageResults({
  error,
  isLoading,
  onEntityClick,
  response,
}: HistoryPageResultsProps) {
  return (
    <PageResultsFrame
      content={
        <div>
          {response?.events.map((event) => (
            <HistoryEventItem key={event.id} event={event} onEntityClick={onEntityClick} />
          ))}
        </div>
      }
      emptyMessage="No events found"
      error={error}
      isEmpty={!response?.events.length}
      isLoading={isLoading}
    />
  );
}
