import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import {
  CURRENT_TOTAL,
  PLATE_LETTERS,
  generateOldPlate,
  generatePlate,
  platePosition,
  validatePlate,
} from './logic';

describe('current plates (since 2000)', () => {
  it('uses 20 consonants: no vowels, no Ñ, no Q', () => {
    expect(PLATE_LETTERS).toHaveLength(20);
    expect(PLATE_LETTERS).not.toMatch(/[AEIOUÑQ]/);
  });

  it('accepts a space, a dash or nothing, and normalizes to "1234 BCD"', () => {
    for (const p of ['1234 BCD', '1234-BCD', '1234bcd', ' 1234 - bcd ']) {
      expect(validatePlate(p)).toMatchObject({
        ok: true,
        format: 'current',
        normalized: '1234 BCD',
      });
    }
  });

  it('gives the position in the series', () => {
    expect(validatePlate('0000 BBB')).toMatchObject({ ok: true, position: 1 });
    expect(validatePlate('9999 ZZZ')).toMatchObject({ ok: true, position: CURRENT_TOTAL });
    // ((0 × 20 + 1) × 20 + 2) × 10 000 + 1234 + 1
    expect(platePosition('1234', 'BCD')).toBe(221_235);
  });

  it('says which letter is not allowed', () => {
    expect(validatePlate('1234 BCA')).toEqual({ ok: false, reason: 'letter', char: 'A' });
    expect(validatePlate('1234 BQD')).toEqual({ ok: false, reason: 'letter', char: 'Q' });
    expect(validatePlate('1234 ÑBC')).toEqual({ ok: false, reason: 'letter', char: 'Ñ' });
  });

  it('rejects other shapes', () => {
    expect(validatePlate('123 BCD')).toEqual({ ok: false, reason: 'format' });
    expect(validatePlate('1234 BC')).toEqual({ ok: false, reason: 'format' });
    expect(validatePlate('')).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('old provincial plates (1971–2000)', () => {
  it('accepts one or two letters at the end and shows the province', () => {
    const r = validatePlate('M-1234-AB');
    expect(r).toMatchObject({ ok: true, format: 'old', normalized: 'M-1234-AB', prefix: 'M' });
    expect(r.ok && r.format === 'old' && r.province.name).toBe('Madrid');
    expect(validatePlate('gi 5678 z')).toMatchObject({ ok: true, normalized: 'GI-5678-Z' });
    expect(validatePlate('PM-0001-A')).toMatchObject({ ok: true, prefix: 'PM' });
  });

  it('rejects unknown prefixes', () => {
    expect(validatePlate('XX-1234-AB')).toEqual({ ok: false, reason: 'province', prefix: 'XX' });
  });

  it('rejects Ñ and Q in the old letters', () => {
    expect(validatePlate('M-1234-QA')).toEqual({ ok: false, reason: 'oldLetter', char: 'Q' });
  });

  it('leaves special and pre-1971 plates out of scope', () => {
    expect(validatePlate('C 1234 BCD')).toEqual({ ok: false, reason: 'special' });
    expect(validatePlate('M-123456')).toEqual({ ok: false, reason: 'special' });
  });
});

describe('generators', () => {
  it('round-trip: 1 000 current plates with seed "test" are all valid', () => {
    const rng = seededRng('test');
    for (let i = 0; i < 1000; i++) {
      const plate = generatePlate(rng);
      expect(plate).toMatch(/^\d{4} [BCDFGHJKLMNPRSTVWXYZ]{3}$/);
      expect(validatePlate(plate).ok, plate).toBe(true);
    }
  });

  it('round-trip: 1 000 old plates with seed "test" are all valid, with 1 or 2 letters', () => {
    const rng = seededRng('test');
    const ends = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      const plate = generateOldPlate(rng);
      const r = validatePlate(plate);
      expect(r.ok, plate).toBe(true);
      expect(r.ok && r.normalized).toBe(plate);
      ends.add(plate.split('-')[2].length);
    }
    expect([...ends].sort()).toEqual([1, 2]);
  });
});
