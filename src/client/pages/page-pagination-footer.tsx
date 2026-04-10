'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

interface PagePaginationFooterProps {
  page: number;
  summary: ReactNode;
  totalPages: number;
  onNext: () => void;
  onPrevious: () => void;
}

export function PagePaginationFooter({
  page,
  summary,
  totalPages,
  onNext,
  onPrevious,
}: PagePaginationFooterProps) {
  return (
    <div className="flex items-center justify-between">
      <div>{summary}</div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrevious} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={onNext} disabled={page >= totalPages}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
