"use client";

import * as React from "react";
import { useOnClickOutside } from "usehooks-ts";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  emptyText = "No results found",
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    const searchLower = search.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchLower) ||
        option.value.toLowerCase().includes(searchLower)
    );
  }, [options, search]);

  const selectedOption = options.find((option) => option.value === value);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useOnClickOutside(containerRef as React.RefObject<HTMLElement>, () => {
    setOpen(false);
    setSearch("");
  });

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue === value ? null : optionValue);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(null);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between font-normal"
        onClick={() => {
          setOpen(!open);
        }}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {value && (
            <X
              className="h-4 w-4 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </div>
      </Button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="p-2">
            <Input
              ref={inputRef}
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value === option.value && "bg-accent"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
