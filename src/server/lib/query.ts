import { DEFAULT_PAGE } from '@server/lib/constants';

export function parseCsvQuery(value: string | undefined): string[] | undefined {
  if (!value) {
    return;
  }

  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  if (items.length > 0) {
    return items;
  }
}

function parseQueryNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);
  if (Number.isNaN(parsedValue)) {
    return fallback;
  }

  return parsedValue;
}

export function parseNumberCsvQuery(value: string | undefined): number[] | undefined {
  const items = parseCsvQuery(value);
  if (!items) {
    return;
  }

  const parsedNumbers = items
    .map((item) => Number.parseInt(item, 10))
    .filter((item) => !Number.isNaN(item));

  if (parsedNumbers.length > 0) {
    return parsedNumbers;
  }
}

export type SqlParam = string | number;

interface Pagination {
  limit: number;
  page: number;
  offset: number;
}

export function parsePagination(
  limitParam: string | undefined,
  pageParam: string | undefined,
  defaultLimit: number
): Pagination {
  const limit = parseQueryNumber(limitParam, defaultLimit);
  const page = parseQueryNumber(pageParam, DEFAULT_PAGE);
  return { limit, page, offset: (page - 1) * limit };
}

export function addInCondition(
  conditions: string[],
  params: SqlParam[],
  column: string,
  values: readonly SqlParam[] | undefined
): void {
  if (!values || values.length === 0) {
    return;
  }

  const placeholders = values.map(() => '?').join(', ');
  conditions.push(`${column} IN (${placeholders})`);
  params.push(...values);
}
