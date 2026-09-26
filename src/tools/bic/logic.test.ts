import { describe, expect, it } from 'vitest';
import { COUNTRIES, validateBic } from './logic';

describe('COUNTRIES', () => {
  it('has the 249 ISO 3166-1 codes plus XK', () => {
    expect(COUNTRIES.size).toBe(250);
    expect(COUNTRIES.has('XK')).toBe(true);
    expect(COUNTRIES.has('ES')).toBe(true);
    expect(COUNTRIES.has('AN')).toBe(false);
    expect(COUNTRIES.has('YU')).toBe(false);
  });
});

describe('validateBic', () => {
  it('treats CAIXESBBXXX and CAIXESBB as the same head office', () => {
    const long = validateBic('caixesbbxxx');
    expect(long).toEqual({
      ok: true,
      bank: 'CAIX',
      country: 'ES',
      location: 'BB',
      branch: null,
      bic8: 'CAIXESBB',
      bic11: 'CAIXESBBXXX',
      test: false,
    });
    expect(validateBic('CAIXESBB')).toEqual(long);
  });

  it('keeps a real branch code', () => {
    expect(validateBic('DEUT DE FF 500')).toMatchObject({
      ok: true,
      branch: '500',
      bic8: 'DEUTDEFF',
      bic11: 'DEUTDEFF500',
    });
  });

  it('flags test BICs (0 as the second location character)', () => {
    expect(validateBic('NEDSZAJ0')).toMatchObject({ ok: true, test: true });
  });

  it('explains what is wrong', () => {
    expect(validateBic('CAIXESBBX')).toEqual({ ok: false, reason: 'length', length: 9 });
    expect(validateBic('CAIXESBBXX')).toEqual({ ok: false, reason: 'length', length: 10 });
    expect(validateBic('CAIXXXBB')).toEqual({ ok: false, reason: 'country', country: 'XX' });
    expect(validateBic('CA1XESBB')).toEqual({ ok: false, reason: 'bank' });
    expect(validateBic('CAIXESB_')).toEqual({ ok: false, reason: 'format' });
    expect(validateBic('')).toEqual({ ok: false, reason: 'empty' });
  });
});
