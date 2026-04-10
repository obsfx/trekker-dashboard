'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STATUS_LABELS } from '@/lib/constants';

interface StatusSelectProps {
  value: string;
  onChange: (value: string) => void;
  statuses: readonly string[];
  triggerClassName?: string;
}

export function StatusSelect({ value, onChange, statuses, triggerClassName }: StatusSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
