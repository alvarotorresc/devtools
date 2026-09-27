import { describe, expect, it } from 'vitest';
import {
  detectDirection,
  extractQuery,
  hasSensitiveKey,
  jsonToQuery,
  queryToJson,
  shouldSave,
} from './logic';

const on = { brackets: true, detectTypes: false };
const off = { brackets: false, detectTypes: false };
// Plain objects make the assertions easy to read; the real result has no prototype.
const plain = (v: unknown) => JSON.parse(JSON.stringify(v));

describe('extractQuery', () => {
  it('takes the search of a URL, the text after ? or the bare query, without the fragment', () => {
    expect(extractQuery('https://a.test/p?x=1&y=2#top')).toBe('x=1&y=2');
    expect(extractQuery('?a=1')).toBe('a=1');
    expect(extractQuery('a=1#b')).toBe('a=1');
    expect(extractQuery('https://a.test/p')).toBe('');
  });
});

describe('queryToJson', () => {
  it('matches the e2e example: repeated keys and brackets', () => {
    expect(plain(queryToJson('?a=1&b=2&b=3&c[d]=x', on).value)).toEqual({
      a: '1',
      b: ['2', '3'],
      c: { d: 'x' },
    });
  });

  it('reads a[]=1&a[]=2 as an array and nests a[b][c]', () => {
    expect(plain(queryToJson('a[]=1&a[]=2&u[n][e]=Ana', on).value)).toEqual({
      a: ['1', '2'],
      u: { n: { e: 'Ana' } },
    });
  });

  it('keeps bracketed keys literally when bracket notation is off', () => {
    expect(plain(queryToJson('c[d]=x', off).value)).toEqual({ 'c[d]': 'x' });
  });

  it('decodes + as a space and percent sequences', () => {
    const r = queryToJson('nombre=Ana+Mar%C3%ADa&mi%20clave=a%26b', on);
    expect(plain(r.value)).toEqual({ nombre: 'Ana María', 'mi clave': 'a&b' });
    expect(r.pairs).toEqual([
      ['nombre', 'Ana María'],
      ['mi clave', 'a&b'],
    ]);
  });

  it('leaves broken percent sequences as they are and reports them', () => {
    const r = queryToJson('a=%E0%A4&b=%C3%A9', on);
    expect(plain(r.value)).toEqual({ a: '%E0%A4', b: 'é' });
    expect(r.undecodable).toEqual(['%E0%A4']);
  });

  it('handles "?" alone, empty pairs and keys without "="', () => {
    expect(plain(queryToJson('?', on).value)).toEqual({});
    expect(plain(queryToJson('a=1&&b=2&flag', on).value)).toEqual({ a: '1', b: '2', flag: '' });
  });

  it('detects numbers and booleans only when asked, keeping leading zeros as text', () => {
    expect(
      plain(queryToJson('n=42&f=-1.5&z=007&t=true&e=', { ...on, detectTypes: true }).value),
    ).toEqual({
      n: 42,
      f: -1.5,
      z: '007',
      t: true,
      e: '',
    });
  });

  it('is safe against prototype pollution', () => {
    const r = queryToJson('__proto__[polluted]=1&constructor[prototype][x]=2', on);
    expect(Object.getPrototypeOf(r.value)).toBeNull();
    expect(Object.keys(r.value)).toEqual(['__proto__', 'constructor']);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(({} as Record<string, unknown>).x).toBeUndefined();
    expect(JSON.stringify(r.value)).toBe(
      '{"__proto__":{"polluted":"1"},"constructor":{"prototype":{"x":"2"}}}',
    );
  });

  it('falls back to the literal key when brackets clash with an earlier value', () => {
    expect(plain(queryToJson('a=1&a[b]=2', on).value)).toEqual({ a: '1', 'a[b]': '2' });
  });
});

describe('jsonToQuery', () => {
  it('writes primitives, null, arrays and nested objects', () => {
    expect(
      jsonToQuery(
        { q: 'café con leche', n: 3, ok: true, vacio: null, tags: ['a', 'b'], u: { id: 7 } },
        { brackets: true, plusForSpace: false },
      ),
    ).toEqual({
      ok: true,
      query: 'q=caf%C3%A9%20con%20leche&n=3&ok=true&vacio=&tags[]=a&tags[]=b&u[id]=7',
    });
  });

  it('repeats keys for arrays without brackets and can use + for spaces', () => {
    expect(jsonToQuery({ t: ['a b', 'c'] }, { brackets: false, plusForSpace: true })).toEqual({
      ok: true,
      query: 't=a+b&t=c',
    });
  });

  it('round-trips with queryToJson', () => {
    const value = { a: '1', b: ['2', '3'], c: { d: 'x & y' } };
    const r = jsonToQuery(value, { brackets: true, plusForSpace: false });
    expect(r.ok && plain(queryToJson(r.query, on).value)).toEqual(value);
  });

  it('needs an object at the top level', () => {
    expect(jsonToQuery([1, 2], { brackets: true, plusForSpace: false })).toEqual({
      ok: false,
      error: 'not-object',
    });
  });
});

describe('direction and saving', () => {
  it('reads JSON when the input starts with {', () => {
    expect(detectDirection('  {"a":1}')).toBe('toQuery');
    expect(detectDirection('a=1')).toBe('toJson');
  });

  it('refuses to save inputs whose keys look like credentials', () => {
    expect(hasSensitiveKey('?token=abc')).toBe(true);
    expect(hasSensitiveKey('https://a.test/?user=ana&api_key=1')).toBe(true);
    expect(hasSensitiveKey('{"auth": {"x": 1}}')).toBe(true);
    expect(hasSensitiveKey('{"session":')).toBe(true);
    expect(hasSensitiveKey('?page=2&sort=name')).toBe(false);
  });

  it('refuses to save a URL that carries userinfo credentials, same rule as the url tool (I1)', () => {
    expect(shouldSave('https://admin:hunter2@api.example.com/v1?page=1')).toBe(false);
    expect(shouldSave('https://api.example.com/v1?page=1')).toBe(true);
    expect(shouldSave('?page=2&sort=name')).toBe(true);
  });
});
