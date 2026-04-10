'use client';

import { EntityDetailModals } from '@/pages/entity-detail-modals';
import { ListPageFilters } from '@/pages/list-page-filters';
import { ListPagePagination } from '@/pages/list-page-pagination';
import { ListPageResults } from '@/pages/list-page-results';
import { useListPageState } from '@/pages/use-list-page-state';

export function ListPage() {
  const {
    clearFilters,
    closeEpicDetail,
    closeTaskDetail,
    data,
    epics,
    error,
    filteredItems,
    filters,
    handleEpicModalTaskClick,
    handleRowClick,
    handleTaskModalEpicClick,
    hasActiveFilters,
    isLoading,
    openTaskDetail,
    refetch,
    searchQuery,
    selectedEpic,
    selectedEpicTasks,
    selectedTask,
    setFilters,
    setSearchQuery,
    tasks,
    toggleTypeFilter,
    totalPages,
  } = useListPageState();

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
        <ListPageFilters
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          onSearchQueryChange={setSearchQuery}
          onSetFilters={setFilters}
          onToggleTypeFilter={toggleTypeFilter}
          searchQuery={searchQuery}
        />

        <ListPageResults
          error={error}
          isLoading={isLoading}
          items={filteredItems}
          onRowClick={handleRowClick}
          response={data}
        />

        <ListPagePagination
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
