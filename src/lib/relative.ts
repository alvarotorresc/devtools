import type { Locale } from '../tools/types';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 86_400_000],
  ['month', 30 * 86_400_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
  ['second', 1000],
];

/** "hace 2 horas" / "in 3 days": the largest unit that fits, truncated towards zero. */
export function formatRelative(targetMs: number, nowMs: number, locale: Locale): string {
  const diff = targetMs - nowMs;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const [unit, size] of UNITS) {
    if (Math.abs(diff) >= size || unit === 'second') {
      return rtf.format(Math.trunc(diff / size) || 0, unit);
    }
  }
  return '';
}
