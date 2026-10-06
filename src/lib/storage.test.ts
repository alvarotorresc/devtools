import { afterEach, describe, expect, it, vi } from 'vitest';
import { readJSON, readString, rememberLocale, removeKey, writeJSON, writeString } from './storage';

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

describe('rememberLocale', () => {
  function setup(protocol: string) {
    const ls = memoryStorage();
    const doc = { cookie: '' };
    vi.stubGlobal('localStorage', ls);
    vi.stubGlobal('document', doc);
    vi.stubGlobal('location', { protocol });
    return { ls, doc };
  }

  it('stores the locale and sets the nf_lang cookie Netlify reads on "/"', () => {
    const { ls, doc } = setup('https:');
    rememberLocale('en');
    expect(ls.getItem('devtools:locale')).toBe('en');
    expect(doc.cookie).toBe('nf_lang=en; path=/; max-age=31536000; SameSite=Lax; Secure');
  });

  it('leaves out Secure over plain http', () => {
    const { doc } = setup('http:');
    rememberLocale('es');
    expect(doc.cookie).toBe('nf_lang=es; path=/; max-age=31536000; SameSite=Lax');
  });

  it('ignores anything that is not a locale', () => {
    const { ls, doc } = setup('https:');
    rememberLocale('fr');
    rememberLocale('');
    expect(ls.getItem('devtools:locale')).toBeNull();
    expect(doc.cookie).toBe('');
  });
});
