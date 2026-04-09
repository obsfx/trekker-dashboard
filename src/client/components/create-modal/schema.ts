import { z } from 'zod';

const baseFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  status: z.string(),
  priority: z.number().min(0).max(5),
});

export const createFormSchema = baseFormSchema.extend({
  tags: z.string(),
  epicId: z.string().nullable(),
  parentTaskId: z.string(),
});

export const subtaskFormSchema = createFormSchema.extend({
  parentTaskId: z.string().min(1, 'Parent task is required'),
});

export type CreateFormValues = z.infer<typeof createFormSchema>;
