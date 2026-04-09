'use client';

import { EntityDetailModals } from '@/pages/entity-detail-modals';
import { HistoryPageFilters } from '@/pages/history-page-filters';
import { HistoryPagePagination } from '@/pages/history-page-pagination';
import { HistoryPageResults } from '@/pages/history-page-results';
import { useHistoryPageState } from '@/pages/use-history-page-state';

export function HistoryPage() {
  const {
    closeEpicDetail,
    closeTaskDetail,
    data,
    epics,
    error,
    filters,
    handleEntityClick,
    handleEpicModalTaskClick,
    handleTaskModalEpicClick,
    isLoading,
    openTaskDetail,
    refetch,
    selectedEpic,
    selectedEpicTasks,
    selectedTask,
    setFilters,
    tasks,
    totalPages,
  } = useHistoryPageState();

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
        <HistoryPageFilters filters={filters} onSetFilters={setFilters} />

        <HistoryPageResults
          error={error}
          isLoading={isLoading}
          onEntityClick={handleEntityClick}
          response={data}
        />

        <HistoryPagePagination
          filters={filters}
          onSetFilters={setFilters}
          response={data}
          totalPages={totalPages}
        />
      </main>

      <EntityDetailModals
        allTasks={tasks}
        epics={epics}
        selectedEpic={selectedEpic}
        selectedEpicTasks={selectedEpicTasks}
        selectedTask={selectedTask}
        onCloseEpicDetail={closeEpicDetail}
        onCloseTaskDetail={closeTaskDetail}
        onEpicDetailTaskClick={handleEpicModalTaskClick}
        onTaskDetailEpicClick={handleTaskModalEpicClick}
        onTaskDetailTaskClick={(task) => openTaskDetail(task.id)}
        onUpdate={refetch}
      />
    </>
  );
}
