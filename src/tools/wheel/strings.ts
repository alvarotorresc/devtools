import type { Locale } from '../types';

export const strings = {
  es: {
    options: 'Opciones',
    optionsHelp: 'Una por línea, de 2 a 100. Las líneas vacías no cuentan.',
    spin: 'Girar',
    removeWinner: 'Quitar la opción ganadora',
    result: 'Resultado',
    idle: 'Pulsa Girar para elegir una opción.',
    spinning: 'Girando…',
    winner: 'Ha salido: {v}',
    history: 'Últimos resultados',
    few: 'Añade al menos dos opciones.',
    many: 'Como mucho 100 opciones: hay {n}.',
    countOne: '{n} opción',
    countOther: '{n} opciones',
  },
  en: {
    options: 'Options',
    optionsHelp: 'One per line, from 2 to 100. Empty lines do not count.',
    spin: 'Spin',
    removeWinner: 'Remove the winning option',
    result: 'Result',
    idle: 'Press Spin to pick an option.',
    spinning: 'Spinning…',
    winner: 'The winner is: {v}',
    history: 'Latest results',
    few: 'Add at least two options.',
    many: 'At most 100 options: there are {n}.',
    countOne: '{n} option',
    countOther: '{n} options',
  },
} satisfies Record<Locale, Record<string, string>>;
