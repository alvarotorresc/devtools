import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json',
  category: 'data',
  icon: 'braces',
  slug: { es: 'formateador-json', en: 'json-formatter' },
  name: { es: 'JSON', en: 'JSON' },
  title: {
    es: 'Formatear JSON online: formateador y validador',
    en: 'JSON formatter and validator online',
  },
  heading: {
    es: 'Formatear y validar JSON',
    en: 'JSON formatter and validator',
  },
  description: {
    es: 'Formatea, valida y minifica JSON mientras escribes. Te dice la línea exacta del error y deja explorar el árbol. Todo en tu navegador.',
    en: 'Format, validate and minify JSON as you type. Shows the exact line of any error and lets you explore the tree. Runs in your browser.',
  },
  keywords: {
    es: [
      'formatear json',
      'validar json',
      'minificar json',
      'json bonito',
      'arbol json',
      'beautify',
    ],
    en: [
      'json formatter',
      'json validator',
      'prettify json',
      'minify json',
      'json viewer',
      'beautify',
    ],
  },
  tabs: { es: ['Formatear', 'Árbol'], en: ['Format', 'Tree'] },
  faq: {
    es: [
      {
        q: '¿Se envía mi JSON a algún servidor?',
        a: 'No. El formateo y la validación se hacen en tu navegador. Si activas «Recordar lo que escribo», el texto se guarda solo en este navegador.',
      },
      {
        q: '¿Por qué falla un JSON con comas al final?',
        a: 'El estándar JSON no admite comas finales ni comillas simples. La herramienta marca la línea exacta para que las quites.',
      },
    ],
    en: [
      {
        q: 'Is my JSON sent to a server?',
        a: 'No. Formatting and validation happen in your browser. If you turn on “Remember what I type”, the text is stored only in this browser.',
      },
      {
        q: 'Why does JSON with trailing commas fail?',
        a: 'The JSON standard does not allow trailing commas or single quotes. The tool points to the exact line so you can remove them.',
      },
    ],
  },
};
