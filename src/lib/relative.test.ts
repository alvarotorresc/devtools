import { describe, expect, it } from 'vitest';
import { formatRelative } from './relative';

const NOW = Date.UTC(2026, 8, 26, 12, 0, 0);

describe('formatRelative', () => {
  it('uses the largest unit that fits, in both languages', () => {
    expect(formatRelative(NOW - 2 * 3_600_000, NOW, 'es')).toBe('hace 2 horas');
    expect(formatRelative(NOW - 2 * 3_600_000, NOW, 'en')).toBe('2 hours ago');
    expect(formatRelative(NOW + 3 * 86_400_000, NOW, 'es')).toBe('dentro de 3 días');
    expect(formatRelative(NOW + 3 * 86_400_000, NOW, 'en')).toBe('in 3 days');
  });

  it('truncates instead of rounding up', () => {
    expect(formatRelative(NOW - 90 * 60_000, NOW, 'en')).toBe('1 hour ago');
  });

  it('says "now" for less than a second', () => {
    expect(formatRelative(NOW - 400, NOW, 'en')).toBe('now');
    expect(formatRelative(NOW, NOW, 'es')).toBe('ahora');
  });

  it('counts seconds under a minute', () => {
    expect(formatRelative(NOW - 45_000, NOW, 'en')).toBe('45 seconds ago');
  });
});
