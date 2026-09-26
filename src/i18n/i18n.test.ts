import { describe, expect, it } from 'vitest';
import { en } from './en';
import { es } from './es';
import { homeHref, isLocale, otherLocale, t, toolHref } from './index';
import type { ToolMeta } from '../tools/types';

describe('i18n', () => {
  it('has the same keys in both dictionaries', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
  });

  it('has no empty strings', () => {
    for (const dict of [es, en]) {
      for (const [k, v] of Object.entries(dict)) expect(v, k).not.toBe('');
    }
  });

  it('interpolates variables', () => {
    expect(t('es', 'home.count', { n: 2 })).toContain('2');
  });

  it('builds routes', () => {
    const meta = { slug: { es: 'formateador-json', en: 'json-formatter' } } as ToolMeta;
    expect(toolHref('es', meta)).toBe('/es/formateador-json');
    expect(toolHref('en', meta)).toBe('/en/json-formatter');
    expect(homeHref('en')).toBe('/en');
    expect(otherLocale('es')).toBe('en');
    expect(isLocale('es')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });
});
