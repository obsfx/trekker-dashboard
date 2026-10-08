'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';

export function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}
