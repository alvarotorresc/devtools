/** Removes floating-point noise: 0.07 × 100 = 7.000000000000001 → 7. */
export function clean(x: number): number {
  return Number(x.toPrecision(12));
}

/** X % of Y, plus Y with that percentage added (surcharge) and taken off (discount). */
export function percentOf(x: number, y: number): { value: number; plus: number; minus: number } {
  const value = clean((x / 100) * y);
  return { value, plus: clean(y + value), minus: clean(y - value) };
}

/** What percentage X is of Y; null when Y is 0. */
export function whatPercent(x: number, y: number): number | null {
  return y === 0 ? null : clean((x / y) * 100);
}

export type Change = { value: number; kind: 'increase' | 'decrease' | 'none' };

/** Change from A to B, relative to |A|; null when A is 0. */
export function percentChange(a: number, b: number): Change | null {
  if (a === 0) return null;
  const value = clean(((b - a) / Math.abs(a)) * 100);
  return { value, kind: value > 0 ? 'increase' : value < 0 ? 'decrease' : 'none' };
}
