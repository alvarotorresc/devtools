import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'teams',
  category: 'rand',
  icon: 'users',
  slug: { es: 'generador-equipos-aleatorios', en: 'random-team-generator' },
  name: { es: 'Equipos', en: 'Teams' },
  title: {
    es: 'Generador de equipos aleatorios y grupos',
    en: 'Random team generator: split a list into groups',
  },
  heading: {
    es: 'Generador de equipos aleatorios',
    en: 'Random team generator',
  },
  description: {
    es: 'Reparte una lista de personas en equipos al azar, por número de equipos o por personas por equipo, con tamaños equilibrados y semilla opcional.',
    en: 'Split a list of people into random teams, by number of teams or by people per team, with balanced sizes and an optional seed.',
  },
  keywords: {
    es: [
      'generador de equipos',
      'hacer equipos',
      'sorteo de grupos',
      'equipos aleatorios',
      'dividir en grupos',
    ],
    en: ['team generator', 'random teams', 'group generator', 'split into groups', 'random groups'],
  },
  rememberInput: true,
};
