import { describe, expect, it } from 'vitest';
import { breakdown, isValidRate, VAT_RATES, vatFromBase, vatFromTotal } from './logic';

describe('vatFromBase', () => {
  it('adds the rounded VAT to the base', () => {
    expect(vatFromBase(100, 21)).toEqual({ base: 100, vat: 21, total: 121 });
    expect(vatFromBase(100, 10)).toEqual({ base: 100, vat: 10, total: 110 });
    expect(vatFromBase(100, 4)).toEqual({ base: 100, vat: 4, total: 104 });
    expect(vatFromBase(10.05, 21)).toEqual({ base: 10.05, vat: 2.11, total: 12.16 });
  });

  it('accepts decimal rates such as IGIC', () => {
    expect(vatFromBase(100, 7)).toEqual({ base: 100, vat: 7, total: 107 });
    expect(vatFromBase(100, 9.5)).toEqual({ base: 100, vat: 9.5, total: 109.5 });
  });
});

describe('vatFromTotal', () => {
  it('splits a total so base + VAT adds up exactly', () => {
    expect(vatFromTotal(121, 21)).toEqual({ base: 100, vat: 21, total: 121 });
    expect(vatFromTotal(100, 21)).toEqual({ base: 82.64, vat: 17.36, total: 100 });
    for (let cents = 1; cents <= 5000; cents += 7) {
      const r = vatFromTotal(cents / 100, 21);
      expect(Math.round((r.base + r.vat) * 100)).toBe(cents);
    }
  });
});

describe('edge cases', () => {
  it('turns 0 into all zeros', () => {
    expect(breakdown(0, 'base', 21)).toEqual({ base: 0, vat: 0, total: 0 });
    expect(breakdown(0, 'total', 21)).toEqual({ base: 0, vat: 0, total: 0 });
  });

  it('handles credit notes with symmetric rounding', () => {
    expect(breakdown(-100, 'base', 21)).toEqual({ base: -100, vat: -21, total: -121 });
    expect(breakdown(-100, 'total', 21)).toEqual({ base: -82.64, vat: -17.36, total: -100 });
  });

  it('checks custom rates', () => {
    expect(VAT_RATES).toEqual([21, 10, 4]);
    expect(isValidRate(7.5)).toBe(true);
    expect(isValidRate(0)).toBe(true);
    expect(isValidRate(101)).toBe(false);
    expect(isValidRate(-1)).toBe(false);
    expect(isValidRate(null)).toBe(false);
  });
});
