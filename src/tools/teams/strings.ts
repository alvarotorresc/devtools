import type { Locale } from '../types';

export const strings = {
  es: {
    people: 'Participantes',
    peopleHelp: 'Una persona por línea.',
    mode: 'Repartir por',
    count: 'Número de equipos',
    size: 'Personas por equipo',
    n: 'N',
    prefix: 'Nombre de los equipos',
    prefixDefault: 'Equipo',
    make: 'Hacer equipos',
    result: 'Equipos',
    summary: '{n} personas en {k} equipos',
    few: 'Añade al menos dos personas.',
    nInvalid: '{label} debe ser un número entero mayor que 0.',
    tooMany: 'Hay {p} personas y {k} equipos: baja el número de equipos.',
    balanced:
      'Con {p} personas y {n} por equipo salen {k} equipos de {sizes}: se reparten para que nadie se quede solo.',
    copyAll: 'Copiar los equipos',
  },
  en: {
    people: 'Participants',
    peopleHelp: 'One person per line.',
    mode: 'Split by',
    count: 'Number of teams',
    size: 'People per team',
    n: 'N',
    prefix: 'Team name',
    prefixDefault: 'Team',
    make: 'Make teams',
    result: 'Teams',
    summary: '{n} people in {k} teams',
    few: 'Add at least two people.',
    nInvalid: '{label} must be a whole number greater than 0.',
    tooMany: 'There are {p} people and {k} teams: lower the number of teams.',
    balanced:
      'With {p} people and {n} per team you get {k} teams of {sizes}: they are balanced so nobody is left alone.',
    copyAll: 'Copy the teams',
  },
} satisfies Record<Locale, Record<string, string>>;
