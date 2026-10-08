import { z } from 'zod';

const apiErrorBodySchema = z.object({ error: z.string().min(1) });

export function getErrorMessage(cause: unknown, fallback: string): string {
  if (cause instanceof Error) {
    return cause.message;
  }

  return fallback;
}

export async function readApiErrorMessage(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null);
  const parsed = apiErrorBodySchema.safeParse(body);
  if (parsed.success) {
    return parsed.data.error;
  }

  return fallback;
}
