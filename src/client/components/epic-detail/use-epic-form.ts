'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  deleteEpicRequest,
  getEpicFormValues,
  updateEpicRequest,
} from '@/components/epic-detail/form-helpers';
import { useWorkItemEditor } from '@/hooks/use-work-item-editor';
import { type EpicFormData, epicFormSchema } from '@/lib/work-item-schema';
import type { Epic } from '@/types';

interface UseEpicFormOptions {
  epic: Epic | null;
  open: boolean;
  isEditing: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function useEpicForm({ epic, open, isEditing, onClose, onUpdate }: UseEpicFormOptions) {
  const form = useForm<EpicFormData>({
    resolver: zodResolver(epicFormSchema),
    values: getEpicFormValues(epic),
    resetOptions: {
      keepDirtyValues: false,
    },
  });

  return useWorkItemEditor({
    item: epic,
    form,
    entityLabel: 'Epic',
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
    toFormValues: getEpicFormValues,
    toUpdatePayload: (data) => ({
      title: data.title.trim(),
      description: data.description.trim() || null,
      status: data.status,
      priority: data.priority,
    }),
    update: updateEpicRequest,
    remove: deleteEpicRequest,
    onClose,
    onChanged: onUpdate,
  });
}
