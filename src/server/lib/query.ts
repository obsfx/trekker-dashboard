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

export function parseQueryNumber(value: string | undefined, fallback: number): number {
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
