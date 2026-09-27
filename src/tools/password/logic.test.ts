import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import {
  AMBIGUOUS,
  DEFAULT_OPTIONS,
  SETS,
  activeSets,
  entropyBits,
  generatePassword,
  sanitizeOptions,
  strength,
  validate,
} from './logic';

describe('character sets', () => {
  it('has the 32 printable ASCII symbols and 94 characters in total', () => {
    expect(SETS.symbols).toHaveLength(32);
    expect(activeSets(DEFAULT_OPTIONS).join('')).toHaveLength(94);
  });

  it('removes 0 O o 1 l I | when ambiguous characters are excluded', () => {
    const all = activeSets({ ...DEFAULT_OPTIONS, excludeAmbiguous: true }).join('');
    expect(all).toHaveLength(94 - 7);
    for (const c of AMBIGUOUS) expect(all).not.toContain(c);
  });
});

describe('generatePassword', () => {
  it('always has the requested length and at least one character of each active set', () => {
    const rng = seededRng('test');
    for (let i = 0; i < 1000; i++) {
      const length = 4 + (i % 30);
      const p = generatePassword(rng, { ...DEFAULT_OPTIONS, length });
      expect(p).toHaveLength(length);
      for (const set of Object.values(SETS)) expect([...p].some((c) => set.includes(c))).toBe(true);
    }
  });

  it('never uses an ambiguous character when they are excluded', () => {
    const rng = seededRng('test');
    const opts = { ...DEFAULT_OPTIONS, length: 64, excludeAmbiguous: true };
    for (let i = 0; i < 200; i++) {
      const p = generatePassword(rng, opts);
      for (const c of AMBIGUOUS) expect(p).not.toContain(c);
    }
  });

  it('only uses the active sets', () => {
    const p = generatePassword(seededRng('x'), {
      ...DEFAULT_OPTIONS,
      length: 50,
      upper: false,
      symbols: false,
    });
    expect(p).toMatch(/^[a-z0-9]{50}$/);
  });

  it('is reproducible with a seed (tests only) and different across seeds', () => {
    const a = generatePassword(seededRng('demo'), DEFAULT_OPTIONS);
    expect(generatePassword(seededRng('demo'), DEFAULT_OPTIONS)).toBe(a);
    expect(generatePassword(seededRng('otra'), DEFAULT_OPTIONS)).not.toBe(a);
  });
});

describe('validate', () => {
  it('needs at least one set', () => {
    expect(
      validate({ ...DEFAULT_OPTIONS, lower: false, upper: false, digits: false, symbols: false }),
    ).toEqual({ kind: 'no-sets' });
  });

  it('needs room for one character of each set', () => {
    expect(validate({ ...DEFAULT_OPTIONS, length: 3 })).toEqual({ kind: 'too-short', sets: 4 });
    expect(validate({ ...DEFAULT_OPTIONS, length: 4 })).toBeNull();
  });
});

describe('entropy', () => {
  it('is 131.1 bits for 20 characters out of 94', () => {
    expect(entropyBits(DEFAULT_OPTIONS)).toBeCloseTo(131.09, 2);
  });

  it('rates weak below 50 bits, fair below 80 and strong from 80', () => {
    expect(strength(49.9)).toBe('weak');
    expect(strength(50)).toBe('fair');
    expect(strength(79.9)).toBe('fair');
    expect(strength(80)).toBe('strong');
    // 8 lowercase letters: 8 × log2(26) ≈ 37.6 bits.
    expect(
      strength(
        entropyBits({ ...DEFAULT_OPTIONS, length: 8, upper: false, digits: false, symbols: false }),
      ),
    ).toBe('weak');
  });
});

describe('sanitizeOptions', () => {
  it('keeps valid stored options and replaces anything odd with the defaults', () => {
    expect(sanitizeOptions({ ...DEFAULT_OPTIONS, length: 32, symbols: false })).toEqual({
      ...DEFAULT_OPTIONS,
      length: 32,
      symbols: false,
    });
    expect(sanitizeOptions({ length: 9999, count: 'x', lower: 'yes' })).toEqual(DEFAULT_OPTIONS);
    expect(sanitizeOptions(null)).toEqual(DEFAULT_OPTIONS);
  });
});
