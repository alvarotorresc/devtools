import type { Locale } from '../tools/types';

// `\s` also covers the no-break (U+00A0), narrow no-break (U+202F) and thin (U+2009) spaces
// that Intl and word processors put inside numbers.
const SPACES = /\s/g;
const PLAIN = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;

/**
 * Reads a number typed the Spanish or the English way: "1.234,5", "1,234.5", "1,5", "1e3".
 * The last of "." and "," is the decimal mark when both appear; a mark repeated several times
 * groups thousands; a single mark followed by exactly 3 digits groups thousands only when it is
 * the locale's thousands separator. Returns null when the text is not a finite number.
 */
export function parseDecimal(input: string, locale: Locale): number | null {
  let s = input.replace(SPACES, '');
  if (!s) return null;
  const dots = s.split('.').length - 1;
  const commas = s.split(',').length - 1;
  if (dots && commas) {
    const decimal = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ',';
    const group = decimal === '.' ? ',' : '.';
    s = s.split(group).join('');
    if (decimal === ',') s = s.replace(',', '.');
  } else if (dots > 1 || commas > 1) {
    s = s.replace(/[.,]/g, '');
  } else if (dots || commas) {
    const mark = dots ? '.' : ',';
    const thousands = locale === 'es' ? '.' : ',';
    const groupsThousands = mark === thousands && /^[-+]?\d+[.,]\d{3}$/.test(s);
    s = groupsThousands ? s.replace(mark, '') : s.replace(',', '.');
  }
  if (!PLAIN.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Grouped, localized number. Very large or very small values switch to scientific notation. */
export function formatNumber(n: number, locale: Locale, maxFractionDigits = 10): string {
  const abs = Math.abs(n);
  const scientific = abs >= 1e15 || (abs > 0 && abs < 1e-6);
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: maxFractionDigits,
    notation: scientific ? 'scientific' : 'standard',
    useGrouping: true,
  }).format(n);
}

export function formatMoney(n: number, locale: Locale, currency = 'EUR'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n);
}

/** Rounds to the cent with halves away from zero (1.005 → 1.01, −1.005 → −1.01). */
export function roundCents(n: number): number {
  return (Math.sign(n) * Math.round(Math.abs(n) * 100 + 1e-7)) / 100;
}
