'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchQuery } from '@/hooks/api-query';

export type HistoryEntityType = 'epic' | 'task' | 'subtask' | 'comment' | 'dependency';
export type HistoryAction = 'create' | 'update' | 'delete';

export interface HistoryEvent {
  id: number;
  action: HistoryAction;
  entityType: HistoryEntityType;
  entityId: string;
  snapshot: Record<string, unknown> | null;
  changes: Record<string, { from: unknown; to: unknown }> | null;
  timestamp: string;
}

export interface HistoryResponse {
  total: number;
  page: number;
  limit: number;
  events: HistoryEvent[];
}

export interface HistoryFilters {
  entityId?: string;
  types?: HistoryEntityType[];
  actions?: HistoryAction[];
  since?: string;
  until?: string;
  limit?: number;
  page?: number;
}

async function fetchHistory(filters: HistoryFilters): Promise<HistoryResponse> {
  return fetchQuery(
    '/api/history',
    {
      entityId: filters.entityId,
      type: filters.types,
      action: filters.actions,
      since: filters.since,
      until: filters.until,
      limit: filters.limit,
      page: filters.page,
    },
    'Failed to fetch history'
  );
}

export function useHistory(filters: HistoryFilters) {
  return useQuery({
    queryKey: ['history', filters],
    queryFn: () => fetchHistory(filters),
  });
}
