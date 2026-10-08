'use client';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';

export function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}
