import { z } from 'zod';

import { MAX_PRIORITY } from '@/lib/constants';

export const epicFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  status: z.string(),
  priority: z.number().min(0).max(MAX_PRIORITY),
});

export const taskFormSchema = epicFormSchema.extend({
  tags: z.string(),
  epicId: z.string().nullable(),
});

export type EpicFormData = z.infer<typeof epicFormSchema>;
export type TaskFormData = z.infer<typeof taskFormSchema>;
