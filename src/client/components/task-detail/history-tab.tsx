"use client";

import { useHistory, type HistoryEvent } from "@/hooks/use-history";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/date";
import { ActionIcon, getActionColor } from "@/components/shared";

interface HistoryTabProps {
  taskId: string;
}

function HistoryEventItem({ event }: { event: HistoryEvent }) {
  return (
    <div className="flex gap-2.5 py-2.5 border-b last:border-b-0">
      <div className="mt-0.5">
        <ActionIcon action={event.action} className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn("text-xs font-medium capitalize", getActionColor(event.action))}>
            {event.action}d
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(event.timestamp)}
          </span>
        </div>

        {event.changes && Object.keys(event.changes).length > 0 && (
          <div className="text-xs space-y-0.5">
            {Object.entries(event.changes).map(([field, change]) => (
              <div key={field} className="flex items-center gap-1 text-muted-foreground">
                <span className="font-medium">{field}:</span>
                <span className="line-through">{String(change.from)}</span>
                <span>→</span>
                <span className="text-foreground">{String(change.to)}</span>
              </div>
            ))}
          </div>
        )}

        {event.action === "create" && event.snapshot && (
          <p className="text-xs text-muted-foreground">
            Task created
          </p>
        )}
      </div>
    </div>
  );
}

export function HistoryTab({ taskId }: HistoryTabProps) {
  const { data, isLoading, error } = useHistory({
    entityId: taskId,
    limit: 50,
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
        <p className="text-sm text-destructive">
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </p>
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
      <h4 className="text-sm font-medium mb-3">
        History ({data.events.length})
      </h4>
      <div>
        {data.events.map((event) => (
          <HistoryEventItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
