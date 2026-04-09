'use client';

import { useMemo } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import { buildParentTaskOptions } from '@/components/create-modal/create-form.utils';
import type { CreateFormValues } from '@/components/create-modal/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { Task } from '@/types';

interface SubtaskFieldsProps {
  form: UseFormReturn<CreateFormValues>;
  parentTasks: Task[];
}

export function SubtaskFields({ form, parentTasks }: SubtaskFieldsProps) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  const taskOptions = useMemo(() => buildParentTaskOptions(parentTasks), [parentTasks]);

  return (
    <>
      <div className="space-y-2">
        <Label>Tags (comma-separated)</Label>
        <Input {...register('tags')} placeholder="bug, frontend, urgent" />
      </div>

      <div className="space-y-2">
        <Label>
          Parent Task <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="parentTaskId"
          render={({ field }) => (
            <SearchableSelect
              options={taskOptions}
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? '')}
              placeholder="Select a task..."
              emptyText="No tasks found"
            />
          )}
        />
        {errors.parentTaskId?.message && (
          <p className="text-sm text-destructive">{errors.parentTaskId.message}</p>
        )}
      </div>
    </>
  );
}
