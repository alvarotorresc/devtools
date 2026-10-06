import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'iva',
  category: 'calc',
  icon: 'receipt',
  slug: { es: 'calculadora-iva', en: 'spanish-vat-calculator' },
  name: { es: 'IVA', en: 'Spanish VAT' },
  title: {
    es: 'Calcular IVA online: sumar y quitar el IVA',
    en: 'Spanish VAT (IVA) calculator: add or remove VAT',
  },
  heading: {
    es: 'Calcular IVA',
    en: 'Spanish VAT calculator',
  },
  description: {
    es: 'Suma el IVA a una base imponible o quítalo de un total, al 21, 10 o 4 % o con el tipo que quieras. Redondeo al céntimo que siempre cuadra.',
    en: 'Add Spanish VAT to a net amount or take it out of a total, at 21, 10 or 4% or any rate you need. Cent rounding that always adds up.',
  },
  keywords: {
    es: [
      'calculadora iva',
      'quitar iva',
      'sumar iva',
      'iva 21',
      'base imponible',
      'precio sin iva',
    ],
    en: [
      'spanish vat calculator',
      'iva calculator',
      'remove vat',
      'add vat',
      'vat 21',
      'net price',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Cómo se quita el IVA de un precio?',
        a: 'Se divide el total entre 1 más el tipo: con el 21 %, entre 1,21. Así, 121 € con IVA son 100 € de base. Restar el 21 % al total da un resultado incorrecto.',
      },
    ],
    en: [
      {
        q: 'How do I take VAT out of a price?',
        a: 'Divide the total by 1 plus the rate: at 21%, by 1.21. So 121 € with VAT is a 100 € base. Subtracting 21% from the total gives the wrong result.',
      },
    ],
  },
  rememberInput: true,
};
