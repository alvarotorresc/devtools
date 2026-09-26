import type { Locale } from '../types';

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
    errorAt: 'Error en la línea {line}, columna {column}',
    errorNoLine: 'JSON no válido',
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
    errorAt: 'Error on line {line}, column {column}',
    errorNoLine: 'Invalid JSON',
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

export function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
