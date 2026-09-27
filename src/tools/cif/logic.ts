import { compactId, dniLetter, splitLines } from '../../lib/ids';
import { digits, pick, type Rng } from '../../lib/random';

export type CifType =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'J'
  | 'N'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'U'
  | 'V'
  | 'W';

/** What the last character may be: only strict where the sources agree (§6.2 of the spec). */
export type ControlKind = 'digit' | 'letter' | 'either';

export const CONTROL: Record<CifType, ControlKind> = {
  A: 'digit',
  B: 'digit',
  C: 'either',
  D: 'either',
  E: 'digit',
  F: 'either',
  G: 'either',
  H: 'digit',
  J: 'either',
  N: 'letter',
  P: 'letter',
  Q: 'letter',
  R: 'either',
  S: 'letter',
  U: 'either',
  V: 'either',
  W: 'letter',
};

export const CIF_TYPES = Object.keys(CONTROL) as CifType[];

/** The generator always emits the canonical form: a letter for these, a digit for the rest. */
const CANONICAL_LETTER = new Set<CifType>(['N', 'P', 'Q', 'R', 'S', 'W']);

export const CIF_LETTERS = 'JABCDEFGHI';

export type CifReason =
  | 'empty'
  | 'digitFirst'
  | 'type'
  | 'format'
  | 'missingControl'
  | 'control'
  | 'needsLetter'
  | 'needsDigit';

export type CifResult =
  | {
      ok: true;
      kind: 'entity';
      type: CifType;
      normalized: string;
      /** Both forms of the expected control. */
      digit: string;
      letter: string;
      accepts: ControlKind;
    }
  | { ok: true; kind: 'person'; prefix: 'K' | 'L' | 'M'; normalized: string; letter: string }
  | {
      ok: false;
      reason: CifReason;
      /** The entity letter as typed. */
      type?: string;
      /** Type letter + 7 digits, for "para B6541001 debería ser 1". */
      body?: string;
      /** The correct control, in the form the type accepts ("1", "A" or "1 o A"). */
      expected?: string;
      accepts?: ControlKind;
    };

/** Control of the 7 digits: A = even positions, B = doubled odd positions digit-summed. */
export function cifControl(seven: string): { e: number; digit: string; letter: string } {
  const d = [...seven].map(Number);
  const a = d[1] + d[3] + d[5];
  let b = 0;
  for (const i of [0, 2, 4, 6]) {
    const x = d[i] * 2;
    b += Math.floor(x / 10) + (x % 10);
  }
  const e = (10 - ((a + b) % 10)) % 10;
  return { e, digit: String(e), letter: CIF_LETTERS[e] };
}

function isCifType(c: string): c is CifType {
  return c in CONTROL;
}

export function validateCif(raw: string): CifResult {
  const s = compactId(raw);
  if (!s) return { ok: false, reason: 'empty' };

  const person = /^([KLM])(\d{7})([A-Z])$/.exec(s);
  if (person) {
    const [, prefix, seven, letter] = person;
    const expected = dniLetter(Number(seven));
    if (letter !== expected) {
      return { ok: false, reason: 'control', type: prefix, body: prefix + seven, expected };
    }
    return { ok: true, kind: 'person', prefix: prefix as 'K' | 'L' | 'M', normalized: s, letter };
  }

  const type = s[0];
  // A DNI starts with a digit and an NIE with X, Y or Z: neither is a CIF.
  if (/^[\dXYZ]/.test(s)) return { ok: false, reason: 'digitFirst' };
  if (!isCifType(type)) {
    // K, L or M with the wrong shape (a K, L or M NIF is letter + 7 digits + letter).
    if (/^[KLM]$/.test(type)) return { ok: false, reason: 'format', type };
    return { ok: false, reason: 'type', type };
  }
  const accepts = CONTROL[type];

  if (/^[A-Z]\d{7}$/.test(s)) {
    const c = cifControl(s.slice(1));
    return {
      ok: false,
      reason: 'missingControl',
      type,
      body: s,
      expected: accepts === 'letter' ? c.letter : c.digit,
      accepts,
    };
  }

  const m = /^[A-Z](\d{7})([0-9A-J])$/.exec(s);
  if (!m) return { ok: false, reason: 'format', type };
  const [, seven, control] = m;
  const c = cifControl(seven);
  const isDigit = /\d/.test(control);

  if (accepts === 'letter' && isDigit) {
    return {
      ok: false,
      reason: 'needsLetter',
      type,
      body: s.slice(0, 8),
      expected: c.letter,
      accepts,
    };
  }
  if (accepts === 'digit' && !isDigit) {
    return {
      ok: false,
      reason: 'needsDigit',
      type,
      body: s.slice(0, 8),
      expected: c.digit,
      accepts,
    };
  }
  if (control !== c.digit && control !== c.letter) {
    const expected =
      accepts === 'letter' ? c.letter : accepts === 'digit' ? c.digit : `${c.digit}/${c.letter}`;
    return { ok: false, reason: 'control', type, body: s.slice(0, 8), expected, accepts };
  }
  return {
    ok: true,
    kind: 'entity',
    type,
    normalized: s,
    digit: c.digit,
    letter: c.letter,
    accepts,
  };
}

/** K, L and M are tax IDs of people without a DNI: personal data. */
export function isPersonalNif(raw: string): boolean {
  return /^[KLM]\d/.test(compactId(raw));
}

/** A DNI starts with a digit and an NIE with X, Y or Z: caught while typing, like K, L and M. */
function looksLikeDniOrNie(raw: string): boolean {
  return /^(\d|[XYZ]\d)/.test(compactId(raw));
}

/**
 * `shouldSave` for persistedInput: never store the input if any line is personal data —
 * a K, L or M NIF, or something shaped like a DNI or NIE.
 */
export function shouldRememberCif(text: string): boolean {
  return !splitLines(text).lines.some((line) => isPersonalNif(line) || looksLikeDniOrNie(line));
}

/** Without a type, A and B at 50 %: they are by far the most common. */
export function generateCif(rng: Rng, type?: CifType): string {
  const t = type ?? pick(rng, ['A', 'B'] as const);
  const seven = digits(rng, 7);
  const c = cifControl(seven);
  return t + seven + (CANONICAL_LETTER.has(t) ? c.letter : c.digit);
}
