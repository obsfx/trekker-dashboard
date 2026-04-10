'use client';

import { ChevronRight } from 'lucide-react';

import { DetailRow } from '@/components/task-detail/sidebar/detail-row';
import type { Epic } from '@/types';

interface EpicLinkRowProps {
  epic: Epic;
  onEpicClick?: (epic: Epic) => void;
}

export function EpicLinkRow({ epic, onEpicClick }: EpicLinkRowProps) {
  if (!onEpicClick) {
    return (
      <DetailRow label="Epic">
        <span className="text-sm text-purple-500">{epic.id}</span>
      </DetailRow>
    );
  }

  return (
    <DetailRow label="Epic">
      <button
        type="button"
        className="flex items-center gap-0.5 text-sm text-purple-500 hover:text-purple-600"
        onClick={() => onEpicClick(epic)}
      >
        {epic.id}
        <ChevronRight className="h-3 w-3" />
      </button>
    </DetailRow>
  );
}
