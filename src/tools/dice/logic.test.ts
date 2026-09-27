import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import {
  countCoins,
  diceRange,
  flipCoins,
  formatSpec,
  parseDice,
  pushHistory,
  rollDice,
} from './logic';

describe('parseDice', () => {
  it('reads NdM, NdM+K, NdM-K and dM', () => {
    expect(parseDice('3d6')).toEqual({ ok: true, spec: { count: 3, sides: 6, modifier: 0 } });
    expect(parseDice('2d20+1')).toEqual({ ok: true, spec: { count: 2, sides: 20, modifier: 1 } });
    expect(parseDice(' 4D6 - 2 ')).toEqual({
      ok: true,
      spec: { count: 4, sides: 6, modifier: -2 },
    });
    expect(parseDice('d100')).toEqual({ ok: true, spec: { count: 1, sides: 100, modifier: 0 } });
  });

  it('names the value that is out of range', () => {
    expect(parseDice('0d6')).toEqual({ ok: false, reason: 'count', value: 0 });
    expect(parseDice('101d6')).toEqual({ ok: false, reason: 'count', value: 101 });
    expect(parseDice('1d1')).toEqual({ ok: false, reason: 'sides', value: 1 });
    expect(parseDice('1d1001')).toEqual({ ok: false, reason: 'sides', value: 1001 });
    expect(parseDice('1d6+1001')).toEqual({ ok: false, reason: 'modifier', value: 1001 });
  });

  it('rejects text it does not understand', () => {
    expect(parseDice('')).toEqual({ ok: false, reason: 'format' });
    expect(parseDice('tres dados')).toEqual({ ok: false, reason: 'format' });
    expect(parseDice('3d')).toEqual({ ok: false, reason: 'format' });
    expect(parseDice('3d6*2')).toEqual({ ok: false, reason: 'format' });
  });

  it('writes the notation back', () => {
    expect(formatSpec({ count: 3, sides: 6, modifier: 2 })).toBe('3d6+2');
    expect(formatSpec({ count: 1, sides: 20, modifier: -1 })).toBe('1d20-1');
    expect(formatSpec({ count: 2, sides: 8, modifier: 0 })).toBe('2d8');
  });
});

describe('rollDice', () => {
  const spec = { count: 3, sides: 6, modifier: 2 };

  it('rolls each die within its faces and adds the modifier', () => {
    const rng = seededRng('demo');
    for (let i = 0; i < 1000; i++) {
      const r = rollDice(rng, spec);
      expect(r.dice).toHaveLength(3);
      for (const d of r.dice) expect(d >= 1 && d <= 6).toBe(true);
      expect(r.total).toBe(r.sum + 2);
      expect(r.total >= 5 && r.total <= 20).toBe(true);
    }
  });

  it('repeats the same series with the same seed', () => {
    const a = seededRng('demo');
    const b = seededRng('demo');
    const seriesA = [rollDice(a, spec), rollDice(a, spec)];
    const seriesB = [rollDice(b, spec), rollDice(b, spec)];
    expect(seriesA).toEqual(seriesB);
  });

  it('gives the minimum and maximum totals', () => {
    expect(diceRange(spec)).toEqual({ min: 5, max: 20 });
    expect(diceRange({ count: 1, sides: 20, modifier: -1 })).toEqual({ min: 0, max: 19 });
  });
});

describe('coins', () => {
  it('flips heads or tails and counts them', () => {
    const coins = flipCoins(seededRng('coin'), 100);
    expect(coins).toHaveLength(100);
    const { heads, tails } = countCoins(coins);
    expect(heads + tails).toBe(100);
    expect(heads).toBeGreaterThan(25);
    expect(tails).toBeGreaterThan(25);
  });

  it('keeps the last 10 entries in the history', () => {
    let h: number[] = [];
    for (let i = 0; i < 15; i++) h = pushHistory(h, i);
    expect(h).toEqual([14, 13, 12, 11, 10, 9, 8, 7, 6, 5]);
  });
});
