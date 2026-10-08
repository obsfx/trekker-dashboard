'use client';

import { EditModalShell, WorkItemCoreFields } from '@/components/shared';
import {
  closeAfterSuccessfulSubmit,
  type WorkItemEditProps,
} from '@/components/shared/work-item-edit-props';
import { EPIC_STATUSES } from '@/lib/constants';
import type { EpicFormData } from '@/lib/work-item-schema';

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
}: WorkItemEditProps<EpicFormData>) {
  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = form;

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
      <form
        id="epic-edit-form"
        onSubmit={handleSubmit(closeAfterSuccessfulSubmit(onSubmit, onCancel))}
        className="space-y-4 p-4"
      >
        <WorkItemCoreFields
          entityLabel="Epic"
          statuses={EPIC_STATUSES}
          values={watch()}
          titleError={errors.title?.message}
          setValue={setValue}
        />
      </form>
    </EditModalShell>
  );
}
