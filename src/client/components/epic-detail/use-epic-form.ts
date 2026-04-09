'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  deleteEpicRequest,
  getEpicFormValues,
  updateEpicRequest,
} from '@/components/epic-detail/form-helpers';
import { type EpicFormData, epicFormSchema } from '@/components/epic-detail/schema';
import { getErrorMessage } from '@/lib/errors';
import type { Epic } from '@/types';

interface UseEpicFormOptions {
  epic: Epic | null;
  open: boolean;
  isEditing: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function useEpicForm({ epic, open, isEditing, onClose, onUpdate }: UseEpicFormOptions) {
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<EpicFormData>({
    resolver: zodResolver(epicFormSchema),
    values: getEpicFormValues(epic),
    resetOptions: {
      keepDirtyValues: false,
    },
  });

  const {
    reset,
    formState: { isSubmitting },
  } = form;

  // Reset deleting state when modal opens/closes
  useEffect(() => {
    setIsDeleting(false);
  }, [open, isEditing]);

  const handleSave = async (data: EpicFormData) => {
    if (!epic) return;

    try {
      await updateEpicRequest(epic.id, {
        title: data.title.trim(),
        description: data.description.trim() || null,
        status: data.status,
        priority: data.priority,
      });

      toast.success('Epic updated');
      onUpdate();
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update epic'));
      return false;
    }
  };

  const handleDelete = async () => {
    if (!epic) return;

    try {
      await deleteEpicRequest(epic.id);

      toast.success('Epic deleted');
      onClose();
      onUpdate();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete epic'));
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!epic) return;

    const previousStatus = form.getValues('status');
    form.setValue('status', newStatus);

    try {
      await updateEpicRequest(epic.id, { status: newStatus });

      onUpdate();
    } catch (error) {
      form.setValue('status', previousStatus);
      toast.error(getErrorMessage(error, 'Failed to update status'));
    }
  };

  const handlePriorityChange = async (newPriority: number) => {
    if (!epic) return;

    const previousPriority = form.getValues('priority');
    form.setValue('priority', newPriority);

    try {
      await updateEpicRequest(epic.id, { priority: newPriority });

      onUpdate();
    } catch (error) {
      form.setValue('priority', previousPriority);
      toast.error(getErrorMessage(error, 'Failed to update priority'));
    }
  };

  const handleCancel = () => {
    if (epic) {
      reset(getEpicFormValues(epic));
    }
    setIsDeleting(false);
  };

  return {
    form,
    isSubmitting,
    isDeleting,
    setIsDeleting,
    handleSave,
    handleDelete,
    handleCancel,
    handleStatusChange,
    handlePriorityChange,
  };
}
