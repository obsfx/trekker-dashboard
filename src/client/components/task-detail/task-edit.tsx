'use client';

import type { UseFormReturn } from 'react-hook-form';

import type { BreadcrumbItem } from '@/components/breadcrumb';
import { EditModalShell, PrioritySelect, StatusSelect } from '@/components/shared';
import type { TaskFormData } from '@/components/task-detail/schema';
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
import { TASK_STATUSES } from '@/lib/constants';
import type { Epic } from '@/types';

interface TaskEditProps {
  form: UseFormReturn<TaskFormData>;
  epics: Epic[];
  breadcrumbItems: BreadcrumbItem[];
  open: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<boolean | undefined>;
  onCancel: () => void;
  onDelete: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

export function TaskEdit({
  form,
  epics,
  breadcrumbItems,
  open,
  isDeleting,
  onClose,
  onSubmit,
  onCancel,
  onDelete,
  onDeleteConfirm,
  onDeleteCancel,
}: TaskEditProps) {
  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = form;
  const title = watch('title');
  const description = watch('description');
  const status = watch('status');
  const priority = watch('priority');
  const tags = watch('tags');
  const epicId = watch('epicId');

  const handleFormSubmit = async (data: TaskFormData) => {
    const success = await onSubmit(data);
    if (success) {
      onCancel();
    }
  };

  const handleEpicChange = (value: string) => {
    if (value === 'none') {
      setValue('epicId', null);
      return;
    }

    setValue('epicId', value);
  };

  return (
    <EditModalShell
      open={open}
      onClose={onClose}
      breadcrumbItems={breadcrumbItems}
      formId="task-edit-form"
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      entityName="Task"
      onCancel={onCancel}
      onDelete={onDelete}
      onDeleteConfirm={onDeleteConfirm}
      onDeleteCancel={onDeleteCancel}
    >
      <form id="task-edit-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setValue('title', e.target.value)}
            placeholder="Task title"
            className="text-lg font-semibold"
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setValue('description', e.target.value)}
            placeholder="Task description"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <StatusSelect
              value={status}
              onChange={(v) => setValue('status', v)}
              statuses={TASK_STATUSES}
            />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <PrioritySelect value={priority} onChange={(v) => setValue('priority', v)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tags (comma-separated)</Label>
          <Input
            value={tags}
            onChange={(e) => setValue('tags', e.target.value)}
            placeholder="bug, frontend, urgent"
          />
        </div>

        <div className="space-y-2">
          <Label>Epic</Label>
          <Select value={epicId || 'none'} onValueChange={handleEpicChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Epic</SelectItem>
              {epics.map((epic) => (
                <SelectItem key={epic.id} value={epic.id}>
                  {epic.id}: {epic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </form>
    </EditModalShell>
  );
}
