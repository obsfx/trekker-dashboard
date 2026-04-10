'use client';

import { useMemo } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import { buildEpicOptions } from '@/components/create-modal/create-form.utils';
import type { CreateFormValues } from '@/components/create-modal/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { Epic } from '@/types';

interface TaskFieldsProps {
  form: UseFormReturn<CreateFormValues>;
  epics: Epic[];
}

export function TaskFields({ form, epics }: TaskFieldsProps) {
  const { control, register } = form;

  const epicOptions = useMemo(() => buildEpicOptions(epics), [epics]);

  return (
    <>
      <div className="space-y-2">
        <Label>Tags (comma-separated)</Label>
        <Input {...register('tags')} placeholder="bug, frontend, urgent" />
      </div>

      <div className="space-y-2">
        <Label>Epic</Label>
        <Controller
          control={control}
          name="epicId"
          render={({ field }) => (
            <SearchableSelect
              options={epicOptions}
              value={field.value}
              onValueChange={field.onChange}
              placeholder="No Epic"
              emptyText="No epics found"
            />
          )}
        />
      </div>
    </>
  );
}
