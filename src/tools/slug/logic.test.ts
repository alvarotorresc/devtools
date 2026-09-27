import { describe, expect, it } from 'vitest';
import { slugify, slugifyLines, type SlugOptions } from './logic';

const es: SlugOptions = {
  separator: '-',
  lowercase: true,
  ampersand: true,
  maxLength: null,
  locale: 'es',
};

describe('slugify', () => {
  it('matches the spec examples', () => {
    expect(slugify('¡Hola, Mundo! Año 2026', es)).toBe('hola-mundo-ano-2026');
    expect(slugify('Straße & Co', es)).toBe('strasse-y-co');
    expect(slugify('Ærøskøbing', es)).toBe('aeroskobing');
  });

  it('uses "and" for & in English, or drops it when the toggle is off', () => {
    expect(slugify('Straße & Co', { ...es, locale: 'en' })).toBe('strasse-and-co');
    expect(slugify('Straße & Co', { ...es, ampersand: false })).toBe('strasse-co');
  });

  it('turns letters that NFKD does not split into plain letters', () => {
    expect(slugify('Łódź, Þórr, Œuvre, Đakovo', es)).toBe('lodz-thorr-oeuvre-dakovo');
  });

  it('drops emojis and symbols', () => {
    expect(slugify('Café ☕ con 🎉 amigos!!', es)).toBe('cafe-con-amigos');
  });

  it('gives an empty slug when no Latin character is left', () => {
    expect(slugify('東京', es)).toBe('');
    expect(slugify('🎉🎉', es)).toBe('');
  });

  it('keeps case and uses the chosen separator', () => {
    expect(slugify('Mi Título Largo', { ...es, lowercase: false, separator: '_' })).toBe(
      'Mi_Titulo_Largo',
    );
    expect(slugify('  versión 1.2 final ', { ...es, separator: '.' })).toBe('version.1.2.final');
  });

  it('cuts at the last separator before the limit, without splitting words', () => {
    const opts = { ...es, maxLength: 12 };
    expect(slugify('hola mundo cruel', opts)).toBe('hola-mundo');
    expect(slugify('hola mundo', { ...es, maxLength: 10 })).toBe('hola-mundo');
    expect(slugify('hola mundo cruel', { ...es, maxLength: 10 })).toBe('hola-mundo');
    expect(slugify('supercalifragilistico es largo', { ...es, maxLength: 8 })).toBe('supercal');
  });
});

describe('slugifyLines', () => {
  it('gives one slug per non-empty line', () => {
    expect(slugifyLines('Primera línea\n\n  \nSegunda & última\r\n', es)).toEqual([
      { input: 'Primera línea', slug: 'primera-linea' },
      { input: 'Segunda & última', slug: 'segunda-y-ultima' },
    ]);
  });
});
