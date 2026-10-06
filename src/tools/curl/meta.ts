import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'curl',
  category: 'data',
  icon: 'terminal',
  slug: { es: 'convertir-curl-a-fetch', en: 'curl-to-fetch-converter' },
  name: { es: 'cURL a fetch', en: 'cURL to fetch' },
  title: {
    es: 'Convertir comandos cURL a fetch de JavaScript',
    en: 'Convert cURL commands to JavaScript fetch',
  },
  heading: {
    es: 'Convertir cURL a fetch',
    en: 'Convert cURL to fetch',
  },
  description: {
    es: 'Pega un cURL y obtén el código fetch de JavaScript equivalente, con método, cabeceras, cuerpo JSON o formulario y avisos de lo que fetch no puede hacer.',
    en: 'Paste a cURL command and get the equivalent JavaScript fetch code, with method, headers, JSON or form body and notes on what fetch cannot do.',
  },
  keywords: {
    es: [
      'curl a fetch',
      'convertir curl',
      'curl a javascript',
      'fetch api',
      'copiar como curl',
      'curl online',
    ],
    en: [
      'curl to fetch',
      'convert curl',
      'curl to javascript',
      'fetch api',
      'copy as curl',
      'curl converter',
    ],
  },
  rememberInput: false,
  faq: {
    es: [
      {
        q: '¿Cómo copio una petición como cURL?',
        a: 'En las herramientas de desarrollo del navegador, pestaña Red, haz clic derecho en la petición y elige «Copiar» → «Copiar como cURL (bash)». La versión de cmd de Windows usa otro sistema de comillas y no se admite.',
      },
      {
        q: '¿Por qué no se guarda lo que pego?',
        a: 'Un cURL copiado del navegador suele llevar cookies y tokens de sesión. Por eso esta herramienta no guarda nada, ni siquiera en tu navegador.',
      },
    ],
    en: [
      {
        q: 'How do I copy a request as cURL?',
        a: 'In the browser developer tools, Network tab, right-click the request and choose “Copy” → “Copy as cURL (bash)”. The Windows cmd version uses different quoting and is not supported.',
      },
      {
        q: 'Why is what I paste not remembered?',
        a: 'A cURL copied from the browser usually carries cookies and session tokens. That is why this tool stores nothing, not even in your browser.',
      },
    ],
  },
};
