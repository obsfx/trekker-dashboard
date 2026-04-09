'use client';

import { Check, ChevronsUpDown, X } from 'lucide-react';
import * as React from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SEARCHABLE_SELECT_FOCUS_DELAY_MS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SearchableSelectOption {
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
  placeholder = 'Select...',
  emptyText = 'No results found',
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
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
      setTimeout(() => inputRef.current?.focus(), SEARCHABLE_SELECT_FOCUS_DELAY_MS);
    }
  }, [open]);

  useOnClickOutside(containerRef as React.RefObject<HTMLElement>, () => {
    setOpen(false);
    setSearch('');
  });

  const handleSelect = (optionValue: string) => {
    if (optionValue === value) {
      onValueChange(null);
    } else {
      onValueChange(optionValue);
    }

    setOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(null);
    setSearch('');
  };

  let selectedLabel = placeholder;
  if (selectedOption) {
    selectedLabel = selectedOption.label;
  }

  let optionsContent = filteredOptions.map((option) => {
    const isSelected = value === option.value;
    let checkIconClassName = 'mr-2 h-4 w-4 opacity-0';
    if (isSelected) {
      checkIconClassName = 'mr-2 h-4 w-4 opacity-100';
    }

    return (
      <button
        key={option.value}
        type="button"
        className={cn(
          'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
          isSelected && 'bg-accent'
        )}
        onClick={() => handleSelect(option.value)}
      >
        <Check className={checkIconClassName} />
        <span className="truncate">{option.label}</span>
      </button>
    );
  });

  if (filteredOptions.length === 0) {
    optionsContent = [
      <div key="empty" className="py-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>,
    ];
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
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
        <span className="truncate">{selectedLabel}</span>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {value && <X className="h-4 w-4 opacity-50 hover:opacity-100" onClick={handleClear} />}
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
          <div className="max-h-[200px] overflow-y-auto p-1">{optionsContent}</div>
        </div>
      )}
    </div>
  );
}
