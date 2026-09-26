import { describe, expect, it } from 'vitest';
import {
  MAX_COUNT,
  NANOID_ALPHABETS,
  detectId,
  formatId,
  formatUUID,
  generate,
  nanoid,
  ulid,
  uuidV4,
  uuidV7,
  validateUUID,
} from './logic';

const zeros = (n: number) => new Uint8Array(n);
const ones = (n: number) => new Uint8Array(n).fill(0xff);

describe('uuidV4', () => {
  it('sets version 4 and the RFC variant', () => {
    expect(uuidV4(zeros)).toBe('00000000-0000-4000-8000-000000000000');
    expect(uuidV4()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});

describe('uuidV7', () => {
  it('encodes the millisecond timestamp in the first 48 bits (RFC 9562 example)', () => {
    expect(uuidV7(0x017f22e279b0, zeros)).toBe('017f22e2-79b0-7000-8000-000000000000');
  });

  it('is detected as v7 with its date', () => {
    const d = detectId('017F22E2-79B0-7CC3-98C4-DC0C0C07398F');
    expect(d).toEqual({ kind: 'uuid', version: 7, date: new Date('2022-02-22T19:22:22.000Z') });
  });
});

describe('ulid', () => {
  it('encodes time in Crockford base32 (spec example timestamp)', () => {
    expect(ulid(1469918176385, zeros)).toBe('01ARYZ6S41' + '0'.repeat(16));
  });

  it('uses all 80 random bits', () => {
    expect(ulid(0, ones).slice(10)).toBe('Z'.repeat(16));
  });

  it('is detected with its date', () => {
    expect(detectId('01ARYZ6S41TSV4RRFFQ69G5FAV')).toEqual({
      kind: 'ulid',
      date: new Date(1469918176385),
    });
  });
});

describe('nanoid', () => {
  it('defaults to 21 url-safe characters', () => {
    const id = nanoid();
    expect(id).toHaveLength(21);
    for (const ch of id) expect(NANOID_ALPHABETS.urlsafe).toContain(ch);
  });

  it('respects size and custom alphabet', () => {
    expect(nanoid(50, 'ab')).toMatch(/^[ab]{50}$/);
    expect(nanoid(4, NANOID_ALPHABETS.urlsafe, zeros)).toBe('AAAA');
  });

  it('rejects a non-positive-integer size instead of hanging', () => {
    expect(() => nanoid(0)).toThrow(RangeError);
    expect(() => nanoid(2.5)).toThrow(RangeError);
  });
});

describe('formatId', () => {
  it('toggles dashes and case for UUIDs only', () => {
    const id = '017f22e2-79b0-7000-8000-000000000000';
    expect(formatId(id, 'v7', { uppercase: true, dashes: false })).toBe(
      '017F22E279B070008000000000000000',
    );
    expect(
      formatId('01ARYZ6S41TSV4RRFFQ69G5FAV', 'ulid', { uppercase: false, dashes: false }),
    ).toBe('01ARYZ6S41TSV4RRFFQ69G5FAV');
  });
});

describe('generate', () => {
  const opts = { size: 21, alphabet: NANOID_ALPHABETS.urlsafe };

  it('clamps the count between 1 and MAX_COUNT', () => {
    expect(generate('v4', 0, opts)).toHaveLength(1);
    expect(generate('v4', 99999, opts)).toHaveLength(MAX_COUNT);
  });

  it('returns unique ids', () => {
    const ids = generate('v7', 200, opts);
    expect(new Set(ids).size).toBe(200);
  });

  it('clamps a fractional or NaN nanoid size instead of hanging', () => {
    expect(generate('nanoid', 1, { size: 2.5, alphabet: 'ab' })[0]).toHaveLength(2);
    expect(generate('nanoid', 1, { size: NaN, alphabet: 'ab' })[0]).toHaveLength(21);
  });
});

describe('detectId', () => {
  it('recognises nil, max, compact and invalid values', () => {
    expect(detectId('00000000-0000-0000-0000-000000000000')).toEqual({ kind: 'nil' });
    expect(detectId('ffffffff-ffff-ffff-ffff-ffffffffffff')).toEqual({ kind: 'max' });
    expect(detectId('550e8400e29b41d4a716446655440000')).toEqual({
      kind: 'uuid',
      version: 4,
      date: null,
    });
    expect(detectId('550e8400-e29b-41d4-c716-446655440000')).toEqual({ kind: 'invalid' });
    expect(detectId('hello')).toEqual({ kind: 'invalid' });
    expect(detectId('  550e8400-e29b-41d4-a716-446655440000  ').kind).toBe('uuid');
  });
});

describe('legacy helpers', () => {
  it('validates UUIDs like before', () => {
    expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(validateUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    expect(validateUUID('not-a-uuid')).toBe(false);
    expect(validateUUID('')).toBe(false);
    expect(validateUUID('550e8400e29b41d4a716446655440000')).toBe(false);
  });

  it('formats UUIDs with and without dashes like before', () => {
    expect(formatUUID('550e8400-e29b-41d4-a716-446655440000', false)).toBe(
      '550e8400e29b41d4a716446655440000',
    );
    expect(formatUUID('550e8400e29b41d4a716446655440000', true)).toBe(
      '550e8400-e29b-41d4-a716-446655440000',
    );
  });
});
