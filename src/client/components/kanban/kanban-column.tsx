"use client";

import { useState, useMemo } from "react";
import { Plus, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Task, Epic } from "@/types";
import { TaskCard } from "./task-card";
import { EpicCard } from "./epic-card";
import { compareBySortOption } from "@/lib/sort";
import {
  ColumnFilter,
  DEFAULT_FILTER,
  type ColumnFilterState,
} from "./column-filter";

interface KanbanColumnProps {
  label: string;
  tasks: Task[];
  epics: Epic[];
  allTasks: Task[];
  allEpics: Epic[];
  onAddClick: () => void;
  onTaskClick: (task: Task) => void;
  onEpicClick: (epic: Epic) => void;
  onArchiveAll?: () => void;
}

export function KanbanColumn({
  label,
  tasks,
  epics,
  allTasks,
  allEpics,
  onAddClick,
  onTaskClick,
  onEpicClick,
  onArchiveAll,
}: KanbanColumnProps) {
  const [filter, setFilter] = useState<ColumnFilterState>(DEFAULT_FILTER);

  const filteredEpics = useMemo(() => {
    if (filter.type === "task") return [];
    return [...epics].sort((a, b) => compareBySortOption(a, b, filter.sort));
  }, [epics, filter]);

  const filteredTasks = useMemo(() => {
    if (filter.type === "epic") return [];
    return [...tasks].sort((a, b) => compareBySortOption(a, b, filter.sort));
  }, [tasks, filter]);

  const totalCount = filteredTasks.length + filteredEpics.length;

  const getEpicName = (epicId: string | null) => {
    if (!epicId) return null;
    const epic = allEpics.find((e) => e.id === epicId);
    return epic?.title || epicId;
  };

  const getSubtasks = (taskId: string) =>
    allTasks.filter((t) => t.parentTaskId === taskId);

  const getTaskCountForEpic = (epicId: string) => {
    const epicTasks = allTasks.filter(
      (t) => t.epicId === epicId && !t.parentTaskId
    );
    const completed = epicTasks.filter((t) => t.status === "completed").length;
    return { total: epicTasks.length, completed };
  };

  return (
    <div className="w-[280px] min-w-[280px] max-w-[320px] flex flex-col border rounded-md">
      {/* Column Header */}
      <div className="flex items-center justify-between border-b p-2 bg-accent/50">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{label}</span>
          <Badge variant="secondary" className="text-xs">
            {totalCount}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <ColumnFilter value={filter} onChange={setFilter} />
          {onArchiveAll && totalCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onArchiveAll}
              title="Archive all completed items"
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onAddClick}
            title={`Add task to ${label}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 min-h-[100px] overflow-y-auto">
        <div className="flex flex-col gap-2 p-2">
          {filteredEpics.map((epic) => (
            <EpicCard
              key={epic.id}
              epic={epic}
              taskCount={getTaskCountForEpic(epic.id)}
              onClick={() => onEpicClick(epic)}
            />
          ))}
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              epicName={getEpicName(task.epicId)}
              subtasks={getSubtasks(task.id)}
              onClick={() => onTaskClick(task)}
            />
          ))}
          {totalCount === 0 && (
            <div className="flex items-center justify-center min-h-[80px] text-sm text-muted-foreground italic">
              No items
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
