'use client';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as React from 'react';

import { ScrollBar } from '@/components/ui/scroll-area/scroll-bar';
import { cn } from '@/lib/utils';

export function ScrollArea({
  className,
  children,
  showScrollbar = false,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  showScrollbar?: boolean;
}) {
  const forceMount = showScrollbar || undefined;
  let scrollbarClassName: string | undefined;
  if (showScrollbar) {
    scrollbarClassName = 'opacity-100';
  }

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar forceMount={forceMount} className={scrollbarClassName} />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}
