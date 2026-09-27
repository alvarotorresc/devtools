import type { Locale } from '../types';

export const strings = {
  es: {
    list: 'Lista',
    listHelp: 'Un elemento por línea. Los repetidos se conservan.',
    ignoreEmpty: 'Ignorar líneas vacías',
    limit: 'Quedarse con los primeros',
    keep: 'Cuántos',
    shuffle: 'Mezclar',
    result: 'Lista mezclada',
    few: 'Añade al menos dos elementos.',
    countOne: '{n} elemento',
    countOther: '{n} elementos',
    seeded: 'Con semilla: el orden es siempre el mismo.',
    emptyLine: '(línea vacía)',
    copyAll: 'Copiar la lista',
  },
  en: {
    list: 'List',
    listHelp: 'One item per line. Repeated items are kept.',
    ignoreEmpty: 'Ignore empty lines',
    limit: 'Keep only the first',
    keep: 'How many',
    shuffle: 'Shuffle',
    result: 'Shuffled list',
    few: 'Add at least two items.',
    countOne: '{n} item',
    countOther: '{n} items',
    seeded: 'With a seed: the order is always the same.',
    emptyLine: '(empty line)',
    copyAll: 'Copy the list',
  },
} satisfies Record<Locale, Record<string, string>>;
