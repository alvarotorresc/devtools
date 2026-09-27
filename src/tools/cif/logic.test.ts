import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import {
  CIF_TYPES,
  CONTROL,
  cifControl,
  generateCif,
  isPersonalNif,
  shouldRememberCif,
  validateCif,
} from './logic';

describe('cifControl', () => {
  it('computes e = (10 − (A + B) mod 10) mod 10 and its letter JABCDEFGHI[e]', () => {
    expect(cifControl('6541001')).toEqual({ e: 1, digit: '1', letter: 'A' });
    expect(cifControl('2826000')).toEqual({ e: 8, digit: '8', letter: 'H' });
    expect(cifControl('0000000')).toEqual({ e: 0, digit: '0', letter: 'J' });
  });
});

describe('validateCif: checked examples', () => {
  it('accepts the documented CIF', () => {
    for (const cif of [
      'A58818501',
      'B65410011',
      'Q2826000H',
      'P0800000B',
      'S2800568D',
      'B84948736',
    ]) {
      expect(validateCif(cif).ok, cif).toBe(true);
    }
  });

  it('returns the type and both forms of the control', () => {
    expect(validateCif('b-65410011')).toEqual({
      ok: true,
      kind: 'entity',
      type: 'B',
      normalized: 'B65410011',
      digit: '1',
      letter: 'A',
      accepts: 'digit',
    });
  });

  it('accepts either form where the sources disagree (C, D, F, G, J, R, U, V)', () => {
    const f = generateCif(seededRng('either'), 'F');
    const c = cifControl(f.slice(1, 8));
    expect(validateCif(`F${f.slice(1, 8)}${c.digit}`).ok).toBe(true);
    expect(validateCif(`F${f.slice(1, 8)}${c.letter}`).ok).toBe(true);
  });

  it('has 17 entity types and the strict ones the spec lists', () => {
    expect(CIF_TYPES).toHaveLength(17);
    for (const t of ['A', 'B', 'E', 'H'] as const) expect(CONTROL[t]).toBe('digit');
    for (const t of ['N', 'P', 'Q', 'S', 'W'] as const) expect(CONTROL[t]).toBe('letter');
  });
});

describe('validateCif: errors', () => {
  it('says which control is right', () => {
    expect(validateCif('B65410012')).toEqual({
      ok: false,
      reason: 'control',
      type: 'B',
      body: 'B6541001',
      expected: '1',
      accepts: 'digit',
    });
  });

  it('demands a letter from N, P, Q, S and W', () => {
    expect(validateCif('P08000002')).toMatchObject({ reason: 'needsLetter', expected: 'B' });
  });

  it('demands a digit from A, B, E and H: B00000000 is valid, B0000000J is not', () => {
    expect(validateCif('B00000000').ok).toBe(true);
    expect(validateCif('B0000000J')).toMatchObject({ reason: 'needsDigit', expected: '0' });
  });

  it('rejects letters that are not an entity type', () => {
    expect(validateCif('I12345678')).toEqual({ ok: false, reason: 'type', type: 'I' });
    expect(validateCif('12345678Z')).toEqual({ ok: false, reason: 'digitFirst' });
  });

  it('gives an NIE the same redirect hint as a DNI', () => {
    expect(validateCif('X1234567L')).toEqual({ ok: false, reason: 'digitFirst' });
    expect(validateCif('Y1234567X')).toEqual({ ok: false, reason: 'digitFirst' });
    expect(validateCif('Z1234567R')).toEqual({ ok: false, reason: 'digitFirst' });
  });

  it('says the control is missing on 8 characters', () => {
    expect(validateCif('B6541001')).toMatchObject({ reason: 'missingControl', expected: '1' });
    expect(validateCif('Q2826000')).toMatchObject({ reason: 'missingControl', expected: 'H' });
  });

  it('rejects other shapes', () => {
    expect(validateCif('B654100')).toMatchObject({ reason: 'format' });
    expect(validateCif('B6541001K')).toMatchObject({ reason: 'format' });
    expect(validateCif('')).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('K, L and M: tax IDs of people', () => {
  it('validates them with the DNI table over the 7 digits', () => {
    // 1234567 mod 23 = 19 → L
    expect(validateCif('K1234567L')).toEqual({
      ok: true,
      kind: 'person',
      prefix: 'K',
      normalized: 'K1234567L',
      letter: 'L',
    });
    expect(validateCif('M1234567A')).toMatchObject({ reason: 'control', expected: 'L' });
  });

  it('is never remembered: shouldSave refuses any line with a K, L or M NIF', () => {
    expect(isPersonalNif('l1234567l')).toBe(true);
    expect(isPersonalNif('B65410011')).toBe(false);
    expect(shouldRememberCif('B65410011\nA58818501')).toBe(true);
    expect(shouldRememberCif('B65410011\n k-1234567-l')).toBe(false);
    expect(shouldRememberCif('M12')).toBe(false);
  });
});

describe('shouldRememberCif: a pasted DNI or NIE is not remembered either', () => {
  it('refuses a line that looks like a DNI', () => {
    expect(shouldRememberCif('12345678Z')).toBe(false);
  });

  it('refuses a line that looks like an NIE', () => {
    expect(shouldRememberCif('X1234567L')).toBe(false);
  });

  it('refuses the whole input when one line is a valid CIF and another a DNI', () => {
    expect(shouldRememberCif('B65410011\n12.345.678-Z')).toBe(false);
  });

  it('still remembers input made only of CIFs', () => {
    expect(shouldRememberCif('B65410011\nA58818501')).toBe(true);
  });

  it('refuses a malformed or partial DNI/NIE too: it matches on the prefix, like K, L and M', () => {
    expect(shouldRememberCif('1234567Z')).toBe(false); // DNI missing its leading zero
    expect(shouldRememberCif('X12345678L')).toBe(false); // NIE with one digit too many
    expect(shouldRememberCif('X12')).toBe(false); // still being typed
  });

  it('checks past the validator’s 1000-line display cap: a DNI on line 1001 still blocks saving', () => {
    const lines = Array.from({ length: 1000 }, () => 'B65410011');
    expect(shouldRememberCif(lines.join('\n'))).toBe(true);
    expect(shouldRememberCif([...lines, '12345678Z'].join('\n'))).toBe(false);
  });
});

describe('generateCif', () => {
  it('round-trip: 1 000 values with seed "test" are all valid', () => {
    const rng = seededRng('test');
    for (let i = 0; i < 1000; i++) {
      const cif = generateCif(rng);
      expect(validateCif(cif).ok, cif).toBe(true);
    }
  });

  it('only makes A and B without a type, about half each', () => {
    const rng = seededRng('ab');
    const all = Array.from({ length: 2000 }, () => generateCif(rng)[0]);
    expect(new Set(all)).toEqual(new Set(['A', 'B']));
    expect(all.filter((t) => t === 'A').length).toBeGreaterThan(900);
  });

  it('emits the canonical control for every type', () => {
    const rng = seededRng('types');
    for (const t of CIF_TYPES) {
      for (let i = 0; i < 50; i++) {
        const cif = generateCif(rng, t);
        expect(cif[0]).toBe(t);
        expect(validateCif(cif).ok, cif).toBe(true);
        const letterForm = ['N', 'P', 'Q', 'R', 'S', 'W'].includes(t);
        expect(/[A-J]$/.test(cif), cif).toBe(letterForm);
      }
    }
  });
});
