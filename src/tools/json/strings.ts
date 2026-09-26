import type { Locale } from '../types';

export { fill } from '../../i18n/fill';

export const strings = {
  es: {
    mode: 'Modo',
    input: 'JSON de entrada',
    placeholder: '{"nombre": "devtools", "herramientas": 35}',
    output: 'Salida',
    pretty: 'Formateado',
    minified: 'Minificado',
    indent: 'Sangría',
    indent2: '2 espacios',
    indent4: '4 espacios',
    indentTab: 'Tabulador',
    sortKeys: 'Ordenar claves',
    result: 'Resultado',
    valid: 'JSON válido',
    errorAt:
      'Error en la línea {line}, columna {column}. Revisa comas, comillas y llaves en esa línea.',
    errorNoLine:
      'JSON no válido. Revisa que claves y textos usen comillas dobles y que no sobren comas.',
    goToError: 'Ir a la línea del error',
    empty: 'Pega o escribe JSON y aparecerá formateado aquí.',
    treeEmpty: 'El árbol aparece cuando el JSON es válido.',
    copyPath: 'Copiar ruta',
    copyValue: 'Copiar valor',
    showMore: 'Mostrar {n} más',
    file: 'datos.json',
  },
  en: {
    mode: 'Mode',
    input: 'Input JSON',
    placeholder: '{"name": "devtools", "tools": 35}',
    output: 'Output',
    pretty: 'Pretty',
    minified: 'Minified',
    indent: 'Indentation',
    indent2: '2 spaces',
    indent4: '4 spaces',
    indentTab: 'Tab',
    sortKeys: 'Sort keys',
    result: 'Result',
    valid: 'Valid JSON',
    errorAt: 'Error on line {line}, column {column}. Check commas, quotes and braces on that line.',
    errorNoLine:
      'Invalid JSON. Make sure keys and strings use double quotes and there are no extra commas.',
    goToError: 'Go to the error line',
    empty: 'Paste or type JSON and it will appear formatted here.',
    treeEmpty: 'The tree appears once the JSON is valid.',
    copyPath: 'Copy path',
    copyValue: 'Copy value',
    showMore: 'Show {n} more',
    file: 'data.json',
  },
} satisfies Record<Locale, Record<string, string>>;

export type JsonStrings = (typeof strings)['es'];
