'use client';

import { useEffect, useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { getErrorMessage } from '@/lib/errors';

interface WorkItemFieldUpdate {
  status?: string;
  priority?: number;
}

interface IdentifiedItem {
  id: string;
}

interface WorkItemFieldAccess<TValue> {
  read: () => TValue;
  write: (value: TValue) => void;
}

interface UseWorkItemEditorOptions<
  TItem extends IdentifiedItem,
  TData extends FieldValues,
  TPayload extends WorkItemFieldUpdate,
> {
  item: TItem | null;
  form: UseFormReturn<TData>;
  entityLabel: string;
  open: boolean;
  isEditing: boolean;
  statusField: WorkItemFieldAccess<string>;
  priorityField: WorkItemFieldAccess<number>;
  toFormValues: (item: TItem) => TData;
  toUpdatePayload: (data: TData) => TPayload;
  update: (id: string, payload: TPayload | WorkItemFieldUpdate) => Promise<void>;
  remove: (id: string) => Promise<void>;
  onClose: () => void;
  onChanged: () => void;
}

export function useWorkItemEditor<
  TItem extends IdentifiedItem,
  TData extends FieldValues,
  TPayload extends WorkItemFieldUpdate,
>({
  item,
  form,
  entityLabel,
  open,
  isEditing,
  statusField,
  priorityField,
  toFormValues,
  toUpdatePayload,
  update,
  remove,
  onClose,
  onChanged,
}: UseWorkItemEditorOptions<TItem, TData, TPayload>) {
  const [isDeleting, setIsDeleting] = useState(false);
  const entityName = entityLabel.toLowerCase();

  useEffect(() => {
    setIsDeleting(false);
  }, [open, isEditing]);

  const handleSave = async (data: TData) => {
    if (!item) {
      return;
    }

    try {
      await update(item.id, toUpdatePayload(data));

      toast.success(`${entityLabel} updated`);
      onChanged();
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to update ${entityName}`));
      return false;
    }
  };

  const handleDelete = async () => {
    if (!item) {
      return;
    }

    try {
      await remove(item.id);

      toast.success(`${entityLabel} deleted`);
      onClose();
      onChanged();
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to delete ${entityName}`));
    }
  };

  async function updateFieldOptimistically<TValue>(
    field: WorkItemFieldAccess<TValue>,
    nextValue: TValue,
    payload: WorkItemFieldUpdate,
    failureMessage: string
  ) {
    if (!item) {
      return;
    }

    const previousValue = field.read();
    field.write(nextValue);

    try {
      await update(item.id, payload);

      onChanged();
    } catch (error) {
      field.write(previousValue);
      toast.error(getErrorMessage(error, failureMessage));
    }
  }

  const handleStatusChange = (newStatus: string) =>
    updateFieldOptimistically(
      statusField,
      newStatus,
      { status: newStatus },
      'Failed to update status'
    );

  const handlePriorityChange = (newPriority: number) =>
    updateFieldOptimistically(
      priorityField,
      newPriority,
      { priority: newPriority },
      'Failed to update priority'
    );

  const handleCancel = () => {
    if (item) {
      form.reset(toFormValues(item));
    }
    setIsDeleting(false);
  };

  return {
    form,
    isSubmitting: form.formState.isSubmitting,
    isDeleting,
    setIsDeleting,
    handleSave,
    handleDelete,
    handleCancel,
    handleStatusChange,
    handlePriorityChange,
  };
}
