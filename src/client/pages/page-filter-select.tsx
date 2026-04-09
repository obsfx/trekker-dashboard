'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FilterOption } from '@/pages/filter-helpers';

interface PageFilterSelectProps {
  allLabel?: string;
  options: readonly FilterOption[];
  placeholder: string;
  value: string;
  widthClassName?: string;
  onValueChange: (value: string) => void;
}

export function PageFilterSelect({
  allLabel,
  options,
  placeholder,
  value,
  widthClassName = 'w-[140px]',
  onValueChange,
}: PageFilterSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={widthClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allLabel && <SelectItem value="all">{allLabel}</SelectItem>}
        {options.map(({ label, value: optionValue }) => (
          <SelectItem key={optionValue} value={optionValue}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
