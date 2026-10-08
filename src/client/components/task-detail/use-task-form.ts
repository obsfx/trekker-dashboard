'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import {
  deleteTaskRequest,
  getTaskFormValues,
  updateTaskRequest,
} from '@/components/task-detail/form-helpers';
import { useWorkItemEditor } from '@/hooks/use-work-item-editor';
import { type TaskFormData, taskFormSchema } from '@/lib/work-item-schema';
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

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    values: getTaskFormValues(task),
    resetOptions: {
      keepDirtyValues: false,
    },
  });

  return useWorkItemEditor({
    item: task,
    form,
    entityLabel: 'Task',
    open,
    isEditing,
    statusField: {
      read: () => form.getValues('status'),
      write: (value) => form.setValue('status', value),
    },
    priorityField: {
      read: () => form.getValues('priority'),
      write: (value) => form.setValue('priority', value),
    },
    toFormValues: getTaskFormValues,
    toUpdatePayload: (data) => ({
      title: data.title.trim(),
      description: data.description.trim() || null,
      status: data.status,
      priority: data.priority,
      tags: data.tags.trim() || null,
      epicId: data.epicId || null,
    }),
    update: updateTaskRequest,
    remove: deleteTaskRequest,
    onClose,
    onChanged: () => {
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}
