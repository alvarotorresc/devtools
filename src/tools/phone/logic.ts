import { digits, randInt, type Rng } from '../../lib/random';

export type PhoneKind =
  'mobile' | 'personal' | 'freephone' | 'specialRate' | 'premium' | 'landline' | 'corporate';

export type PhoneReason =
  'empty' | 'chars' | 'foreign' | 'short' | 'fewDigits' | 'manyDigits' | 'pattern';

export type PhoneResult =
  | {
      ok: true;
      kind: PhoneKind;
      /** 9 digits. */
      national: string;
      /** `+34612345678`. */
      e164: string;
      /** `612 34 56 78`. */
      nationalFormatted: string;
      /** `+34 612 34 56 78`. */
      international: string;
      /** `tel:+34612345678`. */
      tel: string;
    }
  | { ok: false; reason: PhoneReason; length?: number };

/** Evaluated in this order (§6.7 of the spec). */
const PATTERNS: [RegExp, PhoneKind][] = [
  [/^(6\d{8}|7[1-4]\d{7})$/, 'mobile'],
  [/^70\d{7}$/, 'personal'],
  [/^(800|900)\d{6}$/, 'freephone'],
  [/^(901|902)\d{6}$/, 'specialRate'],
  [/^(803|806|807|905)\d{6}$/, 'premium'],
  [/^[89][1-8]\d{7}$/, 'landline'],
  [/^51\d{7}$/, 'corporate'],
];

/** Removes separators and the +34 / 0034 / 34 prefix. Null for other country codes. */
export function normalizePhone(raw: string): string | null {
  let s = raw.replace(/[\s.()-]/g, '');
  if (s.startsWith('+')) {
    if (!s.startsWith('+34')) return null;
    s = s.slice(3);
  } else if (s.startsWith('00')) {
    if (!s.startsWith('0034')) return null;
    s = s.slice(4);
  } else if (/^34\d{9}$/.test(s)) {
    s = s.slice(2);
  }
  return s;
}

export function formatNational(n: string): string {
  return `${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 7)} ${n.slice(7)}`;
}

export function validatePhone(raw: string): PhoneResult {
  if (!raw.trim()) return { ok: false, reason: 'empty' };
  const n = normalizePhone(raw);
  if (n === null) return { ok: false, reason: 'foreign' };
  if (!/^\d+$/.test(n)) return { ok: false, reason: 'chars' };
  if (n.length >= 3 && n.length <= 6) return { ok: false, reason: 'short', length: n.length };
  if (n.length < 9) return { ok: false, reason: 'fewDigits', length: n.length };
  if (n.length > 9) return { ok: false, reason: 'manyDigits', length: n.length };
  const kind = PATTERNS.find(([re]) => re.test(n))?.[1];
  if (!kind) return { ok: false, reason: 'pattern' };
  const nationalFormatted = formatNational(n);
  return {
    ok: true,
    kind,
    national: n,
    e164: `+34${n}`,
    nationalFormatted,
    international: `+34 ${nationalFormatted}`,
    tel: `tel:+34${n}`,
  };
}

/**
 * For mock data (no tab of its own). Mobile: 80 % 6 + 8 digits, 20 % 7[1-4] + 7 digits.
 * Landline: 9[1-8] + 7 digits.
 */
export function generatePhone(rng: Rng, kind: 'mobile' | 'landline'): string {
  if (kind === 'landline') return `9${randInt(rng, 1, 8)}${digits(rng, 7)}`;
  if (randInt(rng, 1, 100) <= 80) return `6${digits(rng, 8)}`;
  return `7${randInt(rng, 1, 4)}${digits(rng, 7)}`;
}
