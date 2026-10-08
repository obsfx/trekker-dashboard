import { z } from 'zod';

import { taskFormSchema } from '@/lib/work-item-schema';

export const createFormSchema = taskFormSchema.extend({
  parentTaskId: z.string(),
});

export const subtaskFormSchema = createFormSchema.extend({
  parentTaskId: z.string().min(1, 'Parent task is required'),
});

export type CreateFormValues = z.infer<typeof createFormSchema>;
