'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchQuery } from '@/hooks/api-query';

export type ListEntityType = 'epic' | 'task' | 'subtask';

export interface ListItem {
  type: ListEntityType;
  id: string;
  title: string;
  status: string;
  priority: number;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListResponse {
  total: number;
  page: number;
  limit: number;
  items: ListItem[];
}

export interface ListFilters {
  types?: ListEntityType[];
  statuses?: string[];
  priorities?: number[];
  sort?: string;
  limit?: number;
  page?: number;
  since?: string;
  until?: string;
}

async function fetchList(filters: ListFilters): Promise<ListResponse> {
  return fetchQuery(
    '/api/list',
    {
      type: filters.types,
      status: filters.statuses,
      priority: filters.priorities,
      sort: filters.sort,
      limit: filters.limit,
      page: filters.page,
      since: filters.since,
      until: filters.until,
    },
    'Failed to fetch list'
  );
}

export function useList(filters: ListFilters) {
  return useQuery({
    queryKey: ['list', filters],
    queryFn: () => fetchList(filters),
  });
}
