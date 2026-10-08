import type { BreadcrumbItem } from '@/components/breadcrumb';
import type { Task } from '@/types';

export interface WorkItemViewProps {
  breadcrumbItems: BreadcrumbItem[];
  status: string;
  priority: number;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: number) => void;
  onTaskClick?: (task: Task) => void;
}
