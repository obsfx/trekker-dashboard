"use client";

import { Square, SquareCheck as CheckSquare, Archive, SquareX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/shared";
import type { Task } from "@/types";

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckSquare className="h-4 w-4 text-green-500 shrink-0" />;
    case "archived":
      return <Archive className="h-4 w-4 text-gray-400 shrink-0" />;
    case "wont_fix":
      return <SquareX className="h-4 w-4 text-amber-500 shrink-0" />;
    default:
      return <Square className="h-4 w-4 opacity-50 shrink-0" />;
  }
}

interface SubtasksSectionProps {
  subtasks: Task[];
  onTaskClick?: (task: Task) => void;
}

interface SubtaskItemProps {
  subtask: Task;
  onClick: () => void;
}

function SubtaskItem({ subtask, onClick }: SubtaskItemProps) {
  const isDone = subtask.status === "completed" || subtask.status === "archived" || subtask.status === "wont_fix";

  return (
    <Button
      variant="ghost"
      className="w-full justify-start h-auto p-1.5 gap-2"
      onClick={onClick}
    >
      {getStatusIcon(subtask.status)}
      <span className="font-mono text-xs text-muted-foreground">
        {subtask.id}
      </span>
      <span
        className={cn(
          "text-sm flex-1 text-left truncate",
          isDone && "line-through text-muted-foreground"
        )}
      >
        {subtask.title}
      </span>
    </Button>
  );
}

export function SubtasksSection({ subtasks, onTaskClick }: SubtasksSectionProps) {
  if (subtasks.length === 0) {
    return null;
  }

  const completedCount = subtasks.filter((s) => s.status === "completed").length;

  return (
    <div>
      <SectionHeader count={{ current: completedCount, total: subtasks.length }}>
        Subtasks
      </SectionHeader>
      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <SubtaskItem
            key={subtask.id}
            subtask={subtask}
            onClick={() => onTaskClick?.(subtask)}
          />
        ))}
      </div>
    </div>
  );
}
