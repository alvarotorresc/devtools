import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'html-entities',
  category: 'enc',
  icon: 'code-xml',
  slug: { es: 'codificar-entidades-html', en: 'html-entities-encoder' },
  name: { es: 'Entidades HTML', en: 'HTML entities' },
  title: {
    es: 'Codificar y decodificar entidades HTML online',
    en: 'HTML entities encoder and decoder online',
  },
  heading: {
    es: 'Codificar y decodificar entidades HTML',
    en: 'HTML entities encoder and decoder',
  },
  description: {
    es: 'Convierte < > & " y \' en entidades HTML, o todo lo que no sea ASCII, y decodifica &amp;, &aacute; o &#128512; al escribir.',
    en: 'Turn < > & " and \' into HTML entities, or everything non-ASCII, and decode &amp;, &eacute; or &#128512; as you type, right in your browser.',
  },
  keywords: {
    es: [
      'entidades html',
      'escapar html',
      'html encode',
      'html decode',
      'caracteres especiales html',
      'amp lt gt',
    ],
    en: [
      'html entities',
      'escape html',
      'html encode',
      'html decode',
      'html special characters',
      'amp lt gt',
    ],
  },
  related: ['url', 'base64', 'markdown'],
};
