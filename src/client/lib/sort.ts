import dayjs from 'dayjs';

export type SortOption =
  | 'created:desc'
  | 'created:asc'
  | 'updated:desc'
  | 'priority:asc'
  | 'priority:desc'
  | 'title:asc'
  | 'title:desc';

interface SortOptionItem {
  value: SortOption;
  label: string;
}

export const SORT_OPTIONS: SortOptionItem[] = [
  { value: 'created:desc', label: 'Newest first' },
  { value: 'created:asc', label: 'Oldest first' },
  { value: 'updated:desc', label: 'Recently updated' },
  { value: 'priority:asc', label: 'Priority (high to low)' },
  { value: 'priority:desc', label: 'Priority (low to high)' },
  { value: 'title:asc', label: 'Title (A-Z)' },
  { value: 'title:desc', label: 'Title (Z-A)' },
];

interface Sortable {
  createdAt: string;
  updatedAt: string;
  priority: number;
  title: string;
}

export function compareBySortOption<T extends Sortable>(a: T, b: T, sort: SortOption): number {
  switch (sort) {
    case 'created:desc':
      return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
    case 'created:asc':
      return dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf();
    case 'updated:desc':
      return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf();
    case 'priority:asc':
      return a.priority - b.priority;
    case 'priority:desc':
      return b.priority - a.priority;
    case 'title:asc':
      return a.title.localeCompare(b.title);
    case 'title:desc':
      return b.title.localeCompare(a.title);
    default:
      return 0;
  }
}
