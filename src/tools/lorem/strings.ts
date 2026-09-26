import type { Locale } from '../types';

export const strings = {
  es: {
    unit: 'Unidad',
    count: 'Cantidad',
    startClassic: 'Empezar con «Lorem ipsum dolor sit amet…»',
    format: 'Formato',
    plain: 'Texto',
    html: 'HTML (<p>)',
    result: 'Texto generado',
    summary: '{words} palabras · {chars} caracteres',
    fileTxt: 'lorem-ipsum.txt',
    fileHtml: 'lorem-ipsum.html',
  },
  en: {
    unit: 'Unit',
    count: 'Count',
    startClassic: 'Start with “Lorem ipsum dolor sit amet…”',
    format: 'Format',
    plain: 'Text',
    html: 'HTML (<p>)',
    result: 'Generated text',
    summary: '{words} words · {chars} characters',
    fileTxt: 'lorem-ipsum.txt',
    fileHtml: 'lorem-ipsum.html',
  },
} satisfies Record<Locale, Record<string, string>>;
