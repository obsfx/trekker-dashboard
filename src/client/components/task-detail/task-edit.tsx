'use client';

import { EditModalShell, WorkItemCoreFields } from '@/components/shared';
import {
  closeAfterSuccessfulSubmit,
  type WorkItemEditProps,
} from '@/components/shared/work-item-edit-props';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TASK_STATUSES } from '@/lib/constants';
import type { TaskFormData } from '@/lib/work-item-schema';
import type { Epic } from '@/types';

interface TaskEditProps extends WorkItemEditProps<TaskFormData> {
  epics: Epic[];
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
  const values = watch();

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
      <form
        id="task-edit-form"
        onSubmit={handleSubmit(closeAfterSuccessfulSubmit(onSubmit, onCancel))}
        className="space-y-4 p-4"
      >
        <WorkItemCoreFields
          entityLabel="Task"
          statuses={TASK_STATUSES}
          values={values}
          titleError={errors.title?.message}
          setValue={setValue}
        />

        <div className="space-y-2">
          <Label>Tags (comma-separated)</Label>
          <Input
            value={values.tags}
            onChange={(e) => setValue('tags', e.target.value)}
            placeholder="bug, frontend, urgent"
          />
        </div>

        <div className="space-y-2">
          <Label>Epic</Label>
          <Select value={values.epicId || 'none'} onValueChange={handleEpicChange}>
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
