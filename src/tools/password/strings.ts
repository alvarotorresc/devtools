import type { Locale } from '../types';

export const strings = {
  es: {
    length: 'Longitud',
    count: 'Cantidad',
    lower: 'Minúsculas (a–z)',
    upper: 'Mayúsculas (A–Z)',
    digits: 'Números (0–9)',
    symbols: 'Símbolos (!@#…)',
    excludeAmbiguous: 'Excluir caracteres ambiguos (0 O o 1 l I |)',
    result: 'Contraseñas',
    weak: 'Débil',
    fair: 'Aceptable',
    strong: 'Fuerte',
    bits: '{bits} bits de entropía',
    entropyNote:
      'Entropía = longitud × log2(caracteres posibles). Incluir uno de cada tipo la reduce muy poco.',
    noSets: 'Elige al menos un tipo de carácter',
    tooShort: 'Con {sets} tipos de carácter, la longitud mínima es {sets}',
    notSaved:
      'Las contraseñas no se guardan nunca, ni en este navegador. Solo se recuerdan las opciones.',
    copyAll: 'Copiar',
    copyOne: 'Copiar contraseña {n}',
  },
  en: {
    length: 'Length',
    count: 'Quantity',
    lower: 'Lowercase (a–z)',
    upper: 'Uppercase (A–Z)',
    digits: 'Numbers (0–9)',
    symbols: 'Symbols (!@#…)',
    excludeAmbiguous: 'Exclude look-alike characters (0 O o 1 l I |)',
    result: 'Passwords',
    weak: 'Weak',
    fair: 'Acceptable',
    strong: 'Strong',
    bits: '{bits} bits of entropy',
    entropyNote:
      'Entropy = length × log2(possible characters). Requiring one of each type lowers it only very slightly.',
    noSets: 'Pick at least one character type',
    tooShort: 'With {sets} character types, the minimum length is {sets}',
    notSaved:
      'Passwords are never stored, not even in this browser. Only the options are remembered.',
    copyAll: 'Copy',
    copyOne: 'Copy password {n}',
  },
} satisfies Record<Locale, Record<string, string>>;
