import { useState } from 'react';

import { useAppData, useBulkArchiveCompleted } from '@/hooks/use-data';
import { useTaskEvents } from '@/hooks/use-task-events';
import { useUIStore } from '@/stores';

export function useKanbanPageState() {
  const { tasks, epics, isLoading, error, refetch } = useAppData();
  const bulkArchive = useBulkArchiveCompleted();
  const { openCreateModal, openEpicDetail, openTaskDetail } = useUIStore();
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
    bulkArchive,
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
    updateArchiveConfirm: closeArchiveConfirm,
  };
}
