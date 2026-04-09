'use client';

import { Archive, Square, SquareCheck as CheckSquare, SquareX } from 'lucide-react';

import { cn } from '@/lib/utils';

interface StatusIconProps {
  status: string;
  className?: string;
}

export function StatusIcon({ status, className }: StatusIconProps) {
  const baseClass = cn('h-4 w-4 shrink-0', className);

  switch (status) {
    case 'completed':
      return <CheckSquare className={cn(baseClass, 'text-green-500')} />;
    case 'archived':
      return <Archive className={cn(baseClass, 'text-gray-400')} />;
    case 'wont_fix':
      return <SquareX className={cn(baseClass, 'text-amber-500')} />;
    default:
      return <Square className={cn(baseClass, 'opacity-50')} />;
  }
}
