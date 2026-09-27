import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import { parseItems, shuffleList } from './logic';

const ITEMS = ['a', 'b', 'c', 'd', 'e'];

describe('parseItems', () => {
  it('splits lines and drops empty ones only when asked', () => {
    expect(parseItems('a\n\nb\r\nb', true)).toEqual(['a', 'b', 'b']);
    expect(parseItems('a\n\nb', false)).toEqual(['a', '', 'b']);
    expect(parseItems('', true)).toEqual([]);
    expect(parseItems('', false)).toEqual([]);
  });
});

describe('shuffleList', () => {
  it('returns a permutation of the same items, repeated ones included', () => {
    const items = [...ITEMS, 'a'];
    const out = shuffleList(seededRng('demo'), items);
    expect([...out].sort()).toEqual([...items].sort());
    expect(items).toEqual([...ITEMS, 'a']);
  });

  it('is deterministic with a seed', () => {
    expect(shuffleList(seededRng('demo'), ITEMS)).toEqual(shuffleList(seededRng('demo'), ITEMS));
  });

  it('gives other orders with other seeds', () => {
    const orders = new Set(
      ['1', '2', '3', '4', '5', '6', '7', '8'].map((s) =>
        shuffleList(seededRng(s), ITEMS).join(''),
      ),
    );
    expect(orders.size).toBeGreaterThan(1);
  });

  it('keeps only the first N items', () => {
    const all = shuffleList(seededRng('demo'), ITEMS);
    expect(shuffleList(seededRng('demo'), ITEMS, 2)).toEqual(all.slice(0, 2));
    expect(shuffleList(seededRng('demo'), ITEMS, 99)).toHaveLength(5);
    expect(shuffleList(seededRng('demo'), ITEMS, 0)).toHaveLength(1);
  });

  it('puts every item first about as often (uniform)', () => {
    const rng = seededRng('uniform');
    const firsts: Record<string, number> = {};
    for (let i = 0; i < 50_000; i++) {
      const f = shuffleList(rng, ITEMS)[0];
      firsts[f] = (firsts[f] ?? 0) + 1;
    }
    for (const item of ITEMS) {
      expect(firsts[item]).toBeGreaterThan(9_000);
      expect(firsts[item]).toBeLessThan(11_000);
    }
  });
});
