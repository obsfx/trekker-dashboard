'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { NativePopover } from '@/components/ui/native-popover';
import { SORT_OPTIONS, type SortOption } from '@/lib/sort';

export type TypeFilter = 'all' | 'epic' | 'task';

export interface ColumnFilterState {
  sort: SortOption;
  type: TypeFilter;
}

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'epic', label: 'Epics only' },
  { value: 'task', label: 'Tasks only' },
];

export const DEFAULT_FILTER: ColumnFilterState = {
  sort: 'created:desc',
  type: 'all',
};

function isFilterActive(filter: ColumnFilterState): boolean {
  return filter.sort !== DEFAULT_FILTER.sort || filter.type !== DEFAULT_FILTER.type;
}

interface ColumnFilterProps {
  value: ColumnFilterState;
  onChange: (value: ColumnFilterState) => void;
}

const nativeSelectStyles =
  'h-8 w-full rounded-md border bg-transparent px-2 text-sm outline-none focus:ring-1 focus:ring-ring';

export function ColumnFilter({ value, onChange }: ColumnFilterProps) {
  const [open, setOpen] = useState(false);
  const active = isFilterActive(value);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => setOpen(!open)}
        title="Sort & filter"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {active && <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-blue-500" />}
      </Button>

      <NativePopover
        open={open}
        onClose={() => setOpen(false)}
        className="w-52 flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Sort by</label>
          <select
            value={value.sort}
            onChange={(e) => {
              const sort = e.target.value;
              if (SORT_OPTIONS.some((opt) => opt.value === sort)) {
                onChange({ ...value, sort: sort as SortOption });
              }
            }}
            className={nativeSelectStyles}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Show</label>
          <select
            value={value.type}
            onChange={(e) => {
              const type = e.target.value;
              if (TYPE_OPTIONS.some((opt) => opt.value === type)) {
                onChange({ ...value, type: type as TypeFilter });
              }
            }}
            className={nativeSelectStyles}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {active && (
          <button
            onClick={() => {
              onChange(DEFAULT_FILTER);
              setOpen(false);
            }}
            className="text-xs text-muted-foreground hover:text-foreground underline self-end"
          >
            Reset
          </button>
        )}
      </NativePopover>
    </div>
  );
}
