import { digits, pick, type Rng } from '../../lib/random';

/**
 * IBAN length per country: the 89 countries of the SWIFT IBAN registry, the 12 French
 * territories with their own IBAN in the FR format and Åland (FI format). 102 in total.
 * Checked against ibantools 4.5.4 (0 differences) when the spec was written, 2026-09-26.
 */
// prettier-ignore
export const IBAN_LENGTHS: Readonly<Record<string, number>> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AX: 18, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22,
  BI: 27, BL: 27, BR: 29, BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DJ: 27,
  DK: 18, DO: 28, EE: 20, EG: 29, ES: 24, FI: 18, FK: 18, FO: 18, FR: 27, GB: 22,
  GE: 22, GF: 27, GI: 23, GL: 18, GP: 27, GR: 27, GT: 28, HN: 28, HR: 21, HU: 28,
  IE: 22, IL: 23, IQ: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28, LC: 32,
  LI: 21, LT: 20, LU: 20, LV: 21, LY: 25, MC: 27, MD: 24, ME: 22, MF: 27, MK: 19,
  MN: 20, MQ: 27, MR: 27, MT: 31, MU: 30, NC: 27, NI: 28, NL: 18, NO: 15, OM: 23,
  PF: 27, PK: 24, PL: 28, PM: 27, PS: 29, PT: 25, QA: 29, RE: 27, RO: 24, RS: 22,
  RU: 33, SA: 24, SC: 31, SD: 18, SE: 24, SI: 19, SK: 24, SM: 27, SO: 23, ST: 25,
  SV: 28, TF: 27, TL: 23, TN: 24, TR: 26, UA: 29, VA: 22, VG: 24, WF: 27, XK: 20,
  YE: 30, YT: 27,
};

/** Frequent real Spanish bank codes, for the generator. */
export const SPANISH_BANKS = ['2100', '0049', '0182', '0081', '2085', '0128', '1465', '0073'];

const CCC_WEIGHTS = [1, 2, 4, 8, 5, 10, 9, 7, 3, 6];

export interface SpanishParts {
  bank: string;
  branch: string;
  dc: string;
  account: string;
}

export type IbanReason =
  'empty' | 'country' | 'length' | 'chars' | 'checkRange' | 'checksum' | 'ccc' | 'cccOnly';

export type IbanResult =
  | {
      ok: true;
      /** Without spaces. */
      iban: string;
      country: string;
      bban: string;
      /** Only for ES. */
      spain: SpanishParts | null;
      /** True when the input was a bare 20-digit CCC. */
      fromCcc: boolean;
    }
  | {
      ok: false;
      reason: IbanReason;
      country?: string;
      length?: number;
      expectedLength?: number;
      /** For `ccc`: the two control digits the account should have. */
      expected?: string;
    };

/** Removes spaces, dashes and a leading "IBAN", and upper-cases. */
export function normalizeIban(raw: string): string {
  return raw.toUpperCase().replace(/[\s-]/g, '').replace(/^IBAN/, '');
}

/** mod 97 of an alphanumeric string (A=10 … Z=35), digit by digit so it never overflows. */
export function mod97(text: string): number {
  let r = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    const value = code >= 65 && code <= 90 ? String(code - 55) : ch;
    for (const d of value) r = (r * 10 + (d.charCodeAt(0) - 48)) % 97;
  }
  return r;
}

/** The two check digits of an IBAN: 98 − mod97(BBAN + country + "00"). */
export function ibanCheckDigits(country: string, bban: string): string {
  return String(98 - mod97(bban + country + '00')).padStart(2, '0');
}

/** One CCC control digit over 10 digits, with weights 1, 2, 4, 8, 5, 10, 9, 7, 3, 6. */
export function cccDigit(ten: string): number {
  let s = 0;
  for (let i = 0; i < 10; i++) s += Number(ten[i]) * CCC_WEIGHTS[i];
  const d = 11 - (s % 11);
  return d === 11 ? 0 : d === 10 ? 1 : d;
}

/** DC1 over "00" + bank + branch, DC2 over the account. */
export function cccControl(bank: string, branch: string, account: string): string {
  return `${cccDigit('00' + bank + branch)}${cccDigit(account)}`;
}

function spanishParts(bban: string): SpanishParts {
  return {
    bank: bban.slice(0, 4),
    branch: bban.slice(4, 8),
    dc: bban.slice(8, 10),
    account: bban.slice(10),
  };
}

function checkCcc(bban: string): string | null {
  const p = spanishParts(bban);
  const expected = cccControl(p.bank, p.branch, p.account);
  return expected === p.dc ? null : expected;
}

export function validateIban(raw: string): IbanResult {
  const s = normalizeIban(raw);
  if (!s) return { ok: false, reason: 'empty' };

  // A bare Spanish CCC: 20 digits.
  if (/^\d{20}$/.test(s)) {
    const expected = checkCcc(s);
    if (expected) return { ok: false, reason: 'cccOnly', country: 'ES', expected };
    const iban = 'ES' + ibanCheckDigits('ES', s) + s;
    return { ok: true, iban, country: 'ES', bban: s, spain: spanishParts(s), fromCcc: true };
  }

  const country = s.slice(0, 2);
  const expectedLength = IBAN_LENGTHS[country];
  if (!expectedLength) return { ok: false, reason: 'country', country };
  if (s.length !== expectedLength) {
    return { ok: false, reason: 'length', country, length: s.length, expectedLength };
  }
  if (!/^[A-Z0-9]+$/.test(s)) return { ok: false, reason: 'chars', country };
  const check = s.slice(2, 4);
  if (!/^\d\d$/.test(check) || Number(check) < 2 || Number(check) > 98) {
    return { ok: false, reason: 'checkRange', country };
  }
  if (mod97(s.slice(4) + s.slice(0, 4)) !== 1) return { ok: false, reason: 'checksum', country };

  const bban = s.slice(4);
  if (country === 'ES') {
    if (!/^\d{20}$/.test(bban)) return { ok: false, reason: 'chars', country };
    const expected = checkCcc(bban);
    if (expected) return { ok: false, reason: 'ccc', country, expected };
    return { ok: true, iban: s, country, bban, spain: spanishParts(bban), fromCcc: false };
  }
  return { ok: true, iban: s, country, bban, spain: null, fromCcc: false };
}

/** Groups of 4: `ES9121000418450200051332` → `ES91 2100 0418 4502 0005 1332`. */
export function formatIban(iban: string): string {
  return normalizeIban(iban).replace(/(.{4})(?=.)/g, '$1 ');
}

/** `2100 0418 45 0200051332` from a Spanish IBAN or CCC. */
export function formatCcc(ibanOrCcc: string): string {
  const s = normalizeIban(ibanOrCcc);
  const ccc = s.length === 24 ? s.slice(4) : s;
  return `${ccc.slice(0, 4)} ${ccc.slice(4, 8)} ${ccc.slice(8, 10)} ${ccc.slice(10)}`;
}

/** A random Spanish IBAN without spaces: real bank code, random branch and account. */
export function generateSpanishIban(rng: Rng): string {
  const bank = pick(rng, SPANISH_BANKS);
  const branch = digits(rng, 4);
  const account = digits(rng, 10);
  const bban = bank + branch + cccControl(bank, branch, account) + account;
  return 'ES' + ibanCheckDigits('ES', bban) + bban;
}
