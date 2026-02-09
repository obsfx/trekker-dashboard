"use client";

import type { Epic } from "@/types";
import { PriorityBadge } from "@/components/priority-badge";
import { Progress } from "@/components/ui/progress";
import { formatRelativeTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

interface EpicCardProps {
  epic: Epic;
  taskCount: { total: number; completed: number };
  onClick: () => void;
}

function getProgressColor(pct: number): string {
  if (pct === 100) return "[&>div]:bg-green-500";
  if (pct >= 67) return "[&>div]:bg-blue-500";
  if (pct >= 34) return "[&>div]:bg-yellow-500";
  return "[&>div]:bg-red-500";
}

export function EpicCard({ epic, taskCount, onClick }: EpicCardProps) {
  const percentage =
    taskCount.total > 0
      ? Math.round((taskCount.completed / taskCount.total) * 100)
      : 0;

  return (
    <div
      className="p-2 cursor-pointer bg-blue-50 dark:bg-blue-800 hover:ring wrap-break-word"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Layers width={16} />
          <span className="font-mono text-xs font-medium text-foreground">
            {epic.id}
          </span>
        </div>
        <PriorityBadge priority={epic.priority} />
      </div>

      <h4 className="text-sm font-medium mb-2">{epic.title}</h4>

      <div className="border-t pt-1.5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {taskCount.completed}/{taskCount.total} tasks
          </p>
          <span className="text-[10px] text-muted-foreground font-mono">
            {percentage}%
          </span>
        </div>
        {taskCount.total > 0 && (
          <Progress
            value={percentage}
            className={cn("h-1.5", getProgressColor(percentage))}
          />
        )}
        <p className="text-[10px] text-muted-foreground">
          {formatRelativeTime(epic.createdAt)}
        </p>
      </div>
    </div>
  );
}
