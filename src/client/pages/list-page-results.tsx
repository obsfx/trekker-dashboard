'use client';

import { Badge } from '@/components/ui/badge';
import type { ListItem, ListResponse } from '@/hooks/use-list';
import { PRIORITY_LABELS, PRIORITY_STYLES, STATUS_LABELS, STATUS_STYLES } from '@/lib/constants';
import { formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import { PageResultsFrame } from '@/pages/page-results-frame';

interface ListPageResultsProps {
  error: unknown;
  isLoading: boolean;
  items: ListItem[];
  onRowClick: (item: ListItem) => void;
  response: ListResponse | undefined;
}

function getTypeBadgeClassName(type: ListItem['type']): string {
  if (type === 'epic') {
    return 'border-purple-500 text-purple-500';
  }

  if (type === 'task') {
    return 'border-blue-500 text-blue-500';
  }

  return 'border-gray-500 text-gray-500';
}

export function ListPageResults({
  error,
  isLoading,
  items,
  onRowClick,
  response,
}: ListPageResultsProps) {
  return (
    <PageResultsFrame
      content={
        <table className="w-full">
          <thead className="sticky top-0 bg-muted/50">
            <tr className="text-left text-sm">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer border-t transition-colors hover:bg-muted/30"
                onClick={() => onRowClick(item)}
              >
                <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{item.id}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={cn(getTypeBadgeClassName(item.type))}>
                    {item.type}
                  </Badge>
                </td>
                <td className="max-w-md truncate px-4 py-3">{item.title}</td>
                <td className="px-4 py-3">
                  <Badge
                    style={{
                      backgroundColor: STATUS_STYLES[item.status]?.bg ?? '#6b7280',
                      color: STATUS_STYLES[item.status]?.text ?? '#ffffff',
                    }}
                  >
                    {STATUS_LABELS[item.status] ?? item.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: PRIORITY_STYLES[item.priority]?.bg ?? '#6b7280',
                      color: PRIORITY_STYLES[item.priority]?.bg ?? '#6b7280',
                    }}
                  >
                    P{item.priority} - {PRIORITY_LABELS[item.priority]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDate(item.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
      emptyMessage="No items found"
      error={error}
      isEmpty={!response?.items.length}
      isLoading={isLoading}
    />
  );
}
