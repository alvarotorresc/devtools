import { describe, expect, it } from 'vitest';
import { convert, decodeUrl, detectDirection, encodeUrl, hasCredentials, parseUrl } from './logic';

describe('encodeUrl / decodeUrl', () => {
  it('encodes a component like encodeURIComponent (legacy behaviour)', () => {
    expect(encodeUrl('a b&c=d/é')).toBe('a%20b%26c%3Dd%2F%C3%A9');
    expect(decodeUrl('a%20b%26c%3Dd%2F%C3%A9')).toBe('a b&c=d/é');
  });

  it('keeps URL structure intact in encodeURI mode', () => {
    expect(encodeUrl('https://x.com/a b?q=1&r=é', 'uri')).toBe('https://x.com/a%20b?q=1&r=%C3%A9');
    expect(decodeUrl('a%2Fb%20c', 'uri')).toBe('a%2Fb c');
    expect(decodeUrl('a%2Fb%20c', 'component')).toBe('a/b c');
  });

  it('optionally reads + as a space (form data)', () => {
    expect(decodeUrl('a+b%2B', 'component', true)).toBe('a b+');
    expect(decodeUrl('a+b', 'component', false)).toBe('a+b');
  });

  it('throws on malformed escapes', () => {
    expect(() => decodeUrl('%E0%A4%A')).toThrow(URIError);
  });
});

describe('detectDirection', () => {
  it('decodes when there are %XX escapes', () => {
    expect(detectDirection('hello%20world')).toBe('decode');
    expect(detectDirection('https://x.com/?q=caf%C3%A9')).toBe('decode');
  });

  it('encodes plain text, including a lone percent sign', () => {
    expect(detectDirection('a b&c')).toBe('encode');
    expect(detectDirection('100% real')).toBe('encode');
    expect(detectDirection('')).toBe('encode');
  });
});

describe('convert', () => {
  it('uses the detected direction in auto mode', () => {
    expect(convert('a b', 'auto', 'component')).toEqual({
      ok: true,
      direction: 'encode',
      output: 'a%20b',
    });
    expect(convert('a%20b', 'auto', 'component')).toEqual({
      ok: true,
      direction: 'decode',
      output: 'a b',
    });
  });

  it('lets the user force encoding of already-encoded text', () => {
    expect(convert('a%20b', 'encode', 'component')).toEqual({
      ok: true,
      direction: 'encode',
      output: 'a%2520b',
    });
  });

  it('reports malformed input instead of throwing', () => {
    expect(convert('%E0%A4%A', 'auto', 'component')).toEqual({
      ok: false,
      direction: 'decode',
      error: 'malformed',
    });
  });
});

describe('parseUrl', () => {
  it('splits every part and decodes the query parameters', () => {
    const p = parseUrl(
      'https://ana:secreto@api.example.com:8443/v1/buscar%20algo?q=caf%C3%A9&tag=a&tag=b&x=1+2#sección',
    );
    expect(p).toMatchObject({
      protocol: 'https:',
      username: 'ana',
      password: '•••••••',
      hostname: 'api.example.com',
      port: '8443',
      defaultPort: '443',
      pathname: '/v1/buscar algo',
      hash: '#sección',
      assumedScheme: false,
    });
    expect(p!.params).toEqual([
      ['q', 'café'],
      ['tag', 'a'],
      ['tag', 'b'],
      ['x', '1 2'],
    ]);
  });

  it('shows the default port when none is written', () => {
    const p = parseUrl('http://example.com/');
    expect(p!.port).toBe('');
    expect(p!.defaultPort).toBe('80');
  });

  it('assumes https when the scheme is missing', () => {
    const p = parseUrl('example.com/a?b=1');
    expect(p!.assumedScheme).toBe(true);
    expect(p!.hostname).toBe('example.com');
    expect(p!.params).toEqual([['b', '1']]);
    const local = parseUrl('localhost:3000/api');
    expect(local).toMatchObject({
      hostname: 'localhost',
      port: '3000',
      pathname: '/api',
      assumedScheme: true,
    });
  });

  it('keeps malformed escapes in the path as they are', () => {
    expect(parseUrl('https://x.com/a%ZZb')!.pathname).toBe('/a%ZZb');
  });

  it('returns null for text that is not a URL', () => {
    expect(parseUrl('')).toBeNull();
    expect(parseUrl('http://')).toBeNull();
    expect(parseUrl('not a url')).toBeNull();
  });
});

describe('hasCredentials', () => {
  it('spots user:pass@ in plain and percent-encoded URLs', () => {
    expect(hasCredentials('https://ana:s3cret@x.com/a')).toBe(true);
    expect(hasCredentials('see ftp://u:p@host')).toBe(true);
    expect(hasCredentials('https%3A%2F%2Fana%3As3cret%40x.com')).toBe(true);
  });

  it('ignores URLs without a password', () => {
    expect(hasCredentials('https://x.com/a?mail=a@b.com')).toBe(false);
    expect(hasCredentials('https://ana@x.com')).toBe(false);
    expect(hasCredentials('https://x.com:8080/a')).toBe(false);
    expect(hasCredentials('%E0%A4%A')).toBe(false);
  });
});
