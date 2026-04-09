'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';

import type { CreateFormValues } from '@/components/create-modal/schema';
import { SubtaskFields } from '@/components/create-modal/subtask-fields';
import { TaskFields } from '@/components/create-modal/task-fields';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EPIC_STATUSES, PRIORITY_LABELS, STATUS_LABELS, TASK_STATUSES } from '@/lib/constants';
import type { CreateType, Epic, Task } from '@/types';

interface CreateFormProps {
  form: UseFormReturn<CreateFormValues>;
  type: CreateType;
  epics: Epic[];
  parentTasks: Task[];
}

export function CreateForm({ form, type, epics, parentTasks }: CreateFormProps) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  let statusOptions: readonly string[] = TASK_STATUSES;
  if (type === 'epic') {
    statusOptions = EPIC_STATUSES;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label>
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register('title')}
          placeholder={`${type.charAt(0).toUpperCase() + type.slice(1)} title`}
        />
        {errors.title && <p className="text-sm text-destructive">{String(errors.title.message)}</p>}
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea {...register('description')} placeholder="Optional description" rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(v) => field.onChange(parseInt(v, 10))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      P{value} - {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {type === 'task' && <TaskFields form={form} epics={epics} />}

      {type === 'subtask' && <SubtaskFields form={form} parentTasks={parentTasks} />}
    </div>
  );
}
