'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';

import type { HistoryAction } from '@/hooks/use-history';
import { cn } from '@/lib/utils';

const ACTION_CONFIG = {
  create: { icon: Plus, color: 'text-green-500' },
  update: { icon: Pencil, color: 'text-blue-500' },
  delete: { icon: Trash2, color: 'text-red-500' },
} as const;

interface ActionIconProps {
  action: HistoryAction;
  className?: string;
}

export function ActionIcon({ action, className }: ActionIconProps) {
  const config = ACTION_CONFIG[action];
  const Icon = config.icon;
  return <Icon className={cn('h-4 w-4', config.color, className)} />;
}

export function getActionColor(action: HistoryAction): string {
  return ACTION_CONFIG[action].color;
}
