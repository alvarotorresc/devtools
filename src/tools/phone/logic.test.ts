import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import { formatNational, generatePhone, normalizePhone, validatePhone } from './logic';

describe('normalizePhone', () => {
  it('drops separators and the Spanish prefix in its three forms', () => {
    expect(normalizePhone('+34 912 345 678')).toBe('912345678');
    expect(normalizePhone('0034912345678')).toBe('912345678');
    expect(normalizePhone('(91) 234-56-78')).toBe('912345678');
    expect(normalizePhone('34612345678')).toBe('612345678');
    expect(normalizePhone('612.34.56.78')).toBe('612345678');
  });

  it('returns null for other country codes', () => {
    expect(normalizePhone('+33 1 23 45 67 89')).toBeNull();
    expect(normalizePhone('0044 20 7946 0000')).toBeNull();
  });
});

describe('validatePhone', () => {
  it('gives the same result for the same number written three ways', () => {
    const a = validatePhone('+34 912 345 678');
    expect(validatePhone('0034912345678')).toEqual(a);
    expect(validatePhone('(91) 234-56-78')).toEqual(a);
    expect(a).toMatchObject({ ok: true, kind: 'landline' });
  });

  it('returns every format', () => {
    expect(validatePhone('+34 612 34 56 78')).toEqual({
      ok: true,
      kind: 'mobile',
      national: '612345678',
      e164: '+34612345678',
      nationalFormatted: '612 34 56 78',
      international: '+34 612 34 56 78',
      tel: 'tel:+34612345678',
    });
    expect(validatePhone('34612345678')).toMatchObject({ kind: 'mobile' });
  });

  it('classifies in the order of the table', () => {
    const kinds: [string, string][] = [
      ['612345678', 'mobile'],
      ['712345678', 'mobile'],
      ['741234567', 'mobile'],
      ['701234567', 'personal'],
      ['800123456', 'freephone'],
      ['900123456', 'freephone'],
      ['901123456', 'specialRate'],
      ['902123456', 'specialRate'],
      ['803123456', 'premium'],
      ['806123456', 'premium'],
      ['807123456', 'premium'],
      ['905123456', 'premium'],
      ['812345678', 'landline'],
      ['912345678', 'landline'],
      ['981234567', 'landline'],
      ['512345678', 'corporate'],
    ];
    for (const [n, kind] of kinds) expect(validatePhone(n), n).toMatchObject({ ok: true, kind });
  });

  it('rejects what does not fit', () => {
    expect(validatePhone('751234567')).toEqual({ ok: false, reason: 'pattern' });
    expect(validatePhone('991234567')).toEqual({ ok: false, reason: 'pattern' });
    expect(validatePhone('412345678')).toEqual({ ok: false, reason: 'pattern' });
    expect(validatePhone('612 34 56 7')).toEqual({ ok: false, reason: 'fewDigits', length: 8 });
    expect(validatePhone('6123456789')).toEqual({ ok: false, reason: 'manyDigits', length: 10 });
    expect(validatePhone('+33 123456789')).toEqual({ ok: false, reason: 'foreign' });
    expect(validatePhone('612a45678')).toEqual({ ok: false, reason: 'chars' });
    expect(validatePhone('')).toEqual({ ok: false, reason: 'empty' });
  });

  it('recognises short numbers, which have no E.164 form', () => {
    expect(validatePhone('112')).toEqual({ ok: false, reason: 'short', length: 3 });
    expect(validatePhone('016')).toEqual({ ok: false, reason: 'short', length: 3 });
  });

  it('formats as 3-2-2-2', () => {
    expect(formatNational('912345678')).toBe('912 34 56 78');
  });
});

describe('generatePhone', () => {
  it('round-trip: 1 000 mobiles and 1 000 landlines with seed "test" are valid and of that kind', () => {
    const rng = seededRng('test');
    for (let i = 0; i < 1000; i++) {
      const m = generatePhone(rng, 'mobile');
      expect(validatePhone(m), m).toMatchObject({ ok: true, kind: 'mobile' });
      const l = generatePhone(rng, 'landline');
      expect(l).toMatch(/^9[1-8]\d{7}$/);
      expect(validatePhone(l), l).toMatchObject({ ok: true, kind: 'landline' });
    }
  });

  it('makes about 80 % of mobiles start with 6', () => {
    const rng = seededRng('six');
    const six = Array.from({ length: 2000 }, () => generatePhone(rng, 'mobile')).filter((n) =>
      n.startsWith('6'),
    ).length;
    expect(six).toBeGreaterThan(1500);
    expect(six).toBeLessThan(1700);
  });
});
