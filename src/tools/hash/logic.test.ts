import { describe, expect, it } from 'vitest';
import {
  ALGORITHMS,
  computeHash,
  findMatch,
  hashAll,
  md5,
  normalizeHex,
  shouldDebounce,
} from './logic';

describe('md5 (RFC 1321 test suite)', () => {
  it.each([
    ['', 'd41d8cd98f00b204e9800998ecf8427e'],
    ['a', '0cc175b9c0f1b6a831c399e269772661'],
    ['abc', '900150983cd24fb0d6963f7d28e17f72'],
    ['message digest', 'f96b697d7cb7938d525a2f31aaf161d0'],
    ['abcdefghijklmnopqrstuvwxyz', 'c3fcd3d76192e4007dfb496cca67e13b'],
    [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      'd174ab98d277d9f5a5611c2c9f419d9f',
    ],
    [
      '12345678901234567890123456789012345678901234567890123456789012345678901234567890',
      '57edf4a22be3c955ac49da2e2107b67a',
    ],
  ])('md5(%j)', (input, expected) => {
    expect(md5(input)).toBe(expected);
  });

  it('handles the padding edge cases around one block', () => {
    expect(md5('a'.repeat(55))).toBe('ef1772b6dff9a122358552954ad0df65');
    expect(md5('a'.repeat(56))).toBe('3b0c8ac703f828b04c6c197006d17218');
    expect(md5('a'.repeat(64))).toBe('014842d480b571495a4a0363793f7367');
  });

  it('hashes UTF-8 bytes and long inputs', () => {
    expect(md5('ñandú')).toBe('97e5094e8302a2129151f075165779e2');
    expect(md5('a'.repeat(1_000_000))).toBe('7707d6ae4e027c70eea2a935c2296f21');
    expect(md5(new TextEncoder().encode('abc'))).toBe(md5('abc'));
  });
});

describe('SHA family (WebCrypto)', () => {
  it('matches the FIPS 180 "abc" vectors', async () => {
    expect(await computeHash('SHA-1', 'abc')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
    expect(await computeHash('SHA-256', 'abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    expect(await computeHash('SHA-384', 'abc')).toBe(
      'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7',
    );
    expect(await computeHash('SHA-512', 'abc')).toBe(
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    );
  });

  it('hashes the empty string', async () => {
    expect(await computeHash('SHA-256', '')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });
});

describe('hashAll', () => {
  it('returns every algorithm in order', async () => {
    const h = await hashAll('abc');
    expect(Object.keys(h)).toEqual(ALGORITHMS);
    expect(h.MD5).toBe('900150983cd24fb0d6963f7d28e17f72');
  });
});

describe('compare', () => {
  it('normalizes pasted hashes', () => {
    expect(normalizeHex('  0x90:01:50 98 ')).toBe('90015098');
    expect(normalizeHex('BA78-16BF')).toBe('ba7816bf');
  });

  it('finds which algorithm matches', async () => {
    const h = await hashAll('abc');
    expect(findMatch('900150983CD24FB0D6963F7D28E17F72', h)).toBe('MD5');
    expect(findMatch(h['SHA-512'], h)).toBe('SHA-512');
    expect(findMatch('deadbeef', h)).toBeNull();
    expect(findMatch('   ', h)).toBeNull();
  });
});

describe('shouldDebounce', () => {
  it('debounces only large inputs', () => {
    expect(shouldDebounce(100)).toBe(false);
    expect(shouldDebounce(20_001)).toBe(true);
  });
});
