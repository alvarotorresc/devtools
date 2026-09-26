import { afterEach, describe, expect, it, vi } from 'vitest';
import { readJSON, readString, removeKey, writeJSON, writeString } from './storage';

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => void map.delete(k),
    setItem: (k, v) => void map.set(k, String(v)),
  };
}

function throwingStorage(): Storage {
  const boom = () => {
    throw new DOMException('blocked', 'SecurityError');
  };
  return { length: 0, clear: boom, getItem: boom, key: boom, removeItem: boom, setItem: boom };
}

afterEach(() => vi.unstubAllGlobals());

describe('storage', () => {
  it('reads and writes strings with the devtools: prefix', () => {
    const ls = memoryStorage();
    vi.stubGlobal('localStorage', ls);
    writeString('theme', 'dark');
    expect(ls.getItem('devtools:theme')).toBe('dark');
    expect(readString('theme', 'terminal')).toBe('dark');
  });

  it('round-trips JSON and returns the fallback on corrupt data', () => {
    const ls = memoryStorage();
    vi.stubGlobal('localStorage', ls);
    writeJSON('favorites', ['json']);
    expect(readJSON('favorites', [])).toEqual(['json']);
    ls.setItem('devtools:favorites', '{not json');
    expect(readJSON('favorites', ['x'])).toEqual(['x']);
  });

  it('uses sessionStorage when asked', () => {
    const ss = memoryStorage();
    vi.stubGlobal('sessionStorage', ss);
    writeString('booted', '1', 'session');
    expect(ss.getItem('devtools:booted')).toBe('1');
  });

  it('never throws when storage is missing', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(readString('theme', 'terminal')).toBe('terminal');
    expect(() => writeString('theme', 'dark')).not.toThrow();
    expect(() => removeKey('theme')).not.toThrow();
  });

  it('never throws when storage access throws (private mode)', () => {
    vi.stubGlobal('localStorage', throwingStorage());
    expect(readJSON('recent', [])).toEqual([]);
    expect(() => writeJSON('recent', ['json'])).not.toThrow();
  });
});
