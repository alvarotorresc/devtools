import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'bic',
  category: 'ids',
  icon: 'globe',
  slug: { es: 'validador-swift-bic', en: 'swift-bic-validator' },
  name: { es: 'SWIFT / BIC', en: 'SWIFT / BIC' },
  title: {
    es: 'Validador de códigos SWIFT / BIC online',
    en: 'SWIFT / BIC code validator online',
  },
  heading: {
    es: 'Validador de códigos SWIFT / BIC',
    en: 'SWIFT / BIC code validator',
  },
  description: {
    es: 'Comprueba un código SWIFT o BIC de 8 u 11 caracteres y lo desglosa: banco, país, localidad y sucursal, con sus formas corta y larga.',
    en: 'Check an 8 or 11 character SWIFT or BIC code and break it down: bank, country, location and branch, with its short and long forms.',
  },
  keywords: {
    es: ['validar swift', 'codigo bic', 'swift banco', 'bic españa', 'comprobar bic'],
    en: ['swift code validator', 'bic code', 'check swift code', 'bic format', 'swift bic lookup'],
  },
  rememberInput: true,
  related: ['iban', 'card', 'cif'],
};
