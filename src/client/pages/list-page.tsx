"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useList, ListFilters, ListEntityType, ListItem } from "@/hooks/use-list";
import { useAppData } from "@/hooks/use-data";
import { useUIStore } from "@/stores";
import { TaskDetailModal } from "@/components/task-detail";
import { EpicDetailModal } from "@/components/epic-detail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { SORT_OPTIONS } from "@/lib/sort";
import {
  TASK_STATUSES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_STYLES,
  PRIORITY_STYLES,
} from "@/lib/constants";

const TYPE_OPTIONS: { value: ListEntityType; label: string }[] = [
  { value: "epic", label: "Epic" },
  { value: "task", label: "Task" },
  { value: "subtask", label: "Subtask" },
];

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export function ListPage() {
  const { tasks, epics, refetch } = useAppData();
  const {
    selectedTaskId,
    selectedEpicId,
    openTaskDetail,
    openEpicDetail,
    closeTaskDetail,
    closeEpicDetail,
  } = useUIStore();

  const [filters, setFilters] = useState<ListFilters>({
    limit: 20,
    page: 1,
    sort: "created:desc",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useList(filters);

  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) || null
    : null;

  const selectedEpic = selectedEpicId
    ? epics.find((e) => e.id === selectedEpicId) || null
    : null;

  const handleRowClick = (item: ListItem) => {
    if (item.type === "epic") {
      openEpicDetail(item.id);
    } else {
      openTaskDetail(item.id);
    }
  };

  const toggleTypeFilter = (type: ListEntityType) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    setFilters({ ...filters, types: newTypes.length ? newTypes : undefined, page: 1 });
  };

  const toggleStatusFilter = (status: string) => {
    const currentStatuses = filters.statuses || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];
    setFilters({ ...filters, statuses: newStatuses.length ? newStatuses : undefined, page: 1 });
  };

  const togglePriorityFilter = (priority: number) => {
    const currentPriorities = filters.priorities || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter((p) => p !== priority)
      : [...currentPriorities, priority];
    setFilters({ ...filters, priorities: newPriorities.length ? newPriorities : undefined, page: 1 });
  };

  const clearFilters = () => {
    setFilters({ limit: filters.limit, page: 1, sort: filters.sort });
    setSearchQuery("");
  };

  const hasActiveFilters = !!(filters.types?.length || filters.statuses?.length || filters.priorities?.length);

  const totalPages = data ? Math.ceil(data.total / (filters.limit || 20)) : 0;

  return (
    <>
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Type filter */}
          <div className="flex gap-1">
            {TYPE_OPTIONS.map(({ value, label }) => (
              <Button
                key={value}
                variant={filters.types?.includes(value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTypeFilter(value)}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Status filter */}
          <Select
            value={filters.statuses?.join(",") || "all"}
            onValueChange={(v) => {
              if (v === "all") {
                setFilters({ ...filters, statuses: undefined, page: 1 });
              } else {
                setFilters({ ...filters, statuses: v.split(","), page: 1 });
              }
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {TASK_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority filter */}
          <Select
            value={filters.priorities?.join(",") || "all"}
            onValueChange={(v) => {
              if (v === "all") {
                setFilters({ ...filters, priorities: undefined, page: 1 });
              } else {
                setFilters({ ...filters, priorities: v.split(",").map(Number), page: 1 });
              }
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  P{value} - {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={filters.sort || "created:desc"}
            onValueChange={(v) => setFilters({ ...filters, sort: v, page: 1 })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
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
          ) : !data?.items.length ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground">No items found</span>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0">
                <tr className="text-left text-sm">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.items
                  .filter((item) =>
                    searchQuery
                      ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.id.toLowerCase().includes(searchQuery.toLowerCase())
                      : true
                  )
                  .map((item) => (
                    <tr
                      key={item.id}
                      className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(item)}
                    >
                      <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                        {item.id}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            item.type === "epic" && "border-purple-500 text-purple-500",
                            item.type === "task" && "border-blue-500 text-blue-500",
                            item.type === "subtask" && "border-gray-500 text-gray-500"
                          )}
                        >
                          {item.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 max-w-md truncate">{item.title}</td>
                      <td className="px-4 py-3">
                        <Badge
                          style={{
                            backgroundColor: STATUS_STYLES[item.status]?.bg || "#6b7280",
                            color: STATUS_STYLES[item.status]?.text || "#ffffff",
                          }}
                        >
                          {STATUS_LABELS[item.status] || item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: PRIORITY_STYLES[item.priority]?.bg || "#6b7280",
                            color: PRIORITY_STYLES[item.priority]?.bg || "#6b7280",
                          }}
                        >
                          P{item.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {data && data.total > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Showing {((filters.page || 1) - 1) * (filters.limit || 20) + 1}-
                {Math.min((filters.page || 1) * (filters.limit || 20), data.total)} of{" "}
                {data.total}
              </span>
              <Select
                value={(filters.limit || 20).toString()}
                onValueChange={(v) => setFilters({ ...filters, limit: parseInt(v, 10), page: 1 })}
              >
                <SelectTrigger className="w-[80px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>per page</span>
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
