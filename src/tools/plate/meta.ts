import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'plate',
  category: 'ids',
  icon: 'car',
  slug: { es: 'validador-matriculas', en: 'spanish-license-plate-validator' },
  name: { es: 'Matrículas', en: 'License plates' },
  title: {
    es: 'Validador y generador de matrículas españolas',
    en: 'Spanish license plate validator and generator',
  },
  heading: {
    es: 'Validador de matrículas',
    en: 'Spanish license plate validator',
  },
  description: {
    es: 'Comprueba matrículas españolas actuales (1234 BCD) y provinciales (M-1234-AB), dice su provincia o su posición en la serie y genera matrículas de prueba.',
    en: 'Check current (1234 BCD) and old provincial (M-1234-AB) Spanish license plates, see their province or place in the series and generate test plates.',
  },
  keywords: {
    es: [
      'validar matricula',
      'matricula española',
      'formato matricula',
      'generador matriculas',
      'matricula provincial',
    ],
    en: [
      'spanish license plate',
      'license plate validator',
      'plate format spain',
      'license plate generator',
    ],
  },
  tabs: { es: ['Validar', 'Generar'], en: ['Validate', 'Generate'] },
  rememberInput: true,
};
