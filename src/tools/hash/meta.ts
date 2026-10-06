import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'hash',
  category: 'enc',
  icon: 'hash',
  slug: { es: 'generador-hash-md5-sha256', en: 'md5-sha256-hash-generator' },
  name: { es: 'Hash (MD5, SHA)', en: 'Hash (MD5, SHA)' },
  title: {
    es: 'Generador de hash MD5, SHA-1 y SHA-256 online',
    en: 'Hash generator online: MD5, SHA-1, SHA-256',
  },
  heading: {
    es: 'Generador de hash',
    en: 'Hash generator',
  },
  description: {
    es: 'Calcula MD5, SHA-1, SHA-256, SHA-384 y SHA-512 de un texto o un archivo mientras escribes, y compara con un hash esperado para ver si coincide.',
    en: 'Compute MD5, SHA-1, SHA-256, SHA-384 and SHA-512 of text or a file as you type, and compare against an expected hash to see if it matches.',
  },
  keywords: {
    es: [
      'hash',
      'md5',
      'sha256',
      'sha1',
      'sha512',
      'checksum',
      'suma de verificacion',
      'comprobar hash',
    ],
    en: ['hash', 'md5', 'sha256', 'sha1', 'sha512', 'checksum', 'file hash', 'verify hash'],
  },
  tabs: { es: ['Texto', 'Archivo'], en: ['Text', 'File'] },
  rememberInput: false,
  faq: {
    es: [
      {
        q: '¿Puedo usar MD5 o SHA-1 para guardar contraseñas?',
        a: 'No. Son rápidos a propósito y hoy se rompen con fuerza bruta. Para contraseñas usa Argon2, scrypt o bcrypt. MD5 y SHA-1 siguen valiendo para detectar cambios accidentales en un archivo.',
      },
      {
        q: '¿Mi archivo se sube a algún sitio?',
        a: 'No. El archivo se lee y se calcula en tu navegador; ni el contenido ni los hashes salen de tu equipo.',
      },
    ],
    en: [
      {
        q: 'Can I use MD5 or SHA-1 to store passwords?',
        a: 'No. They are fast on purpose and fall to brute force today. Use Argon2, scrypt or bcrypt for passwords. MD5 and SHA-1 are still fine for spotting accidental changes in a file.',
      },
      {
        q: 'Is my file uploaded anywhere?',
        a: 'No. The file is read and hashed in your browser; neither its content nor the hashes leave your device.',
      },
    ],
  },
};
