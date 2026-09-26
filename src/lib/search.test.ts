import { describe, expect, it } from 'vitest';
import { normalize, scoreField, search, type SearchDoc } from './search';

const docs: SearchDoc[] = [
  {
    id: 'json',
    primary: ['json', 'formateador json', 'json formatter', 'prettify'],
    secondary: ['formatea y valida json'],
  },
  {
    id: 'jwt',
    primary: ['jwt', 'decodificador jwt', 'jwt decoder', 'token'],
    secondary: ['lee cabecera y payload de un json web token'],
  },
  {
    id: 'dni',
    primary: ['dni y nie', 'dni nie validator', 'letra dni'],
    secondary: ['comprueba documentos de identidad'],
  },
  { id: 'enc', primary: ['codificacion', 'encoding'], secondary: [] },
];

describe('normalize', () => {
  it('lowercases and strips accents', () => {
    expect(normalize('  Codificación ÚNICA ')).toBe('codificacion unica');
  });
});

describe('scoreField', () => {
  it('prefers prefix over inner substring', () => {
    expect(scoreField('json', 'json formatter')).toBeGreaterThan(
      scoreField('json', 'formateador json'),
    );
  });

  it('matches a single adjacent transposition', () => {
    expect(scoreField('jsno', 'json')).toBeGreaterThan(0);
  });

  it('matches compact subsequences but not scattered letters', () => {
    expect(scoreField('jfmt', 'json formatter')).toBe(0);
    expect(scoreField('frmt', 'formatter')).toBeGreaterThan(0);
  });

  it('returns 0 for no match or empty query', () => {
    expect(scoreField('xyz', 'json')).toBe(0);
    expect(scoreField('', 'json')).toBe(0);
  });
});

describe('search', () => {
  it('ranks the exact name first', () => {
    expect(search(docs, 'json')[0]).toBe('json');
  });

  it('finds a tool with a typo', () => {
    expect(search(docs, 'jsno')).toContain('json');
  });

  it('requires every word to match somewhere', () => {
    expect(search(docs, 'letra dni')).toEqual(['dni']);
  });

  it('is accent-insensitive in both directions', () => {
    expect(search(docs, 'codificación')).toEqual(['enc']);
  });

  it('ranks name matches above description-only matches', () => {
    const ids = search(docs, 'json');
    expect(ids.indexOf('json')).toBeLessThan(ids.indexOf('jwt'));
  });

  it('returns nothing for an empty query', () => {
    expect(search(docs, '   ')).toEqual([]);
  });

  it('respects the limit', () => {
    expect(search(docs, 'j', 1)).toHaveLength(1);
  });
});
