import { useState } from 'react';

import { type HistoryEntityType, type HistoryFilters, useHistory } from '@/hooks/use-history';
import { DEFAULT_HISTORY_PAGE_SIZE } from '@/lib/constants';
import { useUIStore } from '@/stores';

export function useHistoryPageState() {
  const { openEpicDetail, openTaskDetail } = useUIStore();
  const [filters, setFilters] = useState<HistoryFilters>({
    limit: DEFAULT_HISTORY_PAGE_SIZE,
    page: 1,
  });
  const { data, error, isLoading } = useHistory(filters);

  function handleEntityClick(type: HistoryEntityType, id: string) {
    if (type === 'epic') {
      openEpicDetail(id);
      return;
    }

    if (type === 'task' || type === 'subtask') {
      openTaskDetail(id);
    }
  }

  let totalPages = 0;
  if (data) {
    totalPages = Math.ceil(data.total / (filters.limit ?? DEFAULT_HISTORY_PAGE_SIZE));
  }

  return {
    data,
    error,
    filters,
    handleEntityClick,
    isLoading,
    setFilters,
    totalPages,
  };
}
