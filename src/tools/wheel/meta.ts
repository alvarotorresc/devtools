import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'wheel',
  category: 'rand',
  icon: 'ferris-wheel',
  slug: { es: 'ruleta-aleatoria', en: 'spin-the-wheel' },
  name: { es: 'Ruleta', en: 'Spin the wheel' },
  title: {
    es: 'Ruleta aleatoria online para sorteos y decisiones',
    en: 'Spin the wheel: random name picker',
  },
  heading: {
    es: 'Ruleta aleatoria online',
    en: 'Spin the wheel',
  },
  description: {
    es: 'Escribe las opciones, gira la ruleta y deja que el azar decida. Hasta 100 opciones, historial de resultados y opción de quitar la ganadora.',
    en: 'Type your options, spin the wheel and let chance decide. Up to 100 options, a history of results and the option to remove the winner.',
  },
  keywords: {
    es: [
      'ruleta aleatoria',
      'ruleta de nombres',
      'sorteo online',
      'ruleta para decidir',
      'girar ruleta',
    ],
    en: [
      'spin the wheel',
      'random name picker',
      'wheel of names',
      'random picker',
      'decision wheel',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Es realmente aleatoria?',
        a: 'Sí. La opción ganadora se elige antes de girar con el generador criptográfico del navegador (crypto.getRandomValues), y todas tienen la misma probabilidad. La animación solo lleva la ruleta hasta ella.',
      },
    ],
    en: [
      {
        q: 'Is it really random?',
        a: 'Yes. The winner is picked before the spin with the browser’s cryptographic generator (crypto.getRandomValues), and every option has the same chance. The animation only takes the wheel there.',
      },
    ],
  },
  rememberInput: true,
  related: ['shuffle', 'teams', 'dice'],
};
