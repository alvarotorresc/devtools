import { describe, expect, it } from 'vitest';
import {
  eanCheckDigit,
  gs1Prefix,
  isbn10CheckChar,
  isbn10to13,
  isbn13to10,
  validateCode,
} from './logic';

describe('check digits: checked examples', () => {
  it('EAN-13', () => {
    expect(eanCheckDigit('400638133393')).toBe('1');
    expect(eanCheckDigit('978030640615')).toBe('7');
  });

  it('ISBN-10, with X for 10', () => {
    expect(isbn10CheckChar('030640615')).toBe('2');
    expect(isbn10CheckChar('080442957')).toBe('X');
  });

  it('converts 9780306406157 ↔ 0306406152', () => {
    expect(isbn10to13('0306406152')).toBe('9780306406157');
    expect(isbn13to10('9780306406157')).toBe('0306406152');
    expect(isbn13to10('9791234567896')).toBeNull();
  });
});

describe('validateCode', () => {
  it('reads 13 digits as EAN-13 and, with 978, as ISBN-13 too', () => {
    expect(validateCode('4006381333931')).toEqual({
      ok: true,
      format: 'ean13',
      code: '4006381333931',
      isbn: false,
      isbn10: null,
      prefix: null,
    });
    expect(validateCode('978-0-306-40615-7')).toEqual({
      ok: true,
      format: 'ean13',
      code: '9780306406157',
      isbn: true,
      isbn10: '0306406152',
      prefix: 'isbn',
    });
  });

  it('accepts dots as separators too', () => {
    expect(validateCode('978.0306406157')).toMatchObject({ ok: true, code: '9780306406157' });
  });

  it('has no 10-digit form for 979', () => {
    const code = '979123456789' + eanCheckDigit('979123456789');
    expect(validateCode(code)).toMatchObject({ ok: true, isbn: true, isbn10: null });
  });

  it('treats 9790 (ISMN, sheet music) as a plain EAN-13, not an ISBN', () => {
    expect(validateCode('9790123456785')).toEqual({
      ok: true,
      format: 'ean13',
      code: '9790123456785',
      isbn: false,
      isbn10: null,
      prefix: 'ismn',
    });
  });

  it('reads 10 characters as ISBN-10 and accepts a lower-case x', () => {
    expect(validateCode('0306406152')).toEqual({
      ok: true,
      format: 'isbn10',
      code: '0306406152',
      isbn13: '9780306406157',
    });
    expect(validateCode('080442957x')).toMatchObject({ ok: true, code: '080442957X' });
  });

  it('completes 12 and 9 digits with their check digit', () => {
    expect(validateCode('400638133393')).toEqual({
      ok: false,
      reason: 'eanMissing',
      expected: '1',
      completed: '4006381333931',
    });
    expect(validateCode('030640615')).toMatchObject({
      reason: 'isbnMissing',
      expected: '2',
      completed: '0306406152',
    });
  });

  it('says which check digit is right', () => {
    expect(validateCode('4006381333932')).toMatchObject({ reason: 'eanCheck', expected: '1' });
    expect(validateCode('0306406153')).toMatchObject({ reason: 'isbnCheck', expected: '2' });
  });

  it('rejects X in the middle, EAN-8 and other lengths', () => {
    expect(validateCode('03064X6152')).toEqual({ ok: false, reason: 'xPosition' });
    expect(validateCode('96385074')).toEqual({ ok: false, reason: 'ean8' });
    expect(validateCode('12345')).toEqual({ ok: false, reason: 'length', length: 5 });
    expect(validateCode('97803A6406157')).toEqual({ ok: false, reason: 'chars' });
    expect(validateCode('')).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('gs1Prefix', () => {
  it('names the few prefixes the page explains', () => {
    expect(gs1Prefix('8412345678905')).toBe('spain');
    expect(gs1Prefix('9780306406157')).toBe('isbn');
    expect(gs1Prefix('9790123456785')).toBe('ismn');
    expect(gs1Prefix('9771234567003')).toBe('issn');
    expect(gs1Prefix('2012345678903')).toBe('store');
    expect(gs1Prefix('4006381333931')).toBeNull();
  });
});
