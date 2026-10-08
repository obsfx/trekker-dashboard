'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { getDefaultCreateFormValues } from '@/components/create-modal/create-form.utils';
import {
  createFormSchema,
  type CreateFormValues,
  subtaskFormSchema,
} from '@/components/create-modal/schema';
import { getErrorMessage, readApiErrorMessage } from '@/lib/errors';
import type { CreateType } from '@/types';

interface UseCreateFormOptions {
  type: CreateType;
  defaultStatus?: string;
  onClose: () => void;
  onCreated: () => void;
}

const SCHEMA_BY_TYPE = {
  epic: createFormSchema,
  task: createFormSchema,
  subtask: subtaskFormSchema,
} as const;

function toCreateEpicPayload(data: CreateFormValues) {
  return {
    title: data.title.trim(),
    description: data.description.trim() || null,
    status: data.status,
    priority: data.priority,
  };
}

function toCreateTaskPayload(data: CreateFormValues) {
  return {
    title: data.title.trim(),
    description: data.description.trim() || null,
    status: data.status,
    priority: data.priority,
    tags: data.tags.trim() || null,
    epicId: data.epicId || null,
    parentTaskId: null,
  };
}

function toCreateSubtaskPayload(data: CreateFormValues) {
  return {
    title: data.title.trim(),
    description: data.description.trim() || null,
    status: data.status,
    priority: data.priority,
    tags: data.tags.trim() || null,
    epicId: null,
    parentTaskId: data.parentTaskId,
  };
}

export function useCreateForm({ type, defaultStatus, onClose, onCreated }: UseCreateFormOptions) {
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(SCHEMA_BY_TYPE[type]),
    defaultValues: getDefaultCreateFormValues(defaultStatus),
  });

  // Reset form when type changes
  useEffect(() => {
    form.reset(getDefaultCreateFormValues(defaultStatus));
  }, [type, defaultStatus, form]);

  const {
    formState: { isSubmitting },
  } = form;

  const createEpic = async (data: CreateFormValues) => {
    const response = await fetch('/api/epics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toCreateEpicPayload(data)),
    });

    if (!response.ok) {
      const message = await readApiErrorMessage(response, 'Failed to create epic');
      throw new Error(message);
    }

    return response.json();
  };

  const createTask = async (data: CreateFormValues) => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toCreateTaskPayload(data)),
    });

    if (!response.ok) {
      const message = await readApiErrorMessage(response, 'Failed to create task');
      throw new Error(message);
    }

    return response.json();
  };

  const createSubtask = async (data: CreateFormValues) => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toCreateSubtaskPayload(data)),
    });

    if (!response.ok) {
      const message = await readApiErrorMessage(response, 'Failed to create subtask');
      throw new Error(message);
    }

    return response.json();
  };

  const handleSubmit = form.handleSubmit(
    async (data) => {
      try {
        let created;

        if (type === 'epic') {
          created = await createEpic(data);
          toast.success(`Epic ${created.id} created`);
        } else if (type === 'subtask') {
          created = await createSubtask(data);
          toast.success(`Subtask ${created.id} created`);
        } else {
          created = await createTask(data);
          toast.success(`Task ${created.id} created`);
        }

        onClose();
        onCreated();
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to create'));
      }
    },
    (errors) => {
      const firstError = Object.values(errors)[0];
      if (firstError?.message) {
        toast.error(firstError.message);
      }
    }
  );

  return {
    form,
    isSubmitting,
    handleSubmit,
  };
}
