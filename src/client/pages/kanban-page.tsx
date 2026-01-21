"use client";

import { useState } from "react";
import { useAppData, useBulkArchiveCompleted } from "@/hooks/use-data";
import { useTaskEvents } from "@/hooks/use-task-events";
import { useUIStore } from "@/stores";
import { KanbanBoard } from "@/components/kanban";
import { TaskDetailModal } from "@/components/task-detail";
import { EpicDetailModal } from "@/components/epic-detail";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function KanbanPage() {
  const { tasks, epics, isLoading, error, refetch } = useAppData();
  const bulkArchive = useBulkArchiveCompleted();
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const {
    selectedTaskId,
    selectedEpicId,
    openTaskDetail,
    openEpicDetail,
    openCreateModal,
    closeTaskDetail,
    closeEpicDetail,
  } = useUIStore();

  // Subscribe to SSE events
  useTaskEvents(refetch);

  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) || null
    : null;

  const selectedEpic = selectedEpicId
    ? epics.find((e) => e.id === selectedEpicId) || null
    : null;

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center flex-1">
        <span className="text-destructive">
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </span>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 p-4 overflow-x-auto">
        <KanbanBoard
          tasks={tasks}
          epics={epics}
          onAddClick={(status) => openCreateModal({ status })}
          onTaskClick={(task) => openTaskDetail(task.id)}
          onEpicClick={(epic) => openEpicDetail(epic.id)}
          onArchiveAllCompleted={() => setShowArchiveConfirm(true)}
        />
      </main>

      <ConfirmDialog
        open={showArchiveConfirm}
        onOpenChange={setShowArchiveConfirm}
        title="Archive All Completed"
        description="This will move all completed tasks and epics to the archived status. This action can be undone by manually changing their status back."
        confirmLabel="Archive All"
        onConfirm={() => bulkArchive.mutate()}
      />

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
