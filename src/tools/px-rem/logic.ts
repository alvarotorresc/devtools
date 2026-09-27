import { parseDecimal } from '../../lib/numbers';

export const DEFAULT_BASE = 16;
export const COMMON_SIZES = [10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64];

/**
 * CSS values have no thousands separators, so a comma is always the decimal mark here.
 * Parsing with the `es` rules would read "0.875" as 875.
 */
export function parseCssNumber(input: string): number | null {
  return parseDecimal(input.replace(',', '.'), 'en');
}

/** Always a dot, 4 decimals at most and no trailing zeros: valid CSS in both languages. */
export function fmt(n: number): string {
  return String(Number(n.toFixed(4)));
}

export function pxToRem(px: number, base: number): number {
  return px / base;
}

export function remToPx(rem: number, base: number): number {
  return rem * base;
}

export function cssSnippet(px: number, base: number): string {
  return `font-size: ${fmt(pxToRem(px, base))}rem; /* ${fmt(px)}px */`;
}

export function sizeTable(base: number): { px: number; rem: string }[] {
  return COMMON_SIZES.map((px) => ({ px, rem: fmt(pxToRem(px, base)) }));
}
