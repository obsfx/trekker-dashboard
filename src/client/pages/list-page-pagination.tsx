'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ListFilters, ListResponse } from '@/hooks/use-list';
import { DEFAULT_LIST_PAGE_SIZE, LIST_PAGE_SIZE_OPTIONS } from '@/lib/constants';
import { PagePaginationFooter } from '@/pages/page-pagination-footer';

interface ListPagePaginationProps {
  filters: ListFilters;
  onSetFilters: (filters: ListFilters) => void;
  response: ListResponse | undefined;
  totalPages: number;
}

export function ListPagePagination({
  filters,
  onSetFilters,
  response,
  totalPages,
}: ListPagePaginationProps) {
  if (!response || response.total === 0) {
    return null;
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? DEFAULT_LIST_PAGE_SIZE;

  return (
    <PagePaginationFooter
      page={page}
      summary={
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, response.total)} of{' '}
            {response.total}
          </span>
          <Select
            value={String(limit)}
            onValueChange={(value) => onSetFilters({ ...filters, limit: Number(value), page: 1 })}
          >
            <SelectTrigger className="h-8 w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIST_PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>
      }
      totalPages={totalPages}
      onNext={() => onSetFilters({ ...filters, page: page + 1 })}
      onPrevious={() => onSetFilters({ ...filters, page: page - 1 })}
    />
  );
}
