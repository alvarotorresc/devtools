import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'nss',
  category: 'ids',
  icon: 'heart-pulse',
  slug: {
    es: 'validador-numero-seguridad-social',
    en: 'spanish-social-security-number-validator',
  },
  name: { es: 'Nº Seguridad Social', en: 'Social Security number' },
  title: {
    es: 'Validador de número de la Seguridad Social (NSS)',
    en: 'Spanish Social Security number (NSS) validator',
  },
  heading: {
    es: 'Validador de NSS de la Seguridad Social',
    en: 'Spanish Social Security number validator',
  },
  description: {
    es: 'Comprueba los dígitos de control del número de afiliación a la Seguridad Social (NSS), muestra su provincia y genera números ficticios para pruebas.',
    en: 'Check the control digits of a Spanish Social Security number (NSS), see its province and generate fictitious numbers for testing.',
  },
  keywords: {
    es: ['numero seguridad social', 'validar nss', 'numero afiliacion', 'naf', 'generador nss'],
    en: ['spanish social security number', 'nss validator', 'naf spain', 'nss generator'],
  },
  tabs: { es: ['Validar', 'Generar'], en: ['Validate', 'Generate'] },
  rememberInput: false,
};
