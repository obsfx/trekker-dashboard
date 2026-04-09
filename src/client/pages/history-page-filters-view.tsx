'use client';

import type { FilterOption } from '@/pages/filter-helpers';
import { PageFilterSelect } from '@/pages/page-filter-select';

interface HistoryPageFiltersViewProps {
  actionOptions: readonly FilterOption[];
  actionValue: string;
  sinceValue: string;
  typeOptions: readonly FilterOption[];
  typeValue: string;
  untilValue: string;
  onActionChange: (value: string) => void;
  onSinceChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onUntilChange: (value: string) => void;
}

export function HistoryPageFiltersView({
  actionOptions,
  actionValue,
  sinceValue,
  typeOptions,
  typeValue,
  untilValue,
  onActionChange,
  onSinceChange,
  onTypeChange,
  onUntilChange,
}: HistoryPageFiltersViewProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <PageFilterSelect
        allLabel="All Types"
        options={typeOptions}
        placeholder="Type"
        value={typeValue}
        onValueChange={onTypeChange}
      />

      <PageFilterSelect
        allLabel="All Actions"
        options={actionOptions}
        placeholder="Action"
        value={actionValue}
        onValueChange={onActionChange}
      />

      <input
        type="date"
        className="h-9 rounded-md border bg-background px-3 text-sm"
        value={sinceValue}
        onChange={(event) => onSinceChange(event.target.value)}
        placeholder="Since"
      />

      <input
        type="date"
        className="h-9 rounded-md border bg-background px-3 text-sm"
        value={untilValue}
        onChange={(event) => onUntilChange(event.target.value)}
        placeholder="Until"
      />
    </div>
  );
}
