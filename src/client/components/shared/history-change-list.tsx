'use client';

import type { HistoryEvent } from '@/hooks/use-history';

interface HistoryChangeListProps {
  changes: HistoryEvent['changes'];
  compact?: boolean;
}

export function HistoryChangeList({ changes, compact = false }: HistoryChangeListProps) {
  if (!changes || Object.keys(changes).length === 0) {
    return null;
  }

  let className = 'space-y-1 text-xs';
  if (compact) {
    className = 'space-y-0.5 text-xs';
  }

  return (
    <div className={className}>
      {Object.entries(changes).map(([field, change]) => (
        <div key={field} className="flex items-center gap-1 text-muted-foreground">
          <span className="font-medium">{field}:</span>
          <span className="line-through">{String(change.from)}</span>
          <span>&rarr;</span>
          <span className="text-foreground">{String(change.to)}</span>
        </div>
      ))}
    </div>
  );
}
