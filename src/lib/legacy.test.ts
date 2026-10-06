import { describe, expect, it, vi } from 'vitest';

vi.mock('../tools/registry', () => ({
  toolById: (id: string) =>
    id === 'json'
      ? { id: 'json', slug: { es: 'formateador-json', en: 'json-formatter' } }
      : undefined,
}));

const { resolveLegacyHash } = await import('./legacy');

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
