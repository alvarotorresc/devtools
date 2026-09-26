import { describe, expect, it } from 'vitest';
import { PROVINCES } from '../../lib/provinces';
import { seededRng } from '../../lib/random';
import { generatePostalCode, lookupPostalCode, postalRange } from './logic';

describe('lookupPostalCode', () => {
  it('finds the province from the first two digits', () => {
    const r = lookupPostalCode('28013');
    expect(r).toMatchObject({ ok: true, code: '28013', padded: false });
    expect(r.ok && r.province.name).toBe('Madrid');
    expect(r.ok && r.province.community).toBe('Comunidad de Madrid');
  });

  it('adds the leading 0 a spreadsheet dropped, and says so', () => {
    const r = lookupPostalCode('8001');
    expect(r).toMatchObject({ ok: true, code: '08001', padded: true });
    expect(r.ok && r.province.capital).toBe('Barcelona');
  });

  it('rejects prefixes 00 and 53–99', () => {
    expect(lookupPostalCode('53001')).toEqual({ ok: false, reason: 'prefix', prefix: '53' });
    expect(lookupPostalCode('00123')).toEqual({ ok: false, reason: 'prefix', prefix: '00' });
    expect(lookupPostalCode('99999')).toEqual({ ok: false, reason: 'prefix', prefix: '99' });
  });

  it('rejects other lengths and characters', () => {
    expect(lookupPostalCode('123')).toEqual({ ok: false, reason: 'length', length: 3 });
    expect(lookupPostalCode('280130')).toEqual({ ok: false, reason: 'length', length: 6 });
    expect(lookupPostalCode('28-013')).toEqual({ ok: false, reason: 'chars' });
    expect(lookupPostalCode(' ')).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('postalRange', () => {
  it('gives the range of a province', () => {
    expect(postalRange('28')).toEqual({ from: '28000', to: '28999' });
    expect(postalRange('08')).toEqual({ from: '08000', to: '08999' });
  });
});

describe('generatePostalCode', () => {
  it('round-trip: 1 000 codes with seed "test" match their province', () => {
    const rng = seededRng('test');
    for (let i = 0; i < 1000; i++) {
      const p = PROVINCES[i % PROVINCES.length];
      const code = generatePostalCode(rng, p.code);
      expect(code).toMatch(new RegExp(`^${p.code}00[1-9]$`));
      const r = lookupPostalCode(code);
      expect(r.ok && r.province.code, code).toBe(p.code);
    }
  });
});
