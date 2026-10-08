// Re-export status arrays from types
export { EPIC_STATUSES, TASK_STATUSES } from '@/lib/types';

export const DEFAULT_PRIORITY = 2;
export const MAX_PRIORITY = 5;
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

export interface BadgeColors {
  bg: string;
  text: string;
}

export const FALLBACK_BADGE_COLORS: BadgeColors = { bg: '#6b7280', text: '#ffffff' };

export const STATUS_LABELS = new Map([
  ['todo', 'TODO'],
  ['in_progress', 'In Progress'],
  ['completed', 'Completed'],
  ['wont_fix', "Won't Fix"],
  ['archived', 'Archived'],
]);

export const STATUS_STYLES = new Map<string, BadgeColors>([
  ['todo', { bg: '#6b7280', text: '#ffffff' }],
  ['in_progress', { bg: '#3b82f6', text: '#ffffff' }],
  ['completed', { bg: '#22c55e', text: '#ffffff' }],
  ['wont_fix', { bg: '#f59e0b', text: '#ffffff' }],
  ['archived', { bg: '#9ca3af', text: '#ffffff' }],
]);

export const PRIORITY_LABELS = new Map([
  [0, 'Critical'],
  [1, 'High'],
  [2, 'Medium'],
  [3, 'Low'],
  [4, 'Backlog'],
  [5, 'Someday'],
]);

export const PRIORITY_STYLES = new Map<number, BadgeColors>([
  [0, { bg: '#dc2626', text: '#ffffff' }],
  [1, { bg: '#ea580c', text: '#ffffff' }],
  [2, { bg: '#ca8a04', text: '#ffffff' }],
  [3, { bg: '#6b7280', text: '#ffffff' }],
  [4, { bg: '#6b7280', text: '#ffffff' }],
  [5, { bg: '#9ca3af', text: '#ffffff' }],
]);
