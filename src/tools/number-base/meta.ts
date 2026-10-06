import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'number-base',
  category: 'conv',
  icon: 'binary',
  slug: { es: 'conversor-bases-numericas', en: 'number-base-converter' },
  name: { es: 'Bases numéricas', en: 'Number bases' },
  title: {
    es: 'Conversor de bases numéricas: binario y hex',
    en: 'Number base converter: binary, decimal, hex',
  },
  heading: {
    es: 'Conversor de bases numéricas',
    en: 'Number base converter',
  },
  description: {
    es: 'Convierte números entre binario, octal, decimal, hexadecimal y cualquier base de 2 a 36, sin límite de tamaño y con agrupación de dígitos opcional.',
    en: 'Convert numbers between binary, octal, decimal, hexadecimal and any base from 2 to 36, with no size limit and optional digit grouping.',
  },
  keywords: {
    es: [
      'binario a decimal',
      'decimal a hexadecimal',
      'hexadecimal',
      'octal',
      'bases numericas',
      'convertir base',
    ],
    en: [
      'binary to decimal',
      'decimal to hex',
      'hexadecimal',
      'octal',
      'number base converter',
      'radix',
    ],
  },
};
