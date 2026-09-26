import { describe, expect, it, vi } from 'vitest';

vi.mock('../tools/registry', () => ({
  toolById: (id: string) =>
    id === 'json'
      ? { id: 'json', slug: { es: 'formateador-json', en: 'json-formatter' } }
      : undefined,
}));

const { pickLocale, resolveLegacyHash } = await import('./legacy');

describe('pickLocale', () => {
  it('prefers a stored valid locale', () => {
    expect(pickLocale('en', ['es-ES'])).toBe('en');
  });

  it('ignores an invalid stored value and uses the browser languages', () => {
    expect(pickLocale('fr', ['fr-FR', 'en-GB', 'es'])).toBe('en');
  });

  it('falls back to Spanish', () => {
    expect(pickLocale(null, ['de-DE'])).toBe('es');
    expect(pickLocale(null, [])).toBe('es');
  });
});

describe('resolveLegacyHash', () => {
  it('maps an old #id to the new tool page', () => {
    expect(resolveLegacyHash('#json', 'es')).toBe('/es/formateador-json');
    expect(resolveLegacyHash('#json', 'en')).toBe('/en/json-formatter');
  });

  it('sends unknown or not-yet-migrated tools to the home page, never to a 404', () => {
    expect(resolveLegacyHash('#number-base', 'es')).toBe('/es');
    expect(resolveLegacyHash('#url', 'en')).toBe('/en');
    expect(resolveLegacyHash('', 'en')).toBe('/en');
    expect(resolveLegacyHash('#', 'es')).toBe('/es');
  });
});
