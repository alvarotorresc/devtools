import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'base64',
  category: 'enc',
  icon: 'file-code',
  slug: { es: 'codificar-decodificar-base64', en: 'base64-encode-decode' },
  name: { es: 'Base64', en: 'Base64' },
  title: {
    es: 'Codificar y decodificar Base64 online',
    en: 'Base64 encode and decode online (text and files)',
  },
  heading: {
    es: 'Codificar y decodificar Base64',
    en: 'Base64 encode and decode',
  },
  description: {
    es: 'Codifica y decodifica Base64 al escribir, con detección automática y variante URL-safe. Convierte archivos en data URI y Base64 en archivos.',
    en: 'Encode and decode Base64 as you type, with automatic detection and a URL-safe variant. Turn files into data URIs and Base64 back into files.',
  },
  keywords: {
    es: [
      'base64',
      'codificar base64',
      'decodificar base64',
      'data uri',
      'base64 url',
      'imagen a base64',
    ],
    en: ['base64', 'base64 encode', 'base64 decode', 'data uri', 'base64url', 'image to base64'],
  },
  tabs: { es: ['Texto', 'Archivo'], en: ['Text', 'File'] },
  faq: {
    es: [
      {
        q: '¿Base64 sirve para cifrar?',
        a: 'No. Base64 solo cambia la representación de los datos: cualquiera puede decodificarlo. Para proteger información usa cifrado de verdad.',
      },
      {
        q: '¿Qué es la variante URL-safe?',
        a: 'Sustituye + por - y / por _, y quita el relleno =. Así el resultado se puede poner en una URL o en un JWT sin escaparlo.',
      },
    ],
    en: [
      {
        q: 'Is Base64 encryption?',
        a: 'No. Base64 only changes how the data is written: anyone can decode it. Use real encryption to protect information.',
      },
      {
        q: 'What is the URL-safe variant?',
        a: 'It replaces + with - and / with _, and drops the = padding, so the result fits in a URL or a JWT without escaping.',
      },
    ],
  },
  related: ['url', 'html-entities', 'jwt', 'hash'],
};
