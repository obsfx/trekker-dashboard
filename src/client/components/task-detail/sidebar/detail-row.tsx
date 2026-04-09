'use client';

import type { ReactNode } from 'react';

interface DetailRowProps {
  label: string;
  children: ReactNode;
  stacked?: boolean;
}

export function DetailRow({ label, children, stacked = false }: DetailRowProps) {
  if (stacked) {
    return (
      <div>
        <span className="mb-1 block text-sm text-muted-foreground">{label}</span>
        {children}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
