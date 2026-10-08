'use client';

import { KanbanBoard } from '@/components/kanban';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getErrorMessage } from '@/lib/errors';
import { EntityDetailModals } from '@/pages/entity-detail-modals';
import { useKanbanPageState } from '@/pages/use-kanban-page-state';

export function KanbanPage() {
  const {
    epics,
    error,
    handleArchiveAllCompleted,
    isLoading,
    openArchiveConfirm,
    openCreateModal,
    openEpicDetail,
    openTaskDetail,
    showArchiveConfirm,
    tasks,
    updateArchiveConfirm,
  } = useKanbanPageState();

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
        <span className="text-destructive">Error: {getErrorMessage(error, 'Unknown error')}</span>
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
          onArchiveAllCompleted={openArchiveConfirm}
        />
      </main>

      <ConfirmDialog
        open={showArchiveConfirm}
        onOpenChange={updateArchiveConfirm}
        title="Archive All Completed"
        description="This will move all completed tasks and epics to the archived status. This action can be undone by manually changing their status back."
        confirmLabel="Archive All"
        onConfirm={handleArchiveAllCompleted}
      />

      <EntityDetailModals />
    </>
  );
}
