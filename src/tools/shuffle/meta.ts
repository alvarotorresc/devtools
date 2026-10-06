import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'shuffle',
  category: 'rand',
  icon: 'shuffle',
  slug: { es: 'mezclar-lista-aleatoria', en: 'random-list-shuffler' },
  name: { es: 'Mezclar lista', en: 'Shuffle list' },
  title: {
    es: 'Mezclar una lista al azar: ordenar aleatoriamente',
    en: 'Random list shuffler: randomize any list',
  },
  heading: {
    es: 'Mezclar una lista al azar',
    en: 'Random list shuffler',
  },
  description: {
    es: 'Pega una lista, un elemento por línea, y ordénala al azar con un algoritmo uniforme. Con semilla, el orden se puede repetir y comprobar.',
    en: 'Paste a list, one item per line, and put it in random order with a uniform algorithm. With a seed, the order can be repeated and checked.',
  },
  keywords: {
    es: ['mezclar lista', 'ordenar al azar', 'lista aleatoria', 'sorteo de orden', 'barajar lista'],
    en: ['shuffle list', 'randomize list', 'random order', 'list randomizer', 'shuffle names'],
  },
  rememberInput: true,
  related: ['teams', 'wheel', 'dice'],
};
