import { compactId, dniLetter } from '../../lib/ids';
import { digits, pick, randInt, type Rng } from '../../lib/random';

export type DniKind = 'dni' | 'nie';

export type DniReason =
  | 'empty'
  | 'format'
  | 'fewDigits'
  | 'manyDigits'
  | 'missingLetter'
  | 'forbiddenLetter'
  | 'wrongLetter'
  | 'nieDigits'
  | 'niePrefix'
  | 'cif';

export type DniResult =
  | {
      ok: true;
      kind: DniKind;
      /** `12345678Z` or `X1234567L`. */
      normalized: string;
      /** The 8 digits the letter is computed from (X/Y/Z already replaced by 0/1/2). */
      number: string;
      letter: string;
      /** True when a 7-digit DNI was padded with a leading zero. */
      padded: boolean;
    }
  | {
      ok: false;
      reason: DniReason;
      kind?: DniKind;
      /** The digits as typed (for `wrongLetter` and `missingLetter`). */
      number?: string;
      /** The letter that would be correct. */
      expected?: string;
      /** The letter that was typed (for `forbiddenLetter`). */
      letter?: string;
    };

export type LetterResult =
  | { ok: true; kind: DniKind; letter: string; full: string }
  | { ok: false; reason: 'empty' | 'format' };

const NIE_PREFIX: Record<string, string> = { X: '0', Y: '1', Z: '2' };
const FORBIDDEN = /^[IÑOU]$/;

function letterFor(prefix: string, body: string): string {
  return dniLetter(Number((NIE_PREFIX[prefix] ?? '') + body));
}

export function validateDni(raw: string): DniResult {
  const s = compactId(raw);
  if (!s) return { ok: false, reason: 'empty' };
  if (/^[KLM]/.test(s)) return { ok: false, reason: 'cif' };

  if (/^[XYZ]/.test(s)) {
    const m = /^([XYZ])(\d+)([A-ZÑ])$/.exec(s);
    if (!m) return { ok: false, reason: 'format', kind: 'nie' };
    const [, prefix, body, letter] = m;
    if (body.length !== 7) return { ok: false, reason: 'nieDigits', kind: 'nie' };
    const expected = letterFor(prefix, body);
    if (FORBIDDEN.test(letter))
      return { ok: false, reason: 'forbiddenLetter', kind: 'nie', letter };
    if (letter !== expected) {
      return { ok: false, reason: 'wrongLetter', kind: 'nie', number: prefix + body, expected };
    }
    return {
      ok: true,
      kind: 'nie',
      normalized: prefix + body + letter,
      number: NIE_PREFIX[prefix] + body,
      letter,
      padded: false,
    };
  }

  if (/^[A-ZÑ]/.test(s)) return { ok: false, reason: 'niePrefix', kind: 'nie' };

  if (/^\d+$/.test(s)) {
    if (s.length > 8) return { ok: false, reason: 'manyDigits', kind: 'dni' };
    if (s.length < 7) return { ok: false, reason: 'fewDigits', kind: 'dni' };
    const number = s.padStart(8, '0');
    return {
      ok: false,
      reason: 'missingLetter',
      kind: 'dni',
      number,
      expected: letterFor('', number),
    };
  }

  const m = /^(\d+)([A-ZÑ])$/.exec(s);
  if (!m) return { ok: false, reason: 'format', kind: 'dni' };
  const [, body, letter] = m;
  if (body.length > 8) return { ok: false, reason: 'manyDigits', kind: 'dni' };
  if (body.length < 7) return { ok: false, reason: 'fewDigits', kind: 'dni' };
  const number = body.padStart(8, '0');
  const expected = letterFor('', number);
  if (FORBIDDEN.test(letter)) return { ok: false, reason: 'forbiddenLetter', kind: 'dni', letter };
  if (letter !== expected)
    return { ok: false, reason: 'wrongLetter', kind: 'dni', number, expected };
  return {
    ok: true,
    kind: 'dni',
    normalized: number + letter,
    number,
    letter,
    padded: body.length < 8,
  };
}

/** "Calcular letra": 8 digits, or X/Y/Z + 7 digits. */
export function calcLetter(raw: string): LetterResult {
  const s = compactId(raw);
  if (!s) return { ok: false, reason: 'empty' };
  const nie = /^([XYZ])(\d{7})$/.exec(s);
  if (nie) {
    const letter = letterFor(nie[1], nie[2]);
    return { ok: true, kind: 'nie', letter, full: s + letter };
  }
  if (/^\d{8}$/.test(s)) {
    const letter = letterFor('', s);
    return { ok: true, kind: 'dni', letter, full: s + letter };
  }
  return { ok: false, reason: 'format' };
}

/** `12345678Z` → `12345678-Z`, `X1234567L` → `X1234567-L`. */
export function withDash(id: string): string {
  return `${id.slice(0, -1)}-${id.slice(-1)}`;
}

export function generateDni(rng: Rng): string {
  const number = String(randInt(rng, 0, 99_999_999)).padStart(8, '0');
  return number + letterFor('', number);
}

/** X, Y and Z come out equally often. */
export function generateNie(rng: Rng): string {
  const prefix = pick(rng, ['X', 'Y', 'Z']);
  const body = digits(rng, 7);
  return prefix + body + letterFor(prefix, body);
}
