'use client';

import { useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

interface NativePopoverProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function NativePopover({ open, onClose, children, className = '' }: NativePopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref as React.RefObject<HTMLElement>, onClose);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={`absolute right-0 top-full mt-1 z-50 rounded-md border bg-popover p-3 shadow-md ${className}`}
    >
      {children}
    </div>
  );
}
