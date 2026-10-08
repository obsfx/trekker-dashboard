import { describe, expect, it } from 'bun:test';

import { countCompleted, isTerminalStatus } from '@/lib/status';

describe('isTerminalStatus', () => {
  it('treats completed, archived and wont_fix as terminal', () => {
    expect(isTerminalStatus('completed')).toBe(true);
    expect(isTerminalStatus('archived')).toBe(true);
    expect(isTerminalStatus('wont_fix')).toBe(true);
  });

  it('treats active statuses as non-terminal', () => {
    expect(isTerminalStatus('todo')).toBe(false);
    expect(isTerminalStatus('in_progress')).toBe(false);
  });
});

describe('countCompleted', () => {
  it('counts archived and wont_fix as completed, not just completed', () => {
    const items = [
      { status: 'todo' },
      { status: 'in_progress' },
      { status: 'completed' },
      { status: 'archived' },
      { status: 'wont_fix' },
    ];
    expect(countCompleted(items)).toBe(3);
  });

  it('returns 0 for an empty list', () => {
    expect(countCompleted([])).toBe(0);
  });
});
