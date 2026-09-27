import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import { generateNss, nssControl, validateNss } from './logic';

describe('nssControl: the two branches', () => {
  it('matches the published example 28 12345678 40 (second branch)', () => {
    expect(nssControl(28, 12_345_678)).toBe('40');
  });

  it('uses b + a × 10^7 when b < 10 000 000 (08 01234567 74, not 17)', () => {
    expect(nssControl(8, 1_234_567)).toBe('74');
    // The brief's single formula a × 10^8 + b would give 17: this pins the first branch.
    expect(String((8 * 100_000_000 + 1_234_567) % 97)).toBe('17');
  });

  it('switches branch exactly between 9 999 999 and 10 000 000', () => {
    // 9 999 999 + 28 × 10^7 = 289 999 999 → mod 97 = 69
    expect(nssControl(28, 9_999_999)).toBe('69');
    // 28 × 10^8 + 10 000 000 = 2 810 000 000 → mod 97 = 16
    expect(nssControl(28, 10_000_000)).toBe('16');
  });
});

describe('validateNss', () => {
  it('accepts separators and shows the province', () => {
    for (const n of ['28/12345678/40', '28 12345678 40', '281234567840', '28-12345678-40']) {
      const r = validateNss(n);
      expect(r).toMatchObject({
        ok: true,
        normalized: '281234567840',
        formatted: '28/12345678/40',
      });
      expect(r.ok && r.province?.name).toBe('Madrid');
    }
    expect(validateNss('08 01234567 74')).toMatchObject({ ok: true, provinceCode: '08' });
  });

  it('says what the control should be', () => {
    expect(validateNss('281234567841')).toEqual({ ok: false, reason: 'control', expected: '40' });
    expect(validateNss('080123456717')).toEqual({ ok: false, reason: 'control', expected: '74' });
  });

  it('accepts unknown province codes, which the page shows as a warning', () => {
    const b = 12_345_678;
    const r = validateNss(`66${b}${nssControl(66, b)}`);
    expect(r).toMatchObject({ ok: true, provinceCode: '66', province: undefined });
  });

  it('reports missing, extra and non-digit characters', () => {
    expect(validateNss('28123456784')).toEqual({ ok: false, reason: 'fewDigits', length: 11 });
    expect(validateNss('2812345678400')).toEqual({ ok: false, reason: 'manyDigits', length: 13 });
    expect(validateNss('28A234567840')).toEqual({ ok: false, reason: 'chars' });
    expect(validateNss('  ')).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('generateNss', () => {
  it('round-trip: 1 000 values with seed "test" are all valid and hit both branches', () => {
    const rng = seededRng('test');
    let low = 0;
    for (let i = 0; i < 1000; i++) {
      const nss = generateNss(rng);
      expect(nss).toMatch(/^\d{12}$/);
      const r = validateNss(nss);
      expect(r.ok, nss).toBe(true);
      expect(r.ok && r.province).toBeTruthy();
      if (Number(nss.slice(2, 10)) < 10_000_000) low++;
    }
    expect(low).toBeGreaterThan(50);
  });

  it('uses the chosen province', () => {
    const rng = seededRng('prov');
    for (let i = 0; i < 20; i++) expect(generateNss(rng, '46').slice(0, 2)).toBe('46');
  });
});
