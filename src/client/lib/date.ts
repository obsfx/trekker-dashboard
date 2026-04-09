import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { DAYS_PER_WEEK, HOURS_PER_DAY, MINUTES_PER_HOUR } from '@/lib/constants';

dayjs.extend(relativeTime);

export function formatRelative(date: string | Date): string {
  return dayjs(date).fromNow();
}

export function formatDate(date: string | Date, format = 'MMM D, YYYY'): string {
  return dayjs(date).format(format);
}

export function formatRelativeTime(date: string | Date): string {
  const now = dayjs();
  const then = dayjs(date);
  const diffMins = now.diff(then, 'minute');
  const diffHours = now.diff(then, 'hour');
  const diffDays = now.diff(then, 'day');

  if (diffMins < 1) return 'just now';
  if (diffMins < MINUTES_PER_HOUR) return `${diffMins}m ago`;
  if (diffHours < HOURS_PER_DAY) return `${diffHours}h ago`;
  if (diffDays < DAYS_PER_WEEK) return `${diffDays}d ago`;
  return then.format('MMM D, YYYY');
}
