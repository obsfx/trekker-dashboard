'use client';

import type { UseFormReturn } from 'react-hook-form';

import type { BreadcrumbItem } from '@/components/breadcrumb';
import type { EpicFormData } from '@/components/epic-detail/schema';
import { EditModalShell, PrioritySelect, StatusSelect } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EPIC_STATUSES } from '@/lib/constants';

interface EpicEditProps {
  form: UseFormReturn<EpicFormData>;
  breadcrumbItems: BreadcrumbItem[];
  open: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onSubmit: (data: EpicFormData) => Promise<boolean | undefined>;
  onCancel: () => void;
  onDelete: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

export function EpicEdit({
  form,
  breadcrumbItems,
  open,
  isDeleting,
  onClose,
  onSubmit,
  onCancel,
  onDelete,
  onDeleteConfirm,
  onDeleteCancel,
}: EpicEditProps) {
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

  const handleFormSubmit = async (data: EpicFormData) => {
    const success = await onSubmit(data);
    if (success) {
      onCancel();
    }
  };

  return (
    <EditModalShell
      open={open}
      onClose={onClose}
      breadcrumbItems={breadcrumbItems}
      formId="epic-edit-form"
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      entityName="Epic"
      onCancel={onCancel}
      onDelete={onDelete}
      onDeleteConfirm={onDeleteConfirm}
      onDeleteCancel={onDeleteCancel}
    >
      <form id="epic-edit-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-4">
        {/* Title */}
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setValue('title', e.target.value)}
            placeholder="Epic title"
            className="text-lg font-semibold"
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setValue('description', e.target.value)}
            placeholder="Epic description"
            rows={4}
          />
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <StatusSelect
              value={status}
              onChange={(v) => setValue('status', v)}
              statuses={EPIC_STATUSES}
            />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <PrioritySelect value={priority} onChange={(v) => setValue('priority', v)} />
          </div>
        </div>
      </form>
    </EditModalShell>
  );
}
