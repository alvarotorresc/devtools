import { describe, expect, it } from 'vitest';
import { truncate } from './toast';

describe('truncate', () => {
  it('keeps short strings', () => {
    expect(truncate('abc', 5)).toBe('abc');
  });

  it('cuts long strings with an ellipsis within the limit', () => {
    const out = truncate('a'.repeat(50), 10);
    expect(out).toHaveLength(10);
    expect(out.endsWith('…')).toBe(true);
  });

  it('collapses newlines so multi-line values fit in one toast line', () => {
    expect(truncate('a\nb', 40)).toBe('a b');
  });
});
