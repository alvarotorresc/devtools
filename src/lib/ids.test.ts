import { describe, expect, it } from 'vitest';
import {
  DEFAULT_QUANTITY,
  DNI_LETTERS,
  MAX_QUANTITY,
  clampQuantity,
  compactId,
  dniLetter,
  repeat,
  splitLines,
} from './ids';

describe('dniLetter', () => {
  it('uses the official table of 23 letters, without I, Ñ, O or U', () => {
    expect(DNI_LETTERS).toHaveLength(23);
    expect(DNI_LETTERS).not.toMatch(/[IÑOU]/);
    expect(dniLetter(12345678)).toBe('Z');
    expect(dniLetter(0)).toBe('T');
    expect(dniLetter(22)).toBe('E');
    expect(dniLetter(23)).toBe('T');
  });
});

describe('compactId', () => {
  it('upper-cases and drops spaces, dashes, dots and slashes', () => {
    expect(compactId(' 12.345.678-z ')).toBe('12345678Z');
    expect(compactId('28/12345678/40')).toBe('281234567840');
    expect(compactId('es91 2100\t0418')).toBe('ES9121000418');
  });
});

describe('splitLines', () => {
  it('keeps non-empty trimmed lines, whatever the line break', () => {
    expect(splitLines(' a \r\n\nb\rc\n  \n')).toEqual({ lines: ['a', 'b', 'c'], truncated: false });
    expect(splitLines('')).toEqual({ lines: [], truncated: false });
  });

  it('stops at the limit and says so', () => {
    const text = Array.from({ length: 1005 }, (_, i) => String(i)).join('\n');
    const r = splitLines(text);
    expect(r.lines).toHaveLength(1000);
    expect(r.truncated).toBe(true);
    expect(splitLines('a\nb\nc', 2)).toEqual({ lines: ['a', 'b'], truncated: true });
  });
});

describe('quantities', () => {
  it('clamps to 1–500 and falls back to the default', () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(9.7)).toBe(9);
    expect(clampQuantity(10_000)).toBe(MAX_QUANTITY);
    expect(clampQuantity(Number.NaN)).toBe(DEFAULT_QUANTITY);
  });

  it('repeats a maker the clamped number of times', () => {
    let i = 0;
    expect(repeat(3, () => i++)).toEqual([0, 1, 2]);
    expect(repeat(0, () => 'x')).toEqual(['x']);
  });
});
