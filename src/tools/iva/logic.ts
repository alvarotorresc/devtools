import { roundCents } from '../../lib/numbers';

/** Spanish VAT rates (Ley 37/1992, art. 90 and 91), as of 2026-09. */
export const VAT_RATES = [21, 10, 4] as const;

export type VatDirection = 'base' | 'total';

export interface VatBreakdown {
  base: number;
  vat: number;
  total: number;
}

/** base → total: the VAT is rounded to the cent and added to the base. */
export function vatFromBase(base: number, rate: number): VatBreakdown {
  const b = roundCents(base);
  const vat = roundCents((b * rate) / 100);
  return { base: b, vat, total: roundCents(b + vat) };
}

/** total → base: the base is rounded first and the VAT is what is left, so base + VAT = total. */
export function vatFromTotal(total: number, rate: number): VatBreakdown {
  const t = roundCents(total);
  const base = roundCents(t / (1 + rate / 100));
  return { base, vat: roundCents(t - base), total: t };
}

export function breakdown(amount: number, direction: VatDirection, rate: number): VatBreakdown {
  return direction === 'base' ? vatFromBase(amount, rate) : vatFromTotal(amount, rate);
}

/** A custom rate, such as the Canary Islands IGIC: 0 to 100, decimals allowed. */
export function isValidRate(rate: number | null): rate is number {
  return rate !== null && rate >= 0 && rate <= 100;
}
