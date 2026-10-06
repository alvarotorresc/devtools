import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-diff',
  category: 'data',
  icon: 'git-compare-arrows',
  slug: { es: 'comparar-json', en: 'json-diff' },
  name: { es: 'Comparar JSON', en: 'JSON diff' },
  title: {
    es: 'Comparar dos JSON: diferencias sin orden',
    en: 'JSON diff: compare two JSON by structure',
  },
  heading: {
    es: 'Comparar dos JSON',
    en: 'JSON diff',
  },
  description: {
    es: 'Compara dos JSON por estructura y lista las claves añadidas, eliminadas y cambiadas con su ruta, sin que importe el orden de las claves. En tu navegador.',
    en: 'Compare two JSON documents by structure and list added, removed and changed keys with their path, whatever the key order. Runs in your browser.',
  },
  keywords: {
    es: [
      'comparar json',
      'diferencias json',
      'json diff',
      'comparar dos json',
      'diff json online',
      'cambios json',
    ],
    en: [
      'json diff',
      'compare json',
      'json compare online',
      'json differences',
      'diff two json',
      'json changes',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Importa el orden de las claves?',
        a: 'No. {"a":1,"b":2} y {"b":2,"a":1} son equivalentes. En las listas sí importa: se comparan posición a posición, así que insertar un elemento al principio cambia todos los que van detrás.',
      },
      {
        q: '¿Por qué 1 y 1.0 salen iguales?',
        a: 'Porque en JSON son el mismo número. La comparación se hace sobre los valores ya leídos, no sobre el texto, así que tampoco cuentan los espacios ni los saltos de línea.',
      },
    ],
    en: [
      {
        q: 'Does key order matter?',
        a: 'No. {"a":1,"b":2} and {"b":2,"a":1} are equivalent. In lists order does matter: they are compared position by position, so inserting an item at the start changes every item after it.',
      },
      {
        q: 'Why are 1 and 1.0 equal?',
        a: 'Because in JSON they are the same number. The comparison works on the parsed values, not the text, so spaces and line breaks do not count either.',
      },
    ],
  },
  related: ['json', 'diff', 'data-convert'],
};
