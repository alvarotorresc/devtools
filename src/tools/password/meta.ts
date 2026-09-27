import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'password',
  category: 'gen',
  icon: 'lock-keyhole',
  slug: { es: 'generador-contrasenas', en: 'password-generator' },
  name: { es: 'Contraseñas', en: 'Passwords' },
  title: {
    es: 'Generador de contraseñas seguras con entropía',
    en: 'Strong password generator with entropy meter',
  },
  description: {
    es: 'Genera contraseñas aleatorias y seguras con crypto.getRandomValues, elige longitud y tipos de carácter y mira su entropía en bits. No se guardan nunca.',
    en: 'Generate strong random passwords with crypto.getRandomValues, choose length and character types and see their entropy in bits. They are never stored.',
  },
  keywords: {
    es: [
      'generador de contraseñas',
      'contraseña segura',
      'contraseña aleatoria',
      'crear contraseña',
      'entropia contraseña',
      'password',
    ],
    en: [
      'password generator',
      'strong password',
      'random password',
      'secure password',
      'password entropy',
      'generate password',
    ],
  },
  rememberInput: false,
  faq: {
    es: [
      {
        q: '¿Son seguras estas contraseñas?',
        a: 'Sí. Se generan en tu navegador con crypto.getRandomValues, el generador criptográfico del sistema, y no salen de tu equipo ni se guardan. Solo se recuerdan las opciones, como la longitud.',
      },
      {
        q: '¿Qué entropía necesito?',
        a: 'Por debajo de 50 bits es débil. Entre 50 y 80, aceptable para cuentas poco importantes. A partir de 80 bits es fuerte: 16 caracteres con los cuatro tipos ya pasan de 100.',
      },
    ],
    en: [
      {
        q: 'Are these passwords secure?',
        a: 'Yes. They are generated in your browser with crypto.getRandomValues, the system cryptographic generator, and they never leave your device or get stored. Only the options, such as the length, are remembered.',
      },
      {
        q: 'How much entropy do I need?',
        a: 'Below 50 bits is weak. Between 50 and 80 is acceptable for low-value accounts. From 80 bits it is strong: 16 characters with all four types already go past 100.',
      },
    ],
  },
};
