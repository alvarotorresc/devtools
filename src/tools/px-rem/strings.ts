import type { Locale } from '../types';

export const strings = {
  es: {
    base: 'Tamaño base (px)',
    baseHelp: 'El font-size de html. Casi siempre 16.',
    parent: 'Tamaño del padre (px)',
    parentHelp: 'Para em. Vacío = igual que la base.',
    px: 'px',
    rem: 'rem',
    em: 'em',
    invalid: 'Escribe un número, por ejemplo 1.5.',
    baseZero: 'El tamaño base debe ser mayor que 0.',
    parentZero: 'El tamaño del padre debe ser mayor que 0.',
    css: 'CSS',
    table: 'Tamaños habituales',
    copyRem: 'Copiar {v}rem',
  },
  en: {
    base: 'Base size (px)',
    baseHelp: 'The html font-size. Almost always 16.',
    parent: 'Parent size (px)',
    parentHelp: 'For em. Empty = same as the base.',
    px: 'px',
    rem: 'rem',
    em: 'em',
    invalid: 'Type a number, for example 1.5.',
    baseZero: 'The base size must be greater than 0.',
    parentZero: 'The parent size must be greater than 0.',
    css: 'CSS',
    table: 'Common sizes',
    copyRem: 'Copy {v}rem',
  },
} satisfies Record<Locale, Record<string, string>>;
