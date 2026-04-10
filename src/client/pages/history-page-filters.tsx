'use client';

import type { HistoryAction, HistoryEntityType, HistoryFilters } from '@/hooks/use-history';
import {
  buildUtcDateFilter,
  type FilterOption,
  parseFilterValues,
  serializeFilterValues,
  withResetPage,
} from '@/pages/filter-helpers';
import { HistoryPageFiltersView } from '@/pages/history-page-filters-view';

const HISTORY_TYPE_OPTIONS: FilterOption<HistoryEntityType>[] = [
  { value: 'epic', label: 'Epic' },
  { value: 'task', label: 'Task' },
  { value: 'subtask', label: 'Subtask' },
  { value: 'comment', label: 'Comment' },
  { value: 'dependency', label: 'Dependency' },
];

const HISTORY_ACTION_OPTIONS: FilterOption<HistoryAction>[] = [
  { value: 'create', label: 'Created' },
  { value: 'update', label: 'Updated' },
  { value: 'delete', label: 'Deleted' },
];

interface HistoryPageFiltersProps {
  filters: HistoryFilters;
  onSetFilters: (filters: HistoryFilters) => void;
}

export function HistoryPageFilters({ filters, onSetFilters }: HistoryPageFiltersProps) {
  function updateFilters(updates: Partial<HistoryFilters>) {
    onSetFilters(withResetPage(filters, updates));
  }

  return (
    <HistoryPageFiltersView
      actionOptions={HISTORY_ACTION_OPTIONS}
      actionValue={serializeFilterValues(filters.actions)}
      sinceValue={filters.since?.split('T')[0] ?? ''}
      typeOptions={HISTORY_TYPE_OPTIONS}
      typeValue={serializeFilterValues(filters.types)}
      untilValue={filters.until?.split('T')[0] ?? ''}
      onActionChange={(value) =>
        updateFilters({ actions: parseFilterValues(value, HISTORY_ACTION_OPTIONS) })
      }
      onSinceChange={(value) => updateFilters({ since: buildUtcDateFilter(value, 'T00:00:00Z') })}
      onTypeChange={(value) =>
        updateFilters({ types: parseFilterValues(value, HISTORY_TYPE_OPTIONS) })
      }
      onUntilChange={(value) => updateFilters({ until: buildUtcDateFilter(value, 'T23:59:59Z') })}
    />
  );
}
