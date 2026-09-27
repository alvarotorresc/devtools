import { describe, expect, it } from 'vitest';
import { cssSnippet, fmt, parseCssNumber, pxToRem, remToPx, sizeTable } from './logic';

describe('px ↔ rem', () => {
  it('divides by the base size', () => {
    expect(fmt(pxToRem(24, 16))).toBe('1.5');
    expect(fmt(pxToRem(24, 10))).toBe('2.4');
    expect(fmt(pxToRem(14, 16))).toBe('0.875');
    expect(remToPx(0.875, 16)).toBe(14);
    expect(remToPx(1.5, 16)).toBe(24);
  });

  it('keeps 4 decimals at most, with a dot and no trailing zeros', () => {
    expect(fmt(1 / 3)).toBe('0.3333');
    expect(fmt(1.5)).toBe('1.5');
    expect(fmt(2)).toBe('2');
    expect(fmt(0.0625)).toBe('0.0625');
  });

  it('builds the CSS snippet', () => {
    expect(cssSnippet(24, 16)).toBe('font-size: 1.5rem; /* 24px */');
    expect(cssSnippet(14, 16)).toBe('font-size: 0.875rem; /* 14px */');
  });

  it('lists the common sizes for the current base', () => {
    const table = sizeTable(16);
    expect(table).toHaveLength(11);
    expect(table[0]).toEqual({ px: 10, rem: '0.625' });
    expect(table.find((r) => r.px === 64)).toEqual({ px: 64, rem: '4' });
    expect(sizeTable(10)[0]).toEqual({ px: 10, rem: '1' });
  });
});

describe('parseCssNumber', () => {
  it('reads a dot or a comma as the decimal mark, never as thousands', () => {
    expect(parseCssNumber('0.875')).toBe(0.875);
    expect(parseCssNumber('0,875')).toBe(0.875);
    expect(parseCssNumber('1,125')).toBe(1.125);
    expect(parseCssNumber('1.125')).toBe(1.125);
    expect(parseCssNumber(' 24 ')).toBe(24);
  });

  it('rejects text that is not a number', () => {
    expect(parseCssNumber('')).toBeNull();
    expect(parseCssNumber('16px')).toBeNull();
    expect(parseCssNumber('abc')).toBeNull();
  });
});
