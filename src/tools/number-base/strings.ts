import type { Locale } from '../types';

export const strings = {
  es: {
    bin: 'Binario (base 2)',
    oct: 'Octal (base 8)',
    dec: 'Decimal (base 10)',
    hex: 'Hexadecimal (base 16)',
    custom: 'Base {b}',
    customBase: 'Base personalizada',
    grouping: 'Agrupar dígitos',
    invalid: 'Hay dígitos que no existen en base {b}. Usa solo {digits}.',
    bits: '{n} bits',
    empty: 'Escribe un número en cualquiera de los campos.',
    summary: 'Tamaño',
    digitsLetters: '0-9 y a-{last}',
  },
  en: {
    bin: 'Binary (base 2)',
    oct: 'Octal (base 8)',
    dec: 'Decimal (base 10)',
    hex: 'Hexadecimal (base 16)',
    custom: 'Base {b}',
    customBase: 'Custom base',
    grouping: 'Group digits',
    invalid: 'Some digits do not exist in base {b}. Use only {digits}.',
    bits: '{n} bits',
    empty: 'Type a number in any of the fields.',
    summary: 'Size',
    digitsLetters: '0-9 and a-{last}',
  },
} satisfies Record<Locale, Record<string, string>>;
