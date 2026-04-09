import type { BreadcrumbItem } from '@/components/breadcrumb';
import type { Epic } from '@/types';

export function buildEpicBreadcrumbItems(epic: Epic): BreadcrumbItem[] {
  return [{ id: epic.id, title: epic.title, type: 'epic' }];
}
