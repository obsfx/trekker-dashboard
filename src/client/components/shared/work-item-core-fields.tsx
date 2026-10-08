'use client';

import { PrioritySelect } from '@/components/shared/priority-select';
import { StatusSelect } from '@/components/shared/status-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { EpicFormData } from '@/lib/work-item-schema';

interface WorkItemCoreFieldSetter {
  (name: 'title' | 'description' | 'status', value: string): void;
  (name: 'priority', value: number): void;
}

interface WorkItemCoreFieldsProps {
  entityLabel: string;
  statuses: readonly string[];
  values: EpicFormData;
  titleError: string | undefined;
  setValue: WorkItemCoreFieldSetter;
}

export function WorkItemCoreFields({
  entityLabel,
  statuses,
  values,
  titleError,
  setValue,
}: WorkItemCoreFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={values.title}
          onChange={(e) => setValue('title', e.target.value)}
          placeholder={`${entityLabel} title`}
          className="text-lg font-semibold"
        />
        {titleError && <p className="text-xs text-destructive">{titleError}</p>}
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={values.description}
          onChange={(e) => setValue('description', e.target.value)}
          placeholder={`${entityLabel} description`}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <StatusSelect
            value={values.status}
            onChange={(v) => setValue('status', v)}
            statuses={statuses}
          />
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <PrioritySelect value={values.priority} onChange={(v) => setValue('priority', v)} />
        </div>
      </div>
    </>
  );
}
