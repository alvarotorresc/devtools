import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'url',
  category: 'enc',
  icon: 'link',
  slug: { es: 'codificar-decodificar-url', en: 'url-encode-decode' },
  name: { es: 'URL', en: 'URL' },
  title: {
    es: 'Codificar y decodificar URL online',
    en: 'URL encode and decode online, plus a URL parser',
  },
  heading: {
    es: 'Codificar y decodificar URL',
    en: 'URL encode and decode',
  },
  description: {
    es: 'Codifica y decodifica URLs al escribir (encodeURIComponent o encodeURI) y desglosa cualquier URL: host, puerto, ruta, hash y parámetros.',
    en: 'Encode and decode URLs as you type (encodeURIComponent or encodeURI) and break any URL down: host, port, path, hash and query params.',
  },
  keywords: {
    es: [
      'codificar url',
      'decodificar url',
      'urlencode',
      'percent encoding',
      'parametros url',
      'analizar url',
    ],
    en: ['url encode', 'url decode', 'urlencode', 'percent encoding', 'query string', 'url parser'],
  },
  tabs: { es: ['Codificar', 'Analizar URL'], en: ['Encode', 'Parse URL'] },
  faq: {
    es: [
      {
        q: '¿Qué diferencia hay entre encodeURIComponent y encodeURI?',
        a: 'encodeURIComponent escapa también / ? & = y #, así que sirve para un valor suelto (un parámetro). encodeURI respeta esos caracteres y sirve para una URL completa.',
      },
    ],
    en: [
      {
        q: 'What is the difference between encodeURIComponent and encodeURI?',
        a: 'encodeURIComponent also escapes / ? & = and #, so it suits a single value (a parameter). encodeURI keeps those characters and suits a whole URL.',
      },
    ],
  },
  related: ['query-string', 'base64', 'slug', 'html-entities'],
};
