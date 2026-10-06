import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'data-convert',
  category: 'data',
  icon: 'sheet',
  slug: { es: 'conversor-json-yaml-csv', en: 'json-yaml-csv-converter' },
  name: { es: 'JSON, YAML y CSV', en: 'JSON, YAML & CSV' },
  title: {
    es: 'Conversor JSON ↔ YAML ↔ CSV online',
    en: 'JSON to YAML and CSV converter (and back)',
  },
  heading: {
    es: 'Conversor JSON ↔ YAML ↔ CSV',
    en: 'JSON to YAML and CSV converter',
  },
  description: {
    es: 'Convierte entre JSON, YAML y CSV en tu navegador: detecta el formato y el separador, resuelve anclas de YAML y aplana objetos anidados para el CSV.',
    en: 'Convert between JSON, YAML and CSV in your browser: detects the format and separator, resolves YAML anchors and flattens nested objects for CSV.',
  },
  keywords: {
    es: [
      'json a yaml',
      'yaml a json',
      'csv a json',
      'json a csv',
      'convertir yaml',
      'conversor csv',
    ],
    en: [
      'json to yaml',
      'yaml to json',
      'csv to json',
      'json to csv',
      'yaml converter',
      'csv converter',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Por qué al pasar de CSV a JSON los números salen entre comillas?',
        a: 'CSV no guarda tipos: todo es texto. Activa «Detectar números y booleanos» para convertir 42 en número y true en booleano. Los números con ceros a la izquierda, como 007, se quedan como texto.',
      },
      {
        q: '¿Qué pasa con los objetos anidados al exportar a CSV?',
        a: 'Se aplanan con puntos: {"direccion": {"ciudad": "Vigo"}} da la columna direccion.ciudad. Las listas van en la celda como JSON. Al volver a leer el CSV, el anidamiento no se reconstruye.',
      },
    ],
    en: [
      {
        q: 'Why do numbers come out quoted when converting CSV to JSON?',
        a: 'CSV does not store types: everything is text. Turn on “Detect numbers and booleans” to turn 42 into a number and true into a boolean. Numbers with leading zeros, such as 007, stay as text.',
      },
      {
        q: 'What happens to nested objects when exporting to CSV?',
        a: 'They are flattened with dots: {"address": {"city": "Vigo"}} gives the column address.city. Lists go into the cell as JSON. Reading the CSV back does not rebuild the nesting.',
      },
    ],
  },
  related: ['json', 'query-string', 'curl'],
};
