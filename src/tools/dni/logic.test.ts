import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import { calcLetter, generateDni, generateNie, validateDni, withDash } from './logic';

describe('validateDni: checked examples', () => {
  it('accepts the documented DNI and NIE', () => {
    for (const id of ['12345678Z', '00000000T', 'X1234567L', 'Y1234567X', 'Z1234567R']) {
      expect(validateDni(id).ok, id).toBe(true);
    }
  });

  it('computes the letter from n mod 23 (12345678 mod 23 = 14 → Z)', () => {
    expect(validateDni('12345678Z')).toEqual({
      ok: true,
      kind: 'dni',
      normalized: '12345678Z',
      number: '12345678',
      letter: 'Z',
      padded: false,
    });
  });

  it('replaces X, Y and Z by 0, 1 and 2 in a NIE', () => {
    expect(validateDni('Y1234567X')).toMatchObject({ ok: true, kind: 'nie', number: '11234567' });
  });

  it('normalizes case, spaces, dots and dashes', () => {
    expect(validateDni(' 12.345.678-z ')).toMatchObject({ ok: true, normalized: '12345678Z' });
    expect(validateDni('x-1234567-l')).toMatchObject({ ok: true, normalized: 'X1234567L' });
  });
});

describe('validateDni: errors', () => {
  it('says which letter is right', () => {
    expect(validateDni('12345678A')).toEqual({
      ok: false,
      reason: 'wrongLetter',
      kind: 'dni',
      number: '12345678',
      expected: 'Z',
    });
    expect(validateDni('X1234567A')).toMatchObject({ reason: 'wrongLetter', expected: 'L' });
  });

  it('rejects I, Ñ, O and U, which the DNI never uses', () => {
    for (const l of ['I', 'Ñ', 'O', 'U']) {
      expect(validateDni(`12345678${l}`)).toMatchObject({ reason: 'forbiddenLetter', letter: l });
    }
    expect(validateDni('12345678ñ')).toMatchObject({ reason: 'forbiddenLetter', letter: 'Ñ' });
  });

  it('pads a 7-digit DNI with a leading zero and says so', () => {
    expect(validateDni('1234567L')).toMatchObject({
      ok: true,
      normalized: '01234567L',
      padded: true,
    });
  });

  it('reports missing and extra digits', () => {
    expect(validateDni('123456Z')).toMatchObject({ reason: 'fewDigits' });
    expect(validateDni('123456789Z')).toMatchObject({ reason: 'manyDigits' });
  });

  it('offers the letter when it is missing', () => {
    expect(validateDni('12345678')).toMatchObject({ reason: 'missingLetter', expected: 'Z' });
  });

  it('checks the NIE shape', () => {
    expect(validateDni('X12345678L')).toMatchObject({ reason: 'nieDigits' });
    expect(validateDni('A1234567L')).toMatchObject({ reason: 'niePrefix' });
    expect(validateDni('X12A4567L')).toMatchObject({ reason: 'format' });
  });

  it('sends K, L and M NIF to the CIF validator', () => {
    expect(validateDni('K1234567L')).toEqual({ ok: false, reason: 'cif' });
    expect(validateDni('M1234567L')).toEqual({ ok: false, reason: 'cif' });
  });

  it('accepts 00000000T, which is valid on paper', () => {
    expect(validateDni('00000000T').ok).toBe(true);
    expect(validateDni('')).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('calcLetter', () => {
  it('works for 8 digits and for X/Y/Z + 7 digits', () => {
    expect(calcLetter('12345678')).toEqual({
      ok: true,
      kind: 'dni',
      letter: 'Z',
      full: '12345678Z',
    });
    expect(calcLetter('z 1234567')).toEqual({
      ok: true,
      kind: 'nie',
      letter: 'R',
      full: 'Z1234567R',
    });
    expect(calcLetter('1234567')).toEqual({ ok: false, reason: 'format' });
    expect(calcLetter(' ')).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('generators', () => {
  it('round-trip: 1 000 DNI and 1 000 NIE with seed "test" are all valid', () => {
    const rng = seededRng('test');
    for (let i = 0; i < 1000; i++) {
      const dni = generateDni(rng);
      expect(dni).toMatch(/^\d{8}[A-Z]$/);
      expect(validateDni(dni).ok, dni).toBe(true);
      const nie = generateNie(rng);
      expect(nie).toMatch(/^[XYZ]\d{7}[A-Z]$/);
      expect(validateDni(nie).ok, nie).toBe(true);
    }
  });

  it('spreads X, Y and Z evenly', () => {
    const rng = seededRng('spread');
    const counts: Record<string, number> = { X: 0, Y: 0, Z: 0 };
    for (let i = 0; i < 3000; i++) counts[generateNie(rng)[0]]++;
    for (const c of Object.values(counts)) expect(c).toBeGreaterThan(850);
  });

  it('is deterministic with a seed', () => {
    expect(generateDni(seededRng('demo'))).toBe(generateDni(seededRng('demo')));
  });

  it('adds the dash before the letter', () => {
    expect(withDash('12345678Z')).toBe('12345678-Z');
    expect(withDash('X1234567L')).toBe('X1234567-L');
  });
});
