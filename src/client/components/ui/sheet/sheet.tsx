'use client';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';

export function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}
