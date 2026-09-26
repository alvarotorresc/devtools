import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'text',
  category: 'data',
  icon: 'case-sensitive',
  slug: { es: 'convertir-mayusculas-minusculas', en: 'text-case-converter' },
  name: { es: 'Mayúsculas y líneas', en: 'Case and lines' },
  title: {
    es: 'Convertir mayúsculas, camelCase y snake_case y ordenar líneas',
    en: 'Text case converter: camelCase, snake_case and line tools',
  },
  description: {
    es: 'Pasa un texto a las diez formas a la vez (MAYÚSCULAS, camelCase, snake_case, kebab-case…) y ordena, limpia o numera líneas. Con contador de caracteres.',
    en: 'Convert text into ten cases at once (UPPER, camelCase, snake_case, kebab-case…) and sort, clean up or number lines. With a character counter.',
  },
  keywords: {
    es: [
      'mayusculas a minusculas',
      'camelcase',
      'snake case',
      'kebab case',
      'ordenar lineas',
      'quitar duplicados',
      'contar caracteres',
    ],
    en: [
      'case converter',
      'camelcase',
      'snake case',
      'kebab case',
      'sort lines',
      'remove duplicate lines',
      'character count',
    ],
  },
  tabs: { es: ['Mayúsculas', 'Líneas'], en: ['Case', 'Lines'] },
};
