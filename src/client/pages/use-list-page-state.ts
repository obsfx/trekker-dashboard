import { useState } from 'react';

import { useAppData } from '@/hooks/use-data';
import { type ListEntityType, type ListFilters, type ListItem, useList } from '@/hooks/use-list';
import { useTaskDetailActions } from '@/hooks/use-task-detail-actions';
import { DEFAULT_LIST_PAGE_SIZE } from '@/lib/constants';

export function useListPageState() {
  const { epics, refetch, tasks } = useAppData();
  const detailActions = useTaskDetailActions(tasks, epics);
  const [filters, setFilters] = useState<ListFilters>({
    limit: DEFAULT_LIST_PAGE_SIZE,
    page: 1,
    sort: 'created:desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { data, error, isLoading } = useList(filters);

  function handleRowClick(item: ListItem) {
    if (item.type === 'epic') {
      detailActions.openEpicDetail(item.id);
      return;
    }

    detailActions.openTaskDetail(item.id);
  }

  function toggleTypeFilter(type: ListEntityType) {
    const currentTypes = filters.types ?? [];
    let nextTypes = [...currentTypes, type];
    if (currentTypes.includes(type)) {
      nextTypes = currentTypes.filter((currentType) => currentType !== type);
    }

    let normalizedTypes: ListEntityType[] | undefined = nextTypes;
    if (nextTypes.length === 0) {
      normalizedTypes = undefined;
    }

    setFilters({
      ...filters,
      types: normalizedTypes,
      page: 1,
    });
  }

  function clearFilters() {
    setFilters({
      limit: filters.limit,
      page: 1,
      sort: filters.sort,
    });
    setSearchQuery('');
  }

  let filteredItems: ListItem[] = [];
  if (data) {
    filteredItems = data.items.filter((item) => {
      if (!searchQuery) {
        return true;
      }

      const normalizedSearch = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.id.toLowerCase().includes(normalizedSearch)
      );
    });
  }
  const hasActiveFilters = Boolean(
    filters.types?.length || filters.statuses?.length || filters.priorities?.length
  );
  let totalPages = 0;
  if (data) {
    totalPages = Math.ceil(data.total / (filters.limit ?? DEFAULT_LIST_PAGE_SIZE));
  }

  return {
    ...detailActions,
    clearFilters,
    data,
    epics,
    error,
    filteredItems,
    filters,
    handleRowClick,
    hasActiveFilters,
    isLoading,
    refetch,
    searchQuery,
    setFilters,
    setSearchQuery,
    tasks,
    toggleTypeFilter,
    totalPages,
  };
}
