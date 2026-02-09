"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";
import {
  useHistory,
  type HistoryFilters,
  type HistoryEntityType,
  type HistoryAction,
} from "@/hooks/use-history";
import { useAppData } from "@/hooks/use-data";
import { useUIStore } from "@/stores";
import { TaskDetailModal } from "@/components/task-detail";
import { EpicDetailModal } from "@/components/epic-detail";
import { HistoryEventItem } from "@/components/history-event-item";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HISTORY_TYPE_OPTIONS: { value: HistoryEntityType; label: string }[] = [
  { value: "epic", label: "Epic" },
  { value: "task", label: "Task" },
  { value: "subtask", label: "Subtask" },
  { value: "comment", label: "Comment" },
  { value: "dependency", label: "Dependency" },
];

const HISTORY_ACTION_OPTIONS: { value: HistoryAction; label: string; icon: typeof Plus }[] = [
  { value: "create", label: "Created", icon: Plus },
  { value: "update", label: "Updated", icon: Pencil },
  { value: "delete", label: "Deleted", icon: Trash2 },
];

export function HistoryPage() {
  const { tasks, epics, refetch } = useAppData();
  const {
    selectedTaskId,
    selectedEpicId,
    openTaskDetail,
    openEpicDetail,
    closeTaskDetail,
    closeEpicDetail,
  } = useUIStore();

  const [filters, setFilters] = useState<HistoryFilters>({
    limit: 50,
    page: 1,
  });

  const { data, isLoading, error } = useHistory(filters);

  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) || null
    : null;

  const selectedEpic = selectedEpicId
    ? epics.find((e) => e.id === selectedEpicId) || null
    : null;

  const handleEntityClick = (type: HistoryEntityType, id: string) => {
    if (type === "epic") {
      openEpicDetail(id);
    } else if (type === "task" || type === "subtask") {
      openTaskDetail(id);
    }
  };

  const totalPages = data ? Math.ceil(data.total / (filters.limit || 50)) : 0;

  return (
    <>
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Type filter */}
          <Select
            value={filters.types?.join(",") || "all"}
            onValueChange={(v) => {
              if (v === "all") {
                setFilters({ ...filters, types: undefined, page: 1 });
              } else {
                const types = v.split(",").filter(
                  (t): t is HistoryEntityType => HISTORY_TYPE_OPTIONS.some((opt) => opt.value === t),
                );
                setFilters({ ...filters, types, page: 1 });
              }
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {HISTORY_TYPE_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Action filter */}
          <Select
            value={filters.actions?.join(",") || "all"}
            onValueChange={(v) => {
              if (v === "all") {
                setFilters({ ...filters, actions: undefined, page: 1 });
              } else {
                const actions = v.split(",").filter(
                  (a): a is HistoryAction => HISTORY_ACTION_OPTIONS.some((opt) => opt.value === a),
                );
                setFilters({ ...filters, actions, page: 1 });
              }
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {HISTORY_ACTION_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date range - simplified */}
          <input
            type="date"
            className="h-9 px-3 text-sm border rounded-md bg-background"
            value={filters.since?.split("T")[0] || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                since: e.target.value ? `${e.target.value}T00:00:00Z` : undefined,
                page: 1,
              })
            }
            placeholder="Since"
          />
          <input
            type="date"
            className="h-9 px-3 text-sm border rounded-md bg-background"
            value={filters.until?.split("T")[0] || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                until: e.target.value ? `${e.target.value}T23:59:59Z` : undefined,
                page: 1,
              })
            }
            placeholder="Until"
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground">Loading...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-destructive">
                Error: {error instanceof Error ? error.message : "Unknown error"}
              </span>
            </div>
          ) : !data?.events.length ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground">No events found</span>
            </div>
          ) : (
            <div>
              {data.events.map((event) => (
                <HistoryEventItem
                  key={event.id}
                  event={event}
                  onEntityClick={handleEntityClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.total > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((filters.page || 1) - 1) * (filters.limit || 50) + 1}-
              {Math.min((filters.page || 1) * (filters.limit || 50), data.total)} of {data.total}{" "}
              events
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={(filters.page || 1) <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {filters.page || 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                disabled={(filters.page || 1) >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        epics={epics}
        allTasks={tasks}
        open={selectedTask !== null}
        onClose={closeTaskDetail}
        onUpdate={refetch}
        onTaskClick={(task) => openTaskDetail(task.id)}
        onEpicClick={(epic) => {
          closeTaskDetail();
          openEpicDetail(epic.id);
        }}
      />

      <EpicDetailModal
        epic={selectedEpic}
        tasks={selectedEpic ? tasks.filter((t) => t.epicId === selectedEpic.id) : []}
        open={selectedEpic !== null}
        onClose={closeEpicDetail}
        onUpdate={refetch}
        onTaskClick={(task) => {
          closeEpicDetail();
          const fullTask = tasks.find((t) => t.id === task.id);
          if (fullTask) openTaskDetail(fullTask.id);
        }}
      />
    </>
  );
}
