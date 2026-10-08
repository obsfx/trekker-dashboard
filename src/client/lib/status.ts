const TERMINAL_STATUSES = ['completed', 'archived', 'wont_fix'] as const;
type TerminalStatus = (typeof TERMINAL_STATUSES)[number];

export function isTerminalStatus(status: string): status is TerminalStatus {
  return (TERMINAL_STATUSES as readonly string[]).includes(status);
}

export function countCompleted(items: { status: string }[]): number {
  return items.filter((item) => isTerminalStatus(item.status)).length;
}
