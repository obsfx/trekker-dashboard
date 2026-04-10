'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRIORITY_LABELS } from '@/lib/constants';

interface PrioritySelectProps {
  value: number;
  onChange: (value: number) => void;
  triggerClassName?: string;
}

export function PrioritySelect({ value, onChange, triggerClassName }: PrioritySelectProps) {
  return (
    <Select value={value.toString()} onValueChange={(v) => onChange(parseInt(v, 10))}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
          <SelectItem key={val} value={val}>
            P{val} - {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
