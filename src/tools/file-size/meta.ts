import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'file-size',
  category: 'conv',
  icon: 'hard-drive',
  slug: { es: 'conversor-tamano-archivos', en: 'file-size-converter' },
  name: { es: 'Tamaños de archivo', en: 'File sizes' },
  title: {
    es: 'Conversor de tamaños: KB, MB, GB y KiB, MiB, GiB',
    en: 'File size converter: KB, MB, GB vs KiB, MiB, GiB',
  },
  description: {
    es: 'Escribe un tamaño como 1,5 GB o 750 MiB y velo en unidades SI y binarias, en bytes y en bits. Descubre por qué un disco de 1 TB muestra 931 GB.',
    en: 'Type a size like 1.5 GB or 750 MiB and see it in SI and binary units, in bytes and in bits. Find out why a 1 TB drive shows 931 GB.',
  },
  keywords: {
    es: ['mb a gb', 'kb a mb', 'gib a gb', 'mib', 'tamaño de archivo', 'bytes a mb'],
    en: ['mb to gb', 'kb to mb', 'gib to gb', 'mib', 'file size', 'bytes to mb'],
  },
  faq: {
    es: [
      {
        q: '¿Por qué mi disco de 1 TB tiene menos espacio?',
        a: 'El fabricante cuenta 1 TB como 1 000 000 000 000 bytes (SI). Windows divide entre 1024 y lo muestra como unos 931 «GB», que en realidad son GiB. No falta espacio: son dos formas de contar.',
      },
    ],
    en: [
      {
        q: 'Why does my 1 TB drive show less space?',
        a: 'The maker counts 1 TB as 1,000,000,000,000 bytes (SI). Windows divides by 1024 and shows about 931 "GB", which are really GiB. No space is missing: they are two ways of counting.',
      },
    ],
  },
  rememberInput: true,
};
