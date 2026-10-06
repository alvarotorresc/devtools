import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'user-agent',
  category: 'ref',
  icon: 'monitor-smartphone',
  slug: { es: 'analizar-user-agent', en: 'user-agent-parser' },
  name: { es: 'User-Agent', en: 'User-Agent' },
  title: {
    es: 'Analizar User-Agent: navegador y dispositivo',
    en: 'User-Agent parser: browser, OS and device',
  },
  heading: {
    es: 'Analizador de User-Agent',
    en: 'User-Agent parser',
  },
  description: {
    es: 'Pega un User-Agent y mira qué navegador, motor, sistema operativo, dispositivo y CPU indica, si parece un bot y las Client Hints de tu navegador.',
    en: 'Paste a User-Agent and see the browser, engine, operating system, device and CPU it reports, whether it looks like a bot, and your Client Hints.',
  },
  keywords: {
    es: [
      'user agent',
      'analizar user agent',
      'mi user agent',
      'detectar navegador',
      'client hints',
      'que navegador tengo',
    ],
    en: [
      'user agent parser',
      'what is my user agent',
      'user agent string',
      'detect browser',
      'client hints',
      'ua parser',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Por qué mi versión de Windows o de Android sale mal?',
        a: 'Desde 2021, Chrome y otros navegadores congelan parte del User-Agent: Windows 11 aparece como Windows 10 y Android como 10 en un modelo genérico. Para datos exactos hacen falta las Client Hints de alta entropía, que la web tiene que pedir.',
      },
      {
        q: '¿Se puede fiar uno del User-Agent?',
        a: 'Sirve para estadísticas y soporte, no para seguridad: cualquiera puede cambiarlo. Para decidir qué funciones usar, es mejor comprobar si el navegador las soporta.',
      },
    ],
    en: [
      {
        q: 'Why is my Windows or Android version wrong?',
        a: 'Since 2021 Chrome and other browsers freeze part of the User-Agent: Windows 11 shows up as Windows 10 and Android as 10 on a generic model. Exact data needs the high-entropy Client Hints, which the site has to request.',
      },
      {
        q: 'Can you trust the User-Agent?',
        a: 'It is fine for statistics and support, not for security: anyone can change it. To decide which features to use, check whether the browser supports them.',
      },
    ],
  },
  related: ['http-status', 'curl', 'url'],
};
