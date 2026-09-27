import { describe, expect, it } from 'vitest';
import { formatMoney, formatNumber, parseDecimal, roundCents } from './numbers';

const NBSP = String.fromCharCode(0xa0);
const NNBSP = String.fromCharCode(0x202f);

// Intl uses U+00A0 or U+202F before "€" depending on the ICU version: compare with plain spaces.
const plain = (s: string) => s.replace(/\s/g, ' ');

describe('parseDecimal', () => {
  it('reads a single comma or dot as the decimal mark', () => {
    expect(parseDecimal('1,5', 'es')).toBe(1.5);
    expect(parseDecimal('1.5', 'es')).toBe(1.5);
    expect(parseDecimal('1,5', 'en')).toBe(1.5);
    expect(parseDecimal('1.5', 'en')).toBe(1.5);
    expect(parseDecimal('0,875', 'es')).toBe(0.875);
  });

  it('groups thousands with the locale separator followed by exactly 3 digits', () => {
    expect(parseDecimal('1.234', 'es')).toBe(1234);
    expect(parseDecimal('1.234', 'en')).toBe(1.234);
    expect(parseDecimal('1,234', 'en')).toBe(1234);
    expect(parseDecimal('1,234', 'es')).toBe(1.234);
    expect(parseDecimal('1.2345', 'es')).toBe(1.2345);
  });

  it('uses the last mark as decimal when both appear', () => {
    expect(parseDecimal('1.234,56', 'es')).toBe(1234.56);
    expect(parseDecimal('1.234,56', 'en')).toBe(1234.56);
    expect(parseDecimal('1,234.56', 'es')).toBe(1234.56);
    expect(parseDecimal('1,234,567.8', 'en')).toBe(1234567.8);
  });

  it('treats a repeated mark as a thousands separator', () => {
    expect(parseDecimal('1.000.000', 'es')).toBe(1_000_000);
    expect(parseDecimal('1,000,000', 'es')).toBe(1_000_000);
  });

  it('accepts signs, exponents and every kind of space', () => {
    expect(parseDecimal('-2,5', 'es')).toBe(-2.5);
    expect(parseDecimal('1e3', 'es')).toBe(1000);
    expect(parseDecimal('1.5e-3', 'en')).toBe(0.0015);
    expect(parseDecimal(` 1${NBSP}234,5 `, 'es')).toBe(1234.5);
    expect(parseDecimal(`1${NNBSP}234`, 'en')).toBe(1234);
  });

  it('returns null for text that is not a finite number', () => {
    expect(parseDecimal('', 'es')).toBeNull();
    expect(parseDecimal('   ', 'es')).toBeNull();
    expect(parseDecimal('abc', 'es')).toBeNull();
    expect(parseDecimal('12abc', 'en')).toBeNull();
    expect(parseDecimal('-', 'es')).toBeNull();
    expect(parseDecimal('1e999', 'en')).toBeNull();
  });
});

describe('formatNumber', () => {
  it('groups and localizes', () => {
    expect(formatNumber(1234.5, 'en')).toBe('1,234.5');
    expect(formatNumber(12345.5, 'es')).toBe('12.345,5');
    expect(formatNumber(0.1 + 0.2, 'en', 4)).toBe('0.3');
  });

  it('switches to scientific notation for huge and tiny values', () => {
    expect(formatNumber(1e15, 'en')).toBe('1E15');
    expect(formatNumber(2.5e-7, 'es')).toBe('2,5E-7');
    expect(formatNumber(0, 'en')).toBe('0');
  });
});

describe('formatMoney', () => {
  it('formats euros in both languages', () => {
    expect(plain(formatMoney(1234.5, 'es'))).toBe('1234,50 €');
    expect(plain(formatMoney(12345.5, 'es'))).toBe('12.345,50 €');
    expect(formatMoney(1234.5, 'en')).toBe('€1,234.50');
  });

  it('uses the decimals of each currency', () => {
    expect(formatMoney(1234.5, 'en', 'JPY')).toBe('¥1,235');
  });
});

describe('roundCents', () => {
  it('rounds halves away from zero despite floating point', () => {
    expect(roundCents(1.005)).toBe(1.01);
    expect(roundCents(2.675)).toBe(2.68);
    expect(roundCents(0.125)).toBe(0.13);
    expect(roundCents(-1.005)).toBe(-1.01);
    expect(roundCents(17.355)).toBe(17.36);
    expect(roundCents(0)).toBe(0);
  });
});
