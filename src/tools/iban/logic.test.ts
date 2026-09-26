import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import {
  IBAN_LENGTHS,
  SPANISH_BANKS,
  cccControl,
  formatCcc,
  formatIban,
  generateSpanishIban,
  ibanCheckDigits,
  mod97,
  normalizeIban,
  validateIban,
} from './logic';

const CHECKED = [
  'ES91 2100 0418 4502 0005 1332',
  'GB82 WEST 1234 5698 7654 32',
  'DE89 3704 0044 0532 0130 00',
  'NL91 ABNA 0417 1643 00',
  'FR14 2004 1010 0505 0001 3M02 606',
  'NO93 8601 1117 947',
  'BE68 5390 0754 7034',
];

describe('length table', () => {
  it('has 102 countries: 89 from SWIFT, 12 French territories and Åland', () => {
    expect(Object.keys(IBAN_LENGTHS)).toHaveLength(102);
    for (const c of ['BL', 'GF', 'GP', 'MF', 'MQ', 'NC', 'PF', 'PM', 'RE', 'TF', 'WF', 'YT']) {
      expect(IBAN_LENGTHS[c], c).toBe(27);
    }
    expect(IBAN_LENGTHS.AX).toBe(18);
    expect(IBAN_LENGTHS.ES).toBe(24);
    expect(IBAN_LENGTHS.MA).toBeUndefined();
  });
});

describe('mod97', () => {
  it('works digit by digit on 34 characters without overflowing', () => {
    const long = 'LC55HEMM000100010012001200023015'.padEnd(34, '9');
    const numeric = [...(long.slice(4) + long.slice(0, 4))]
      .map((ch) => (/[A-Z]/.test(ch) ? String(ch.charCodeAt(0) - 55) : ch))
      .join('');
    expect(mod97(long.slice(4) + long.slice(0, 4))).toBe(Number(BigInt(numeric) % 97n));
  });
});

describe('validateIban: checked examples', () => {
  it.each(CHECKED)('accepts %s', (iban) => {
    expect(validateIban(iban).ok).toBe(true);
  });

  it('breaks a Spanish IBAN into bank, branch, DC and account', () => {
    expect(validateIban('ES91 2100 0418 4502 0005 1332')).toEqual({
      ok: true,
      iban: 'ES9121000418450200051332',
      country: 'ES',
      bban: '21000418450200051332',
      spain: { bank: '2100', branch: '0418', dc: '45', account: '0200051332' },
      fromCcc: false,
    });
  });

  it('keeps the BBAN of other countries, letters included', () => {
    expect(validateIban('gb82west12345698765432')).toMatchObject({
      ok: true,
      country: 'GB',
      bban: 'WEST12345698765432',
      spain: null,
    });
  });

  it('accepts lower case, spaces anywhere and an "IBAN" prefix', () => {
    expect(validateIban('iban es9121 00041845020 0051332').ok).toBe(true);
  });
});

describe('validateIban: errors, in order', () => {
  it('unknown country', () => {
    expect(validateIban('XX12 3456')).toEqual({ ok: false, reason: 'country', country: 'XX' });
    expect(validateIban('MA64 0115 1900 0001 2050 0053 4921')).toMatchObject({
      reason: 'country',
    });
  });

  it('wrong length for the country', () => {
    expect(validateIban('ES91 2100 0418 4502 0005 133')).toEqual({
      ok: false,
      reason: 'length',
      country: 'ES',
      length: 23,
      expectedLength: 24,
    });
  });

  it('characters outside A–Z and 0–9', () => {
    expect(validateIban('ES91 2100 0418 4502 0005 133*')).toMatchObject({ reason: 'chars' });
  });

  it('check digits 00, 01 and 99 are refused even if mod 97 fits', () => {
    for (const cd of ['00', '01', '99']) {
      expect(validateIban(`ES${cd}21000418450200051332`)).toMatchObject({ reason: 'checkRange' });
    }
  });

  it('mod 97 mismatch', () => {
    expect(validateIban('ES91 2100 0418 4502 0005 1333')).toMatchObject({ reason: 'checksum' });
  });

  it('a coherent IBAN whose Spanish account digits are wrong', () => {
    // Same CCC with DC 46 instead of 45, and IBAN check digits recomputed so mod 97 fits.
    const bban = '21000418460200051332';
    const iban = `ES${ibanCheckDigits('ES', bban)}${bban}`;
    expect(validateIban(iban)).toEqual({ ok: false, reason: 'ccc', country: 'ES', expected: '45' });
  });
});

describe('CCC', () => {
  it('computes DC 45 for 2100 0418 … 0200051332', () => {
    expect(cccControl('2100', '0418', '0200051332')).toBe('45');
  });

  it('validates a bare 20-digit CCC and gives its IBAN', () => {
    expect(validateIban('2100 0418 45 0200051332')).toMatchObject({
      ok: true,
      iban: 'ES9121000418450200051332',
      fromCcc: true,
    });
    expect(validateIban('21000418460200051332')).toEqual({
      ok: false,
      reason: 'cccOnly',
      country: 'ES',
      expected: '45',
    });
  });

  it('builds the IBAN check digits from a BBAN', () => {
    expect(ibanCheckDigits('ES', '21000418450200051332')).toBe('91');
    expect(ibanCheckDigits('DE', '370400440532013000')).toBe('89');
  });
});

describe('formatting', () => {
  it('groups by 4 and prints the CCC', () => {
    expect(formatIban('ES9121000418450200051332')).toBe('ES91 2100 0418 4502 0005 1332');
    expect(formatIban('NO9386011117947')).toBe('NO93 8601 1117 947');
    expect(formatCcc('ES9121000418450200051332')).toBe('2100 0418 45 0200051332');
    expect(normalizeIban(' iban es91-2100 ')).toBe('ES912100');
  });
});

describe('generateSpanishIban', () => {
  it('round-trip: 1 000 values with seed "test" are all valid', () => {
    const rng = seededRng('test');
    for (let i = 0; i < 1000; i++) {
      const iban = generateSpanishIban(rng);
      expect(iban).toMatch(/^ES\d{22}$/);
      const r = validateIban(iban);
      expect(r.ok, iban).toBe(true);
      if (r.ok) expect(SPANISH_BANKS).toContain(r.spain?.bank);
    }
  });
});
