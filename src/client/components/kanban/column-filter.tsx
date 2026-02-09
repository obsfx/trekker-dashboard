"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

export type SortOption =
  | "created:desc"
  | "created:asc"
  | "updated:desc"
  | "priority:asc"
  | "priority:desc"
  | "title:asc"
  | "title:desc";

export type TypeFilter = "all" | "epic" | "task";

export interface ColumnFilterState {
  sort: SortOption;
  type: TypeFilter;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "created:desc", label: "Newest first" },
  { value: "created:asc", label: "Oldest first" },
  { value: "updated:desc", label: "Recently updated" },
  { value: "priority:asc", label: "Priority (high → low)" },
  { value: "priority:desc", label: "Priority (low → high)" },
  { value: "title:asc", label: "Title (A → Z)" },
  { value: "title:desc", label: "Title (Z → A)" },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "epic", label: "Epics only" },
  { value: "task", label: "Tasks only" },
];

export const DEFAULT_FILTER: ColumnFilterState = {
  sort: "created:desc",
  type: "all",
};

export function isFilterActive(filter: ColumnFilterState): boolean {
  return filter.sort !== DEFAULT_FILTER.sort || filter.type !== DEFAULT_FILTER.type;
}

interface ColumnFilterProps {
  value: ColumnFilterState;
  onChange: (value: ColumnFilterState) => void;
}

export function ColumnFilter({ value, onChange }: ColumnFilterProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const active = isFilterActive(value);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => setOpen(!open)}
        title="Sort & filter"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {active && (
          <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-blue-500" />
        )}
      </Button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-1 z-50 w-52 rounded-md border bg-popover p-3 shadow-md flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Sort by
            </label>
            <select
              value={value.sort}
              onChange={(e) =>
                onChange({ ...value, sort: e.target.value as SortOption })
              }
              className="h-8 w-full rounded-md border bg-transparent px-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Show
            </label>
            <select
              value={value.type}
              onChange={(e) =>
                onChange({ ...value, type: e.target.value as TypeFilter })
              }
              className="h-8 w-full rounded-md border bg-transparent px-2 text-sm outline-none focus:ring-1 focus:ring-ring"
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
        </div>
      )}
    </div>
  );
}
