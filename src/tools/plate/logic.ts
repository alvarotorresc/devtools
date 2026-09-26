import { PROVINCES, provinceByPlate, type Province } from '../../lib/provinces';
import { digits, pick, randInt, type Rng } from '../../lib/random';

/** Current plates (since 2000): 20 consonants, no vowels, no Ñ and no Q. */
export const PLATE_LETTERS = 'BCDFGHJKLMNPRSTVWXYZ';
/** Old provincial plates (1971–2000): A–Z without Ñ and Q. */
export const OLD_LETTERS = 'ABCDEFGHIJKLMNOPRSTUVWXYZ';
/** 20³ letter combinations × 10 000 numbers. */
export const CURRENT_TOTAL = 80_000_000;

export type PlateReason = 'empty' | 'format' | 'letter' | 'oldLetter' | 'province' | 'special';

export type PlateResult =
  | {
      ok: true;
      format: 'current';
      normalized: string;
      /** 1-based place in the series: 0000 BBB is 1 and 9999 ZZZ is 80 000 000. */
      position: number;
    }
  | { ok: true; format: 'old'; normalized: string; prefix: string; province: Province }
  | {
      ok: false;
      reason: PlateReason;
      /** The letter that is not allowed. */
      char?: string;
      /** The provincial prefix that does not exist. */
      prefix?: string;
    };

function compactPlate(raw: string): string {
  return raw.toUpperCase().replace(/[\s.-]/g, '');
}

/** ((i1 × 20 + i2) × 20 + i3) × 10 000 + number, plus 1 so the first plate is number 1. */
export function platePosition(num: string, letters: string): number {
  const [a, b, c] = [...letters].map((l) => PLATE_LETTERS.indexOf(l));
  return ((a * 20 + b) * 20 + c) * 10_000 + Number(num) + 1;
}

export function validatePlate(raw: string): PlateResult {
  const s = compactPlate(raw);
  if (!s) return { ok: false, reason: 'empty' };

  if (/^\d/.test(s)) {
    const m = /^(\d{4})([A-ZÑ]{3})$/.exec(s);
    if (!m) return { ok: false, reason: 'format' };
    const [, num, letters] = m;
    const bad = [...letters].find((l) => !PLATE_LETTERS.includes(l));
    if (bad) return { ok: false, reason: 'letter', char: bad };
    return {
      ok: true,
      format: 'current',
      normalized: `${num} ${letters}`,
      position: platePosition(num, letters),
    };
  }

  // Mopeds (C 1234 BCD), historic, temporary and diplomatic plates, and pre-1971 ones (M-123456).
  if (/^[A-Z]{1,2}\d{4}[A-Z]{3}$/.test(s) || /^[A-Z]{1,2}\d{5,6}$/.test(s)) {
    return { ok: false, reason: 'special' };
  }

  const m = /^([A-Z]{1,2})(\d{4})([A-ZÑ]{1,2})$/.exec(s);
  if (!m) return { ok: false, reason: 'format' };
  const [, prefix, num, letters] = m;
  const province = provinceByPlate(prefix);
  if (!province) return { ok: false, reason: 'province', prefix };
  const bad = [...letters].find((l) => !OLD_LETTERS.includes(l));
  if (bad) return { ok: false, reason: 'oldLetter', char: bad };
  return { ok: true, format: 'old', normalized: `${prefix}-${num}-${letters}`, prefix, province };
}

function letters(rng: Rng, alphabet: string, n: number): string {
  let out = '';
  for (let i = 0; i < n; i++) out += alphabet[randInt(rng, 0, alphabet.length - 1)];
  return out;
}

/** Current format: `1234 BCD`. */
export function generatePlate(rng: Rng): string {
  return `${digits(rng, 4)} ${letters(rng, PLATE_LETTERS, 3)}`;
}

/** Old provincial format: `M-1234-AB`, with one or two letters at 50 %. */
export function generateOldPlate(rng: Rng): string {
  const province = pick(rng, PROVINCES);
  const prefix = pick(rng, province.plates);
  const num = digits(rng, 4);
  return `${prefix}-${num}-${letters(rng, OLD_LETTERS, randInt(rng, 1, 2))}`;
}
