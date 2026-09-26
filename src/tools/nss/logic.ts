import { PROVINCES, provinceByCode, type Province } from '../../lib/provinces';
import { pick, randInt, type Rng } from '../../lib/random';

export type NssReason = 'empty' | 'chars' | 'fewDigits' | 'manyDigits' | 'control';

export type NssResult =
  | {
      ok: true;
      /** 12 digits. */
      normalized: string;
      /** `28/12345678/40`. */
      formatted: string;
      provinceCode: string;
      /** Undefined for codes outside 01–52: a warning, not an error. */
      province: Province | undefined;
    }
  | { ok: false; reason: NssReason; length?: number; expected?: string };

/**
 * Two branches (Intervia, Forosdelweb and Box4Dev agree):
 * b < 10 000 000 → d = b + a × 10 000 000; otherwise d = a × 100 000 000 + b. Control = d mod 97.
 */
export function nssControl(a: number, b: number): string {
  const d = b < 10_000_000 ? b + a * 10_000_000 : a * 100_000_000 + b;
  return String(d % 97).padStart(2, '0');
}

export function validateNss(raw: string): NssResult {
  const s = raw.replace(/[\s./-]/g, '');
  if (!s) return { ok: false, reason: 'empty' };
  if (!/^\d+$/.test(s)) return { ok: false, reason: 'chars' };
  if (s.length < 12) return { ok: false, reason: 'fewDigits', length: s.length };
  if (s.length > 12) return { ok: false, reason: 'manyDigits', length: s.length };
  const provinceCode = s.slice(0, 2);
  const expected = nssControl(Number(provinceCode), Number(s.slice(2, 10)));
  if (s.slice(10) !== expected) return { ok: false, reason: 'control', expected };
  return {
    ok: true,
    normalized: s,
    formatted: `${provinceCode}/${s.slice(2, 10)}/${s.slice(10)}`,
    provinceCode,
    province: provinceByCode(provinceCode),
  };
}

/** 12 digits. `b` covers 0–99 999 999, so both branches of the formula come out. */
export function generateNss(rng: Rng, province?: string): string {
  const code = province ?? pick(rng, PROVINCES).code;
  const b = randInt(rng, 0, 99_999_999);
  return code + String(b).padStart(8, '0') + nssControl(Number(code), b);
}
