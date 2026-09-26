import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'ean-isbn',
  category: 'ids',
  icon: 'barcode',
  slug: { es: 'validador-ean-isbn', en: 'ean-isbn-validator' },
  name: { es: 'EAN e ISBN', en: 'EAN & ISBN' },
  title: {
    es: 'Validador de EAN-13 e ISBN y conversor ISBN-10 ↔ 13',
    en: 'EAN-13 and ISBN validator, ISBN-10 to ISBN-13',
  },
  description: {
    es: 'Comprueba el dígito de control de códigos de barras EAN-13 e ISBN, calcula el que falta y convierte ISBN-10 en ISBN-13 y al revés.',
    en: 'Check the check digit of EAN-13 barcodes and ISBNs, work out a missing one and convert ISBN-10 to ISBN-13 and back.',
  },
  keywords: {
    es: [
      'validar ean',
      'ean 13',
      'validar isbn',
      'isbn 10 a 13',
      'digito control ean',
      'codigo de barras',
    ],
    en: [
      'ean validator',
      'ean 13 check digit',
      'isbn validator',
      'isbn 10 to 13',
      'barcode check digit',
    ],
  },
  rememberInput: true,
};
