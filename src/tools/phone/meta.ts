import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'phone',
  category: 'ids',
  icon: 'phone',
  slug: { es: 'validador-telefonos-espana', en: 'spanish-phone-number-validator' },
  name: { es: 'Teléfonos ES', en: 'Spanish phone numbers' },
  title: {
    es: 'Validador de teléfonos de España y formato E.164',
    en: 'Spanish phone number validator and E.164 formatter',
  },
  description: {
    es: 'Comprueba teléfonos españoles, dice si son móviles, fijos o de tarificación especial y los pasa a E.164 (+34612345678) y a formato nacional.',
    en: 'Check Spanish phone numbers, see whether they are mobile, landline or premium rate, and convert them to E.164 (+34612345678) and national format.',
  },
  keywords: {
    es: [
      'validar telefono',
      'telefono españa',
      'formato e164',
      'prefijo 34',
      'telefono movil',
      'numero fijo',
    ],
    en: [
      'spanish phone number',
      'phone validator spain',
      'e164 format',
      'plus 34',
      'spanish mobile number',
    ],
  },
  rememberInput: false,
};
