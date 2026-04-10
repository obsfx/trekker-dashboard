export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

interface FiltersWithPage {
  page?: number;
}

export function withResetPage<T extends FiltersWithPage>(filters: T, updates: Partial<T>): T {
  return {
    ...filters,
    ...updates,
    page: 1,
  };
}

export function serializeFilterValues(values?: readonly (string | number)[]): string {
  return values?.join(',') ?? 'all';
}

export function parseFilterValues<T extends string>(
  value: string,
  options: readonly FilterOption<T>[]
): T[] | undefined {
  if (value === 'all') {
    return;
  }

  const allowedValues = new Set(options.map((option) => option.value));
  const parsedValues = value
    .split(',')
    .filter((candidate): candidate is T => allowedValues.has(candidate as T));

  if (parsedValues.length > 0) {
    return parsedValues;
  }
}

export function parseNumericFilterValues(value: string): number[] | undefined {
  if (value === 'all') {
    return;
  }

  const parsedValues = value
    .split(',')
    .map(Number)
    .filter((candidate) => Number.isFinite(candidate));

  if (parsedValues.length > 0) {
    return parsedValues;
  }
}

export function buildUtcDateFilter(
  value: string,
  suffix: 'T00:00:00Z' | 'T23:59:59Z'
): string | undefined {
  if (!value) {
    return;
  }

  return `${value}${suffix}`;
}
