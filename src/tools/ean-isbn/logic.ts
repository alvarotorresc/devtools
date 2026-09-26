export type Gs1Prefix = 'spain' | 'isbn' | 'ismn' | 'issn' | 'store' | null;

export type CodeReason =
  | 'empty'
  | 'chars'
  | 'xPosition'
  | 'ean8'
  | 'length'
  | 'eanCheck'
  | 'isbnCheck'
  | 'eanMissing'
  | 'isbnMissing';

export type CodeResult =
  | {
      ok: true;
      format: 'ean13';
      code: string;
      /** True for the 978/979 registrant group, excluding 9790 (ISMN, not an ISBN). */
      isbn: boolean;
      /** Only for 978; 979 has no 10-digit equivalent. */
      isbn10: string | null;
      prefix: Gs1Prefix;
    }
  | { ok: true; format: 'isbn10'; code: string; isbn13: string }
  | {
      ok: false;
      reason: CodeReason;
      length?: number;
      /** The check digit (or X) that is right. */
      expected?: string;
      /** The full code with the right check digit. */
      completed?: string;
    };

/** EAN-13 / ISBN-13: weights 1, 3, 1, 3… from the left over the first 12 digits. */
export function eanCheckDigit(twelve: string): string {
  let s = 0;
  for (let i = 0; i < 12; i++) s += Number(twelve[i]) * (i % 2 === 0 ? 1 : 3);
  return String((10 - (s % 10)) % 10);
}

/** ISBN-10: weights 10 to 2 over the first 9 digits; 10 is written X. */
export function isbn10CheckChar(nine: string): string {
  let s = 0;
  for (let i = 0; i < 9; i++) s += Number(nine[i]) * (10 - i);
  const c = (11 - (s % 11)) % 11;
  return c === 10 ? 'X' : String(c);
}

export function isbn10to13(isbn10: string): string {
  const twelve = '978' + isbn10.slice(0, 9);
  return twelve + eanCheckDigit(twelve);
}

/** Only for the 978 prefix. */
export function isbn13to10(isbn13: string): string | null {
  if (!isbn13.startsWith('978')) return null;
  const nine = isbn13.slice(3, 12);
  return nine + isbn10CheckChar(nine);
}

/** Informative only: the few GS1 prefixes the page names. */
export function gs1Prefix(ean: string): Gs1Prefix {
  if (ean.startsWith('9790')) return 'ismn';
  if (/^97[89]/.test(ean)) return 'isbn';
  if (ean.startsWith('977')) return 'issn';
  if (ean.startsWith('84')) return 'spain';
  if (/^2\d/.test(ean)) return 'store';
  return null;
}

export function validateCode(raw: string): CodeResult {
  const s = raw.toUpperCase().replace(/[\s-]/g, '');
  if (!s) return { ok: false, reason: 'empty' };
  if (!/^[\dX]+$/.test(s)) return { ok: false, reason: 'chars' };
  if (s.includes('X') && !/^\d{9}X$/.test(s)) return { ok: false, reason: 'xPosition' };

  switch (s.length) {
    case 13: {
      const expected = eanCheckDigit(s);
      if (s[12] !== expected) {
        return { ok: false, reason: 'eanCheck', expected, completed: s.slice(0, 12) + expected };
      }
      const prefix = gs1Prefix(s);
      const isbn = prefix === 'isbn';
      return {
        ok: true,
        format: 'ean13',
        code: s,
        isbn,
        isbn10: isbn ? isbn13to10(s) : null,
        prefix,
      };
    }
    case 12: {
      const expected = eanCheckDigit(s);
      return { ok: false, reason: 'eanMissing', expected, completed: s + expected };
    }
    case 10: {
      const expected = isbn10CheckChar(s);
      if (s[9] !== expected) {
        return { ok: false, reason: 'isbnCheck', expected, completed: s.slice(0, 9) + expected };
      }
      return { ok: true, format: 'isbn10', code: s, isbn13: isbn10to13(s) };
    }
    case 9: {
      const expected = isbn10CheckChar(s);
      return { ok: false, reason: 'isbnMissing', expected, completed: s + expected };
    }
    case 8:
      return { ok: false, reason: 'ean8' };
    default:
      return { ok: false, reason: 'length', length: s.length };
  }
}
