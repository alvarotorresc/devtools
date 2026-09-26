import type { Locale } from '../types';

export const strings = {
  es: {
    input: 'Texto o HTML',
    placeholder: '<p class="saludo">Hola & adiós</p>',
    scope: 'Qué codificar',
    minimal: 'Mínimo (& < > " \')',
    nonascii: 'Además todo lo no-ASCII',
    result: 'Resultado',
    encoded: 'Codificado',
    decoded: 'Decodificado',
    empty: 'Escribe texto o pega HTML con entidades y el resultado aparecerá aquí.',
    unknown: 'Las entidades que no reconoce (por ejemplo &inventada;) se dejan tal cual.',
  },
  en: {
    input: 'Text or HTML',
    placeholder: '<p class="greeting">Hello & goodbye</p>',
    scope: 'What to encode',
    minimal: 'Minimal (& < > " \')',
    nonascii: 'Plus everything non-ASCII',
    result: 'Result',
    encoded: 'Encoded',
    decoded: 'Decoded',
    empty: 'Type text or paste HTML with entities and the result will appear here.',
    unknown: 'Entities it does not know (for example &madeup;) are left as they are.',
  },
} satisfies Record<Locale, Record<string, string>>;
