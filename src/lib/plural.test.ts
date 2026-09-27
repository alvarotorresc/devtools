import { describe, expect, it } from 'vitest';
import { plural } from './plural';

describe('plural', () => {
  it('picks the singular and fills {n} only for exactly 1', () => {
    expect(plural('es', 1, '{n} válido', '{n} válidos')).toBe('1 válido');
    expect(plural('en', 1, '{n} valid', '{n} valid')).toBe('1 valid');
  });

  it('picks the plural for 0 and for more than 1, in both locales', () => {
    expect(plural('es', 0, '{n} válido', '{n} válidos')).toBe('0 válidos');
    expect(plural('es', 2, '{n} válido', '{n} válidos')).toBe('2 válidos');
    expect(plural('en', 0, '{n} valid', '{n} valids')).toBe('0 valids');
    expect(plural('en', 2, '{n} valid', '{n} valids')).toBe('2 valids');
  });
});
