import { describe, expect, it } from 'vitest';
import { rootLocale, rootRedirect } from './root-language';

describe('rootLocale', () => {
  it('follows the browser language, region subtags included', () => {
    expect(rootLocale(null, 'es-ES')).toBe('es');
    expect(rootLocale(null, 'es')).toBe('es');
    expect(rootLocale(null, 'es-ES,es;q=0.9,en;q=0.8')).toBe('es');
    expect(rootLocale(null, 'en-US')).toBe('en');
  });

  it('respects q-values instead of picking any listed language', () => {
    expect(rootLocale(null, 'en-US,es;q=0.8')).toBe('en');
    expect(rootLocale(null, 'es;q=0.5,en;q=0.9')).toBe('en');
    expect(rootLocale(null, 'fr-FR,es;q=0.9,en;q=0.8')).toBe('es');
    expect(rootLocale(null, 'es;q=0,en-GB')).toBe('en');
  });

  it('defaults to English with no header or no es/en in it', () => {
    expect(rootLocale(null, null)).toBe('en');
    expect(rootLocale(null, '')).toBe('en');
    expect(rootLocale(null, 'de-DE')).toBe('en');
    expect(rootLocale(null, '*')).toBe('en');
  });

  it('lets the nf_lang cookie override the header', () => {
    expect(rootLocale('nf_lang=en', 'es-ES')).toBe('en');
    expect(rootLocale('a=1; nf_lang=es; b=2', 'en-US')).toBe('es');
    expect(rootLocale('nf_lang=fr', 'es-ES')).toBe('es');
    expect(rootLocale('xnf_lang=en', 'es-ES')).toBe('es');
  });
});

describe('rootRedirect', () => {
  it('answers a 302 no cache may share between visitors', () => {
    const res = rootRedirect(
      new Request('https://devtools.alvarotc.com/?utm_source=x', {
        headers: { 'accept-language': 'es-ES' },
      }),
    );
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://devtools.alvarotc.com/es?utm_source=x');
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(res.headers.get('vary')).toBe('Accept-Language, Cookie');
  });
});
