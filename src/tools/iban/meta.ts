import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'iban',
  category: 'ids',
  icon: 'landmark',
  slug: { es: 'validador-iban', en: 'iban-validator' },
  name: { es: 'IBAN', en: 'IBAN' },
  title: {
    es: 'Validador de IBAN y generador de IBAN español',
    en: 'IBAN validator and Spanish IBAN generator',
  },
  description: {
    es: 'Valida un IBAN de cualquier país, desglosa la cuenta española (entidad, oficina y DC), convierte un CCC en IBAN y genera IBAN ficticios para pruebas.',
    en: 'Validate an IBAN from any country, break down a Spanish account (bank, branch and check digits), turn a CCC into an IBAN and generate test IBANs.',
  },
  keywords: {
    es: [
      'validar iban',
      'comprobar iban',
      'iban españa',
      'ccc a iban',
      'generador iban',
      'cuenta bancaria',
    ],
    en: [
      'iban validator',
      'check iban',
      'spanish iban',
      'iban generator',
      'iban checksum',
      'bank account',
    ],
  },
  tabs: { es: ['Validar', 'Generar'], en: ['Validate', 'Generate'] },
  rememberInput: false,
  faq: {
    es: [
      {
        q: '¿Qué diferencia hay entre IBAN y CCC?',
        a: 'El CCC es el código de cuenta español de 20 cifras: entidad, oficina, dos dígitos de control y número de cuenta. El IBAN añade delante el país (ES) y dos dígitos de control internacionales, y es el formato que se usa desde la llegada de SEPA.',
      },
      {
        q: '¿Un IBAN válido significa que la cuenta existe?',
        a: 'No. Los dígitos de control solo detectan erratas al copiarlo. Saber si la cuenta existe o a nombre de quién está requiere que el banco lo compruebe.',
      },
    ],
    en: [
      {
        q: 'What is the difference between IBAN and CCC?',
        a: 'The CCC is the 20-digit Spanish account code: bank, branch, two check digits and account number. The IBAN puts the country (ES) and two international check digits in front, and it is the format used since SEPA.',
      },
      {
        q: 'Does a valid IBAN mean the account exists?',
        a: 'No. The check digits only catch typing mistakes. Whether the account exists, and whose it is, can only be confirmed by the bank.',
      },
    ],
  },
};
