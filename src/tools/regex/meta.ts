import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'regex',
  category: 'data',
  icon: 'regex',
  slug: { es: 'probador-regex', en: 'regex-tester' },
  name: { es: 'Regex', en: 'Regex' },
  title: {
    es: 'Probador de regex online: expresiones regulares',
    en: 'Regex tester online: matches, groups, replace',
  },
  heading: {
    es: 'Probador de regex',
    en: 'Regex tester',
  },
  description: {
    es: 'Prueba expresiones regulares de JavaScript: resalta coincidencias, muestra grupos con nombre, reemplaza con $1 y explica los errores de sintaxis.',
    en: 'Test JavaScript regular expressions: highlight matches, list named groups, replace with $1 and get syntax errors explained in plain words.',
  },
  keywords: {
    es: [
      'regex',
      'expresiones regulares',
      'probar regex',
      'regexp javascript',
      'grupos de captura',
      'reemplazar regex',
    ],
    en: [
      'regex',
      'regular expressions',
      'regex tester',
      'javascript regexp',
      'capture groups',
      'regex replace',
    ],
  },
  tabs: { es: ['Buscar', 'Reemplazar'], en: ['Find', 'Replace'] },
};
