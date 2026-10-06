import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'diff',
  category: 'data',
  icon: 'diff',
  slug: { es: 'comparar-textos', en: 'text-diff-checker' },
  name: { es: 'Comparar textos', en: 'Text diff' },
  title: {
    es: 'Comparar dos textos online: diferencias',
    en: 'Compare two texts online: line-by-line diff',
  },
  heading: {
    es: 'Comparar dos textos',
    en: 'Compare two texts',
  },
  description: {
    es: 'Compara dos textos y marca las líneas añadidas y quitadas y las palabras que cambian. Vista unificada o en paralelo, ignorando espacios o mayúsculas.',
    en: 'Compare two texts and highlight added and removed lines and the words that changed. Unified or side-by-side view, ignoring spaces or case.',
  },
  keywords: {
    es: [
      'comparar textos',
      'diff',
      'diferencias entre textos',
      'comparar archivos',
      'diff online',
      'comparar codigo',
    ],
    en: [
      'text diff',
      'diff checker',
      'compare text',
      'compare files',
      'diff online',
      'compare code',
    ],
  },
};
