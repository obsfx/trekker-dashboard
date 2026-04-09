import { useState } from 'react';

import { useAppData, useBulkArchiveCompleted } from '@/hooks/use-data';
import { useTaskDetailActions } from '@/hooks/use-task-detail-actions';
import { useTaskEvents } from '@/hooks/use-task-events';
import { useUIStore } from '@/stores';

export function useKanbanPageState() {
  const { tasks, epics, isLoading, error, refetch } = useAppData();
  const bulkArchive = useBulkArchiveCompleted();
  const detailActions = useTaskDetailActions(tasks, epics);
  const { openCreateModal } = useUIStore();
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  useTaskEvents(refetch);

  function openArchiveConfirm() {
    setShowArchiveConfirm(true);
  }

  function closeArchiveConfirm(nextOpen: boolean) {
    setShowArchiveConfirm(nextOpen);
  }

  function handleArchiveAllCompleted() {
    bulkArchive.mutate();
  }

  return {
    ...detailActions,
    bulkArchive,
    epics,
    error,
    handleArchiveAllCompleted,
    isLoading,
    openArchiveConfirm,
    openCreateModal,
    refetch,
    showArchiveConfirm,
    tasks,
    updateArchiveConfirm: closeArchiveConfirm,
  };
}
