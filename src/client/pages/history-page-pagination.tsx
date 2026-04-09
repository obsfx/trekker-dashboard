'use client';

import type { HistoryFilters, HistoryResponse } from '@/hooks/use-history';
import { DEFAULT_HISTORY_PAGE_SIZE } from '@/lib/constants';
import { PagePaginationFooter } from '@/pages/page-pagination-footer';

interface HistoryPagePaginationProps {
  filters: HistoryFilters;
  onSetFilters: (filters: HistoryFilters) => void;
  response: HistoryResponse | undefined;
  totalPages: number;
}

export function HistoryPagePagination({
  filters,
  onSetFilters,
  response,
  totalPages,
}: HistoryPagePaginationProps) {
  if (!response || response.total === 0) {
    return null;
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? DEFAULT_HISTORY_PAGE_SIZE;

  return (
    <PagePaginationFooter
      page={page}
      summary={
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * limit + 1}-{Math.min(page * limit, response.total)} of{' '}
          {response.total} events
        </div>
      }
      totalPages={totalPages}
      onNext={() => onSetFilters({ ...filters, page: page + 1 })}
      onPrevious={() => onSetFilters({ ...filters, page: page - 1 })}
    />
  );
}
