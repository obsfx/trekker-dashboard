"use client";

import type { HistoryEvent, HistoryEntityType } from "@/hooks/use-history";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/date";
import { ActionIcon, getActionColor } from "@/components/shared";
import { Badge } from "@/components/ui/badge";

interface HistoryEventItemProps {
  event: HistoryEvent;
  onEntityClick: (type: HistoryEntityType, id: string) => void;
}

export function HistoryEventItem({ event, onEntityClick }: HistoryEventItemProps) {
  const titleChange = event.changes?.title;
  const rawTitle =
    event.snapshot?.title ||
    (titleChange ? (titleChange.to || titleChange.from) : null);
  const title = rawTitle ? String(rawTitle) : null;

  const canClick =
    event.action !== "delete" &&
    ["epic", "task", "subtask"].includes(event.entityType);

  return (
    <div className="flex gap-3 p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
      <div className="mt-0.5">
        <ActionIcon action={event.action} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <button
            className={cn(
              "font-mono text-sm",
              canClick && "hover:underline cursor-pointer",
              event.action === "delete" && "line-through text-muted-foreground",
            )}
            onClick={() =>
              canClick && onEntityClick(event.entityType, event.entityId)
            }
            disabled={!canClick}
          >
            {event.entityId}
          </button>
          <span
            className={cn(
              "text-sm font-medium",
              getActionColor(event.action),
            )}
          >
            {event.action}d
          </span>
          <Badge variant="outline" className="text-xs">
            {event.entityType}
          </Badge>
        </div>

        {title && (
          <p
            className={cn(
              "text-sm mb-2",
              event.action === "delete" &&
                "line-through text-muted-foreground",
            )}
          >
            {title}
          </p>
        )}

        {event.changes && Object.keys(event.changes).length > 0 && (
          <div className="text-xs space-y-1">
            {Object.entries(event.changes).map(([field, change]) => (
              <div
                key={field}
                className="flex items-center gap-1 text-muted-foreground"
              >
                <span className="font-medium">{field}:</span>
                <span className="line-through">{String(change.from)}</span>
                <span>→</span>
                <span className="text-foreground">{String(change.to)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {formatRelativeTime(event.timestamp)}
      </div>
    </div>
  );
}
