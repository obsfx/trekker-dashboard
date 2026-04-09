// Re-export status arrays from types
export { EPIC_STATUSES, TASK_STATUSES } from '@/lib/types';

export const DEFAULT_HISTORY_PAGE_SIZE = 50;
export const DEFAULT_LIST_PAGE_SIZE = 20;
export const LIST_PAGE_SIZE_OPTIONS = [20, 50, 100] as const;
export const FULL_PERCENTAGE = 100;
export const QUERY_STALE_TIME_MS = 5 * 1000;
export const SEARCHABLE_SELECT_FOCUS_DELAY_MS = 10;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const DAYS_PER_WEEK = 7;
export const SUBTASK_PROGRESS_COMPLETE_THRESHOLD = 100;
export const SUBTASK_PROGRESS_GOOD_THRESHOLD = 67;
export const SUBTASK_PROGRESS_WARNING_THRESHOLD = 34;

// Status labels for display
export const STATUS_LABELS: Record<string, string> = {
  todo: 'TODO',
  in_progress: 'In Progress',
  completed: 'Completed',
  wont_fix: "Won't Fix",
  archived: 'Archived',
};

// Status styles (for inline styles)
export const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  todo: { bg: '#6b7280', text: '#ffffff' },
  in_progress: { bg: '#3b82f6', text: '#ffffff' },
  completed: { bg: '#22c55e', text: '#ffffff' },
  wont_fix: { bg: '#f59e0b', text: '#ffffff' },
  archived: { bg: '#9ca3af', text: '#ffffff' },
};

// Priority labels
export const PRIORITY_LABELS: Record<number, string> = {
  0: 'Critical',
  1: 'High',
  2: 'Medium',
  3: 'Low',
  4: 'Backlog',
  5: 'Someday',
};

// Priority styles (for inline styles)
export const PRIORITY_STYLES: Record<number, { bg: string; text: string }> = {
  0: { bg: '#dc2626', text: '#ffffff' }, // Critical - red
  1: { bg: '#ea580c', text: '#ffffff' }, // High - orange
  2: { bg: '#ca8a04', text: '#ffffff' }, // Medium - yellow
  3: { bg: '#6b7280', text: '#ffffff' }, // Low - gray
  4: { bg: '#6b7280', text: '#ffffff' }, // Backlog - gray
  5: { bg: '#9ca3af', text: '#ffffff' }, // Someday - light gray
};
