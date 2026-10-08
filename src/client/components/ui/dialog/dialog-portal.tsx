'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';

export function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}
