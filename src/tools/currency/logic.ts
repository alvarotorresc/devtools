/**
 * Public ECB reference rates. No query string: the whole EUR-based table comes down and the
 * conversion happens in the browser, so neither the amount nor the pair leaves the device.
 * Not api.frankfurter.app: it answers 301 without CORS headers and the browser fetch fails.
 */
export const RATES_URL = 'https://api.frankfurter.dev/v1/latest';
export const CACHE_KEY = 'currency.rates';
/** The ECB publishes once per working day (around 16:00 in Madrid). */
export const STALE_MS = 6 * 3_600_000;

/** Currencies the ECB publishes, used as options until the first table arrives. */
export const KNOWN_CODES = [
  'AUD',
  'BGN',
  'BRL',
  'CAD',
  'CHF',
  'CNY',
  'CZK',
  'DKK',
  'EUR',
  'GBP',
  'HKD',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'ISK',
  'JPY',
  'KRW',
  'MXN',
  'MYR',
  'NOK',
  'NZD',
  'PHP',
  'PLN',
  'RON',
  'SEK',
  'SGD',
  'THB',
  'TRY',
  'USD',
  'ZAR',
];

export interface Rates {
  /** YYYY-MM-DD of the ECB publication. */
  date: string;
  /** Units of each currency per 1 EUR. Always includes EUR: 1. */
  rates: Record<string, number>;
}

export interface CachedRates extends Rates {
  fetchedAt: number;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const CODE = /^[A-Z]{3}$/;

/** Validates the API response. Anything unexpected is null and is treated as offline. */
export function parseRatesResponse(json: unknown): Rates | null {
  if (typeof json !== 'object' || json === null) return null;
  const { base, date, rates } = json as Record<string, unknown>;
  if (base !== 'EUR' || typeof date !== 'string' || !DATE.test(date)) return null;
  if (typeof rates !== 'object' || rates === null || Array.isArray(rates)) return null;
  const out: Record<string, number> = { EUR: 1 };
  for (const [code, v] of Object.entries(rates)) {
    if (!CODE.test(code) || typeof v !== 'number' || !Number.isFinite(v) || v <= 0) return null;
    out[code] = v;
  }
  return { date, rates: out };
}

/** Reads what `writeJSON(CACHE_KEY, …)` stored, or null if it is missing or damaged. */
export function parseCache(value: unknown): CachedRates | null {
  if (typeof value !== 'object' || value === null) return null;
  const { date, rates, fetchedAt } = value as Record<string, unknown>;
  if (typeof fetchedAt !== 'number' || !Number.isFinite(fetchedAt)) return null;
  const parsed = parseRatesResponse({ base: 'EUR', date, rates });
  return parsed ? { ...parsed, fetchedAt } : null;
}

export function isStale(fetchedAt: number, now: number): boolean {
  return now - fetchedAt > STALE_MS;
}

/** `amount / rates[from] × rates[to]`; null when a currency is not in the table. */
export function convert(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number | null {
  const a = rates[from];
  const b = rates[to];
  if (a === undefined || b === undefined) return null;
  if (from === to) return amount;
  return (amount / a) * b;
}

/** 6 significant digits, for "1 USD = 0.853 EUR". */
export function significant(n: number, digits = 6): number {
  return Number(n.toPrecision(digits));
}

/** Codes sorted alphabetically, EUR included. */
export function codesOf(rates: Record<string, number>): string[] {
  return Object.keys(rates).sort();
}

/** "2026-09-25" → "25/09/2026" (es) or "09/25/2026" (en). */
export function formatRatesDate(date: string, locale: 'es' | 'en'): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
