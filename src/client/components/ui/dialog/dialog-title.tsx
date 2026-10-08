'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';

import { cn } from '@/lib/utils';

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
}
