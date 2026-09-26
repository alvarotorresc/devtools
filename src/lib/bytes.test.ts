import { describe, expect, it } from 'vitest';
import { base64ToBytes, bytesToBase64, fromUtf8, normalizeBase64, toHex, utf8 } from './bytes';

describe('utf8 helpers', () => {
  it('round-trips non-ASCII text', () => {
    expect(fromUtf8(utf8('Canción ✓ 😀'))).toBe('Canción ✓ 😀');
    expect(utf8('ñ')).toEqual(new Uint8Array([0xc3, 0xb1]));
  });

  it('throws on invalid UTF-8 only when fatal', () => {
    const bad = new Uint8Array([0xff, 0xfe]);
    expect(() => fromUtf8(bad, true)).toThrow();
    expect(fromUtf8(bad)).toBe('��');
  });

  it('prints bytes as lowercase hex', () => {
    expect(toHex(new Uint8Array([0, 15, 255]))).toBe('000fff');
  });
});

describe('base64', () => {
  it('encodes standard and URL-safe variants', () => {
    const bytes = new Uint8Array([0xfb, 0xff, 0xbf]);
    expect(bytesToBase64(bytes)).toBe('+/+/');
    expect(bytesToBase64(bytes, true)).toBe('-_-_');
    expect(bytesToBase64(utf8('ab'), true)).toBe('YWI');
    expect(bytesToBase64(utf8('ab'))).toBe('YWI=');
  });

  it('encodes large inputs without overflowing the call stack', () => {
    const big = new Uint8Array(300_000).fill(65);
    expect(bytesToBase64(big)).toHaveLength(400_000);
  });

  it('normalizes URL-safe, unpadded and wrapped input', () => {
    expect(normalizeBase64('YWI')).toBe('YWI=');
    expect(normalizeBase64('-_-_')).toBe('+/+/');
    expect(normalizeBase64('SGVs\nbG8=')).toBe('SGVsbG8=');
  });

  it('rejects impossible Base64', () => {
    expect(normalizeBase64('abc!')).toBeNull();
    expect(normalizeBase64('abcde')).toBeNull();
    expect(normalizeBase64('YWI==')).toBeNull();
    expect(base64ToBytes('@@@@')).toBeNull();
  });

  it('decodes to bytes', () => {
    expect(base64ToBytes('+/+/')).toEqual(new Uint8Array([0xfb, 0xff, 0xbf]));
    expect(base64ToBytes('')).toEqual(new Uint8Array(0));
  });
});
