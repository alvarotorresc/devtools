import { describe, expect, it } from 'vitest';
import {
  cryptoRng,
  digits,
  pick,
  randInt,
  randomBytesFrom,
  randomSeed,
  rngFromSeed,
  seededRng,
  shuffle,
  type Rng,
} from './random';

const take = (rng: Rng, n: number) => Array.from({ length: n }, () => rng());

describe('seededRng', () => {
  it('gives the same sequence for the same seed', () => {
    expect(take(seededRng('demo'), 20)).toEqual(take(seededRng('demo'), 20));
  });

  it('gives different sequences for different seeds', () => {
    expect(take(seededRng('demo'), 5)).not.toEqual(take(seededRng('demo2'), 5));
    expect(take(seededRng('42'), 5)).not.toEqual(take(seededRng('43'), 5));
  });

  it('is pinned: FNV-1a + mulberry32 must never change, or saved seeds would change output', () => {
    expect(take(seededRng('demo'), 3)).toEqual(DEMO_FIRST_THREE);
    expect(take(seededRng('ñ'), 1)).toEqual(ENYE_FIRST);
  });

  it('returns unsigned 32-bit integers', () => {
    for (const x of take(seededRng('range'), 1000)) {
      expect(Number.isInteger(x)).toBe(true);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(2 ** 32);
    }
  });
});

describe('rngFromSeed', () => {
  it('uses the seed after trimming it', () => {
    expect(take(rngFromSeed('  demo '), 3)).toEqual(take(seededRng('demo'), 3));
  });

  it('falls back to crypto randomness without a seed', () => {
    const a = take(rngFromSeed(''), 4);
    const b = take(rngFromSeed(undefined), 4);
    const c = take(rngFromSeed('   '), 4);
    expect(a).not.toEqual(b);
    expect(b).not.toEqual(c);
  });
});

describe('cryptoRng and randomSeed', () => {
  it('keeps producing values past its 256-value buffer', () => {
    const values = take(cryptoRng(), 600);
    expect(new Set(values).size).toBeGreaterThan(590);
  });

  it('makes a non-empty seed that changes every time', () => {
    const a = randomSeed();
    expect(a).toMatch(/^[0-9a-z]+$/);
    expect(randomSeed()).not.toBe(a);
  });
});

describe('randInt', () => {
  it('never leaves the range and includes both ends', () => {
    const rng = seededRng('bounds');
    const seen = new Set<number>();
    for (let i = 0; i < 5000; i++) {
      const x = randInt(rng, -3, 3);
      expect(x).toBeGreaterThanOrEqual(-3);
      expect(x).toBeLessThanOrEqual(3);
      seen.add(x);
    }
    expect([...seen].sort((a, b) => a - b)).toEqual([-3, -2, -1, 0, 1, 2, 3]);
  });

  it('is unbiased: 60 000 rolls of 0–5 land 9 000–11 000 times each', () => {
    const rng = seededRng('fair');
    const counts = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 60_000; i++) counts[randInt(rng, 0, 5)]++;
    for (const c of counts) {
      expect(c).toBeGreaterThanOrEqual(9000);
      expect(c).toBeLessThanOrEqual(11_000);
    }
  });

  it('rejects the values above the last full block (no modulo bias)', () => {
    // range 3: limit = 2^32 − (2^32 mod 3) = 4294967295, so 4294967295 must be redrawn.
    const values = [4294967295, 7];
    const rng: Rng = () => values.shift()!;
    expect(randInt(rng, 0, 2)).toBe(1);
    expect(values).toEqual([]);
  });

  it('accepts a range of exactly 2^32 values and rejects bigger or inverted ones', () => {
    expect(randInt(() => 123, 0, 2 ** 32 - 1)).toBe(123);
    expect(() => randInt(() => 0, 0, 2 ** 32)).toThrow(RangeError);
    expect(() => randInt(() => 0, 5, 4)).toThrow(RangeError);
    expect(() => randInt(() => 0, 0.5, 4)).toThrow(RangeError);
  });
});

describe('pick, shuffle and digits', () => {
  it('picks an element of the list', () => {
    const rng = seededRng('pick');
    for (let i = 0; i < 100; i++) expect(['a', 'b', 'c']).toContain(pick(rng, ['a', 'b', 'c']));
    expect(() => pick(rng, [])).toThrow(RangeError);
  });

  it('shuffles a copy and keeps every element', () => {
    const input = ['a', 'b', 'c', 'd', 'e', 'f'];
    const frozen = Object.freeze(input.slice());
    const out = shuffle(seededRng('shuffle'), frozen);
    expect(out).not.toBe(frozen);
    expect([...out].sort()).toEqual(input);
    expect(frozen).toEqual(input);
  });

  it('shuffles the same way with the same seed', () => {
    const list = Array.from({ length: 20 }, (_, i) => i);
    expect(shuffle(seededRng('s'), list)).toEqual(shuffle(seededRng('s'), list));
  });

  it('makes digit strings of the requested length, leading zeros included', () => {
    const rng = seededRng('digits');
    const all = Array.from({ length: 200 }, () => digits(rng, 8));
    for (const d of all) expect(d).toMatch(/^\d{8}$/);
    expect(all.some((d) => d.startsWith('0'))).toBe(true);
    expect(digits(rng, 0)).toBe('');
  });
});

describe('randomBytesFrom', () => {
  it('returns exactly n bytes, deterministic with a seed', () => {
    const a = randomBytesFrom(seededRng('bytes'))(10);
    const b = randomBytesFrom(seededRng('bytes'))(10);
    expect(a).toHaveLength(10);
    expect(a).toEqual(b);
    expect(randomBytesFrom(seededRng('bytes'))(0)).toHaveLength(0);
  });

  it('uses the four bytes of each value, low byte first', () => {
    const bytes = randomBytesFrom(() => 0x04030201)(6);
    expect([...bytes]).toEqual([1, 2, 3, 4, 1, 2]);
  });
});

// Pinned outputs, computed once with the reference implementation of §4.2.
const DEMO_FIRST_THREE = [3603001048, 581339189, 238296426];
const ENYE_FIRST = [2805759514];
