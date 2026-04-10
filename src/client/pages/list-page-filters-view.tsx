'use client';

import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ListEntityType } from '@/hooks/use-list';
import type { FilterOption } from '@/pages/filter-helpers';
import { PageFilterSelect } from '@/pages/page-filter-select';

function getTypeButtonVariant(
  selectedTypes: readonly ListEntityType[],
  value: ListEntityType
): 'default' | 'outline' {
  if (selectedTypes.includes(value)) {
    return 'default';
  }

  return 'outline';
}

interface ListPageFiltersViewProps {
  hasActiveFilters: boolean;
  priorityOptions: readonly FilterOption[];
  priorityValue: string;
  searchQuery: string;
  selectedTypes: readonly ListEntityType[];
  sortOptions: readonly FilterOption[];
  sortValue: string;
  statusOptions: readonly FilterOption[];
  statusValue: string;
  typeOptions: readonly FilterOption<ListEntityType>[];
  onClearFilters: () => void;
  onPriorityChange: (value: string) => void;
  onSearchQueryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onToggleTypeFilter: (type: ListEntityType) => void;
}

export function ListPageFiltersView({
  hasActiveFilters,
  priorityOptions,
  priorityValue,
  searchQuery,
  selectedTypes,
  sortOptions,
  sortValue,
  statusOptions,
  statusValue,
  typeOptions,
  onClearFilters,
  onPriorityChange,
  onSearchQueryChange,
  onSortChange,
  onStatusChange,
  onToggleTypeFilter,
}: ListPageFiltersViewProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-64">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-1">
        {typeOptions.map(({ label, value }) => (
          <Button
            key={value}
            variant={getTypeButtonVariant(selectedTypes, value)}
            size="sm"
            onClick={() => onToggleTypeFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      <PageFilterSelect
        allLabel="All Statuses"
        options={statusOptions}
        placeholder="Status"
        value={statusValue}
        onValueChange={onStatusChange}
      />

      <PageFilterSelect
        allLabel="All Priorities"
        options={priorityOptions}
        placeholder="Priority"
        value={priorityValue}
        onValueChange={onPriorityChange}
      />

      <PageFilterSelect
        options={sortOptions}
        placeholder="Sort"
        value={sortValue}
        widthClassName="w-[180px]"
        onValueChange={onSortChange}
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
