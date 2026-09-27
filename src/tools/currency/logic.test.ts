import { describe, expect, it } from 'vitest';
import {
  codesOf,
  convert,
  formatRatesDate,
  isStale,
  KNOWN_CODES,
  parseCache,
  parseRatesResponse,
  RATES_URL,
  significant,
  STALE_MS,
} from './logic';

const SAMPLE = { amount: 1, base: 'EUR', date: '2026-09-25', rates: { USD: 1.1, GBP: 0.85 } };

describe('parseRatesResponse', () => {
  it('accepts the Frankfurter table and adds EUR', () => {
    expect(parseRatesResponse(SAMPLE)).toEqual({
      date: '2026-09-25',
      rates: { EUR: 1, USD: 1.1, GBP: 0.85 },
    });
  });

  it('rejects anything with an unexpected shape', () => {
    expect(parseRatesResponse(null)).toBeNull();
    expect(parseRatesResponse('EUR')).toBeNull();
    expect(parseRatesResponse({ ...SAMPLE, base: 'USD' })).toBeNull();
    expect(parseRatesResponse({ ...SAMPLE, date: '25/09/2026' })).toBeNull();
    expect(parseRatesResponse({ ...SAMPLE, rates: [1, 2] })).toBeNull();
    expect(parseRatesResponse({ ...SAMPLE, rates: { USD: '1.1' } })).toBeNull();
    expect(parseRatesResponse({ ...SAMPLE, rates: { USD: -1 } })).toBeNull();
    expect(parseRatesResponse({ ...SAMPLE, rates: { USD: 0 } })).toBeNull();
    expect(parseRatesResponse({ ...SAMPLE, rates: { usd: 1.1 } })).toBeNull();
  });

  it('points at the v1 URL with no query string', () => {
    expect(RATES_URL).toBe('https://api.frankfurter.dev/v1/latest');
  });
});

describe('cache', () => {
  it('reads back what was stored', () => {
    const stored = { date: '2026-09-25', rates: { EUR: 1, USD: 1.1 }, fetchedAt: 1000 };
    expect(parseCache(stored)).toEqual(stored);
  });

  it('ignores damaged entries', () => {
    expect(parseCache(null)).toBeNull();
    expect(parseCache({ date: '2026-09-25', rates: { USD: 1.1 } })).toBeNull();
    expect(parseCache({ date: 'x', rates: { USD: 1.1 }, fetchedAt: 1 })).toBeNull();
  });

  it('goes stale after 6 hours', () => {
    expect(STALE_MS).toBe(21_600_000);
    expect(isStale(0, STALE_MS)).toBe(false);
    expect(isStale(0, STALE_MS + 1)).toBe(true);
    expect(isStale(1000, 1000)).toBe(false);
  });
});

describe('convert', () => {
  const rates = { EUR: 1, USD: 1.1, GBP: 0.85, JPY: 160 };

  it('goes through EUR', () => {
    expect(convert(10, 'EUR', 'USD', rates)).toBeCloseTo(11, 10);
    expect(convert(11, 'USD', 'EUR', rates)).toBeCloseTo(10, 10);
    expect(convert(1, 'GBP', 'USD', rates)).toBeCloseTo(1.294117647, 8);
    expect(convert(1, 'USD', 'JPY', rates)).toBeCloseTo(145.4545454545, 8);
  });

  it('returns the same amount for the same currency', () => {
    expect(convert(123.45, 'USD', 'USD', rates)).toBe(123.45);
  });

  it('returns null for a currency that is not in the table', () => {
    expect(convert(1, 'EUR', 'XAU', rates)).toBeNull();
  });

  it('rounds unit rates to 6 significant digits', () => {
    expect(significant(1 / 1.1)).toBe(0.909091);
    expect(significant(0.85 / 1.1)).toBe(0.772727);
    expect(significant(160 / 1.1)).toBe(145.455);
  });
});

describe('helpers', () => {
  it('sorts codes', () => {
    expect(codesOf({ USD: 1.1, EUR: 1, GBP: 0.85 })).toEqual(['EUR', 'GBP', 'USD']);
    expect(KNOWN_CODES).toContain('EUR');
    expect([...KNOWN_CODES].sort()).toEqual(KNOWN_CODES);
  });

  it('formats the ECB date for each language', () => {
    expect(formatRatesDate('2026-09-25', 'es')).toBe('25/09/2026');
    expect(formatRatesDate('2026-09-25', 'en')).toBe('09/25/2026');
  });
});
