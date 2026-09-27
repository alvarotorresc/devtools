import { describe, expect, it } from 'vitest';
import { clean, percentChange, percentOf, whatPercent } from './logic';

describe('percentOf', () => {
  it('computes X % of Y and the discount and surcharge', () => {
    expect(percentOf(21, 200)).toEqual({ value: 42, plus: 242, minus: 158 });
    expect(percentOf(15, 80)).toEqual({ value: 12, plus: 92, minus: 68 });
    expect(percentOf(7, 100).value).toBe(7);
    expect(percentOf(12.5, 64).value).toBe(8);
  });

  it('handles 0 and negatives', () => {
    expect(percentOf(0, 200)).toEqual({ value: 0, plus: 200, minus: 200 });
    // A negative X is a discount that flips into a surcharge: Y + X% = Y − |X|% and
    // Y − X% = Y + |X|%, which is what the UI relies on to show a single sign.
    expect(percentOf(-10, 50)).toEqual({ value: -5, plus: 45, minus: 55 });
  });

  it('keeps exact results with 13+ significant digits', () => {
    // 1 234 567 890 123 + 10 % must land on 1 358 024 679 135,3, not round off to
    // 1 358 024 679 140 the way a 12-digit toPrecision does (I2).
    expect(percentOf(10, 1234567890123).plus).toBe(1358024679135.3);
  });
});

describe('whatPercent', () => {
  it('computes X / Y × 100', () => {
    expect(whatPercent(42, 200)).toBe(21);
    expect(whatPercent(1, 3)).toBe(33.3333333333333);
    expect(whatPercent(300, 200)).toBe(150);
  });

  it('refuses to divide by 0', () => {
    expect(whatPercent(5, 0)).toBeNull();
  });
});

describe('percentChange', () => {
  it('says whether it is an increase or a decrease', () => {
    expect(percentChange(50, 75)).toEqual({ value: 50, kind: 'increase' });
    expect(percentChange(80, 60)).toEqual({ value: -25, kind: 'decrease' });
    expect(percentChange(10, 10)).toEqual({ value: 0, kind: 'none' });
  });

  it('uses |A| so a negative start still reads the right way', () => {
    expect(percentChange(-50, -25)).toEqual({ value: 50, kind: 'increase' });
  });

  it('has no percentage change from 0', () => {
    expect(percentChange(0, 10)).toBeNull();
  });

  it('removes floating-point noise', () => {
    expect(clean(0.1 + 0.2)).toBe(0.3);
    expect(percentChange(0.1, 0.3)!.value).toBe(200);
  });
});
