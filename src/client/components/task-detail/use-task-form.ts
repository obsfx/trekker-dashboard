'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  deleteTaskRequest,
  getTaskFormValues,
  updateTaskRequest,
} from '@/components/task-detail/form-helpers';
import { type TaskFormData, taskFormSchema } from '@/components/task-detail/schema';
import { getErrorMessage } from '@/lib/errors';
import type { Task } from '@/types';

interface UseTaskFormOptions {
  task: Task | null;
  open: boolean;
  isEditing: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function useTaskForm({ task, open, isEditing, onClose, onUpdate }: UseTaskFormOptions) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    values: getTaskFormValues(task),
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

  const handleSave = async (data: TaskFormData) => {
    if (!task) return;

    try {
      await updateTaskRequest(task.id, {
        title: data.title.trim(),
        description: data.description.trim() || null,
        status: data.status,
        priority: data.priority,
        tags: data.tags.trim() || null,
        epicId: data.epicId || null,
      });

      toast.success('Task updated');
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ['history'] });
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update task'));
      return false;
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    try {
      await deleteTaskRequest(task.id);

      toast.success('Task deleted');
      onClose();
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ['history'] });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete task'));
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;

    const previousStatus = form.getValues('status');
    form.setValue('status', newStatus);

    try {
      await updateTaskRequest(task.id, { status: newStatus });

      onUpdate();
      queryClient.invalidateQueries({ queryKey: ['history'] });
    } catch (error) {
      form.setValue('status', previousStatus);
      toast.error(getErrorMessage(error, 'Failed to update status'));
    }
  };

  const handlePriorityChange = async (newPriority: number) => {
    if (!task) return;

    const previousPriority = form.getValues('priority');
    form.setValue('priority', newPriority);

    try {
      await updateTaskRequest(task.id, { priority: newPriority });

      onUpdate();
      queryClient.invalidateQueries({ queryKey: ['history'] });
    } catch (error) {
      form.setValue('priority', previousPriority);
      toast.error(getErrorMessage(error, 'Failed to update priority'));
    }
  };

  const handleCancel = () => {
    if (task) {
      reset(getTaskFormValues(task));
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
