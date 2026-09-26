import { describe, expect, it } from 'vitest';
import {
  convert,
  decodeBase64,
  detectDirection,
  encodeBase64,
  extensionFor,
  formatBytes,
  parseBase64Payload,
  sniffMime,
  toDataUri,
} from './logic';

describe('encode and decode (legacy behaviour)', () => {
  it('encodes text to Base64', () => {
    expect(encodeBase64('Hello, World!')).toBe('SGVsbG8sIFdvcmxkIQ==');
  });

  it('decodes Base64 to text', () => {
    expect(decodeBase64('SGVsbG8sIFdvcmxkIQ==')).toBe('Hello, World!');
  });

  it('handles UTF-8 characters', () => {
    const text = 'Hola mundo!';
    expect(decodeBase64(encodeBase64(text))).toBe(text);
    expect(decodeBase64(encodeBase64('Canción ñ 😀'))).toBe('Canción ñ 😀');
  });

  it('handles empty string', () => {
    expect(encodeBase64('')).toBe('');
    expect(decodeBase64('')).toBe('');
  });
});

describe('URL-safe variant', () => {
  it('uses - and _ and drops the padding', () => {
    expect(encodeBase64('¿?>', false)).toBe('wr8/Pg==');
    expect(encodeBase64('¿?>', true)).toBe('wr8_Pg');
  });

  it('decodes URL-safe input without padding', () => {
    expect(decodeBase64('wr8_Pg')).toBe('¿?>');
  });
});

describe('detectDirection', () => {
  it('decodes real Base64 text, even when wrapped over several lines', () => {
    expect(detectDirection('SGVsbG8sIFdvcmxkIQ==')).toBe('decode');
    expect(detectDirection('SGVsbG8s\nIFdvcmxkIQ==')).toBe('decode');
  });

  it('keeps plain words on encode even if they only use Base64 letters', () => {
    expect(detectDirection('hola')).toBe('encode');
    expect(detectDirection('test')).toBe('encode');
    expect(detectDirection('Word')).toBe('encode');
    expect(detectDirection('hello')).toBe('encode');
    expect(detectDirection('Hello, World!')).toBe('encode');
    expect(detectDirection('')).toBe('encode');
  });

  it('keeps Base64 of binary data on encode (it is not readable text)', () => {
    expect(detectDirection('iVBORw0KGgo=')).toBe('encode');
  });
});

describe('convert', () => {
  it('follows the detected direction in auto mode', () => {
    expect(convert('Hola', 'auto')).toEqual({ ok: true, direction: 'encode', output: 'SG9sYQ==' });
    expect(convert('SG9sYQ==', 'auto')).toEqual({ ok: true, direction: 'decode', output: 'Hola' });
  });

  it('lets the user force a direction', () => {
    expect(convert('SG9sYQ==', 'encode')).toEqual({
      ok: true,
      direction: 'encode',
      output: 'U0c5c1lRPT0=',
    });
  });

  it('explains why decoding failed', () => {
    expect(convert('no es base64!', 'decode')).toEqual({
      ok: false,
      direction: 'decode',
      error: 'invalid',
    });
    expect(convert('iVBORw0KGgo=', 'decode')).toEqual({
      ok: false,
      direction: 'decode',
      error: 'binary',
    });
  });
});

describe('files', () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  it('builds a data URI', () => {
    expect(toDataUri(png, 'image/png')).toBe('data:image/png;base64,iVBORw0KGgo=');
    expect(toDataUri(new Uint8Array([1]), '')).toBe('data:application/octet-stream;base64,AQ==');
  });

  it('reads a data URI or bare Base64 back into bytes and a type', () => {
    expect(parseBase64Payload('data:image/png;base64,iVBORw0KGgo=')).toEqual({
      bytes: png,
      mime: 'image/png',
    });
    expect(parseBase64Payload('iVBORw0KGgo=')).toEqual({ bytes: png, mime: 'image/png' });
    expect(parseBase64Payload('SG9sYQ==')).toEqual({
      bytes: new Uint8Array([72, 111, 108, 97]),
      mime: null,
    });
    expect(parseBase64Payload('%%%')).toBeNull();
    expect(parseBase64Payload('')).toBeNull();
  });

  it('recognises common file signatures', () => {
    expect(sniffMime(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(sniffMime(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]))).toBe('application/pdf');
    expect(
      sniffMime(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>')),
    ).toBe('image/svg+xml');
    expect(sniffMime(new Uint8Array([1, 2, 3]))).toBeNull();
  });

  it('picks a file extension', () => {
    expect(extensionFor('image/jpeg')).toBe('jpg');
    expect(extensionFor(null)).toBe('bin');
  });

  it('formats sizes', () => {
    expect(formatBytes(512, 'en')).toBe('512 B');
    expect(formatBytes(1536, 'en')).toBe('1.5 KB');
    expect(formatBytes(1536, 'es')).toBe('1,5 KB');
  });
});
