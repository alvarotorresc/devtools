import { describe, expect, it } from 'vitest';
import {
  bitLength,
  convertBase,
  formatBigInt,
  groupDigits,
  groupSizeFor,
  isValidBase,
  parseBigInt,
} from './logic';

describe('convertBase (legacy behaviour)', () => {
  it('converts decimal to other bases', () => {
    const result = convertBase('255', 10);
    expect(result).not.toBeNull();
    expect(result!.Binary).toBe('11111111');
    expect(result!.Octal).toBe('377');
    expect(result!.Decimal).toBe('255');
    expect(result!.Hex).toBe('FF');
  });

  it('converts binary to other bases', () => {
    const result = convertBase('1010', 2);
    expect(result).not.toBeNull();
    expect(result!.Decimal).toBe('10');
  });

  it('converts hex to other bases', () => {
    const result = convertBase('FF', 16);
    expect(result).not.toBeNull();
    expect(result!.Decimal).toBe('255');
  });

  it('returns null for invalid input', () => {
    expect(convertBase('xyz', 10)).toBeNull();
  });
});

describe('parseBigInt', () => {
  it('keeps full precision far beyond Number.MAX_SAFE_INTEGER', () => {
    expect(parseBigInt('18446744073709551616', 10)).toBe(2n ** 64n);
    expect(formatBigInt(2n ** 64n, 16)).toBe('10000000000000000');
    expect(convertBase('9007199254740993', 10)!.Hex).toBe('20000000000001');
    const huge = '1' + '0'.repeat(100);
    expect(formatBigInt(parseBigInt(huge, 10)!, 10)).toBe(huge);
  });

  it('is strict: every digit must belong to the base (parseInt was not)', () => {
    expect(parseBigInt('12abc', 10)).toBeNull();
    expect(parseBigInt('102', 2)).toBeNull();
    expect(parseBigInt('8', 8)).toBeNull();
    expect(parseBigInt('', 10)).toBeNull();
    expect(parseBigInt('-', 10)).toBeNull();
  });

  it('accepts prefixes, grouping, case and sign', () => {
    expect(parseBigInt('0xFF', 16)).toBe(255n);
    expect(parseBigInt('0b1010', 2)).toBe(10n);
    expect(parseBigInt('0o17', 8)).toBe(15n);
    expect(parseBigInt('1111 0000', 2)).toBe(240n);
    expect(parseBigInt('1_000_000', 10)).toBe(1_000_000n);
    expect(parseBigInt('-ff', 16)).toBe(-255n);
  });

  it('works in any base from 2 to 36', () => {
    expect(parseBigInt('zz', 36)).toBe(1295n);
    expect(formatBigInt(1295n, 36)).toBe('zz');
    expect(formatBigInt(1295n, 36, true)).toBe('ZZ');
    expect(parseBigInt('10', 1)).toBeNull();
    expect(parseBigInt('10', 37)).toBeNull();
  });
});

describe('grouping', () => {
  it('groups from the right', () => {
    expect(groupDigits('11111111', 4)).toBe('1111 1111');
    expect(groupDigits('1234567', 3)).toBe('1 234 567');
    expect(groupDigits('-1234567', 3)).toBe('-1 234 567');
    expect(groupDigits('12', 4)).toBe('12');
  });

  it('picks a group size per base', () => {
    expect(groupSizeFor(2)).toBe(4);
    expect(groupSizeFor(16)).toBe(4);
    expect(groupSizeFor(10)).toBe(3);
    expect(groupSizeFor(8)).toBe(3);
  });

  it('round-trips grouped text', () => {
    const grouped = groupDigits(formatBigInt(2n ** 64n, 2), 4);
    expect(parseBigInt(grouped, 2)).toBe(2n ** 64n);
  });
});

describe('bitLength', () => {
  it('counts the bits of the absolute value', () => {
    expect(bitLength(0n)).toBe(1);
    expect(bitLength(255n)).toBe(8);
    expect(bitLength(256n)).toBe(9);
    expect(bitLength(-255n)).toBe(8);
    expect(bitLength(2n ** 64n)).toBe(65);
  });
});

describe('isValidBase', () => {
  it('accepts whole numbers from 2 to 36', () => {
    for (const b of [2, 10, 16, 36]) expect(isValidBase(b)).toBe(true);
  });

  it('rejects what a half-typed radix field can hold', () => {
    for (const b of [0, 1, 37, 2.5, NaN, Infinity, null, undefined, '16'])
      expect(isValidBase(b)).toBe(false);
  });
});
