import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'dice',
  category: 'rand',
  icon: 'dice-5',
  slug: { es: 'lanzar-dados-moneda', en: 'dice-roller-coin-flip' },
  name: { es: 'Dados y moneda', en: 'Dice & coin' },
  title: {
    es: 'Lanzar dados online (3d6, d20) y cara o cruz',
    en: 'Online dice roller (3d6, d20) and coin flip',
  },
  heading: {
    es: 'Lanzar dados online',
    en: 'Online dice roller',
  },
  description: {
    es: 'Lanza dados con notación de rol (3d6, 2d20+1, d100) o echa una moneda al aire. Ves cada dado, el total y el historial, con semilla opcional.',
    en: 'Roll dice with tabletop notation (3d6, 2d20+1, d100) or flip a coin. See every die, the total and the history, with an optional seed.',
  },
  keywords: {
    es: ['lanzar dados', 'dados online', 'cara o cruz', 'tirar moneda', 'dado d20', 'dados de rol'],
    en: [
      'dice roller',
      'roll dice online',
      'coin flip',
      'heads or tails',
      'd20 roller',
      'rpg dice',
    ],
  },
  tabs: { es: ['Dados', 'Moneda'], en: ['Dice', 'Coin'] },
  rememberInput: true,
  related: ['wheel', 'shuffle', 'teams'],
};
