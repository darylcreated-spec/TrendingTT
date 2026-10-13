import { describe, it, expect } from 'vitest';
import {
  formatPostDateTime,
  formatPostDateOnly,
  formatPostTimeOnly,
  formatRelativeTime,
} from '../utils/dateUtils';

describe('dateUtils (AST Trinidad & Tobago Timezone America/Port_of_Spain)', () => {
  it('formats full post date and time with AST suffix', () => {
    // 2026-10-12T18:00:00Z is 2:00 PM AST (UTC-4)
    const result = formatPostDateTime('2026-10-12T18:00:00Z');
    expect(result).toContain('AST');
    expect(result).toMatch(/Oct 12, 2026 • 2:00 PM AST/);
  });

  it('formats date only', () => {
    const result = formatPostDateOnly('2026-10-12T18:00:00Z');
    expect(result).toBe('Oct 12, 2026');
  });

  it('formats time only with AST suffix', () => {
    const result = formatPostTimeOnly('2026-10-12T18:00:00Z');
    expect(result).toBe('2:00 PM AST');
  });

  it('handles relative time calculation cleanly', () => {
    const now = Date.now();
    const tenMinsAgo = new Date(now - 10 * 60 * 1000).toISOString();
    const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();

    expect(formatRelativeTime(tenMinsAgo)).toBe('10m ago');
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
    expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago');
  });

  it('gracefully handles invalid date strings', () => {
    expect(formatPostDateTime('invalid-date')).toBe('Recently');
    expect(formatPostDateOnly('invalid-date')).toBe('');
    expect(formatPostTimeOnly('invalid-date')).toBe('');
    expect(formatRelativeTime('invalid-date')).toBe('');
  });
});
