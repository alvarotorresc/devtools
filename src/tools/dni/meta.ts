import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'dni',
  category: 'ids',
  icon: 'id-card-lanyard',
  slug: { es: 'validador-dni-nie', en: 'spanish-dni-nie-validator' },
  name: { es: 'DNI y NIE', en: 'DNI & NIE' },
  title: {
    es: 'Validador y generador de DNI y NIE online',
    en: 'Spanish DNI and NIE validator and generator',
  },
  description: {
    es: 'Comprueba la letra de un DNI o NIE, calcula la que falta y genera documentos ficticios para pruebas. Valida cientos de golpe, uno por línea.',
    en: 'Check the letter of a Spanish DNI or NIE, work out a missing one and generate fictitious IDs for testing. Validates hundreds at once, one per line.',
  },
  keywords: {
    es: ['validar dni', 'letra dni', 'calcular letra dni', 'validar nie', 'generador dni', 'nif'],
    en: [
      'dni validator',
      'nie validator',
      'spanish id number',
      'dni letter',
      'dni generator',
      'nif',
    ],
  },
  tabs: {
    es: ['Validar', 'Generar', 'Calcular letra'],
    en: ['Validate', 'Generate', 'Find the letter'],
  },
  rememberInput: false,
  faq: {
    es: [
      {
        q: '¿Estos DNI existen?',
        a: 'Los generados tienen la letra correcta, así que pasan cualquier validación de formato, pero son números al azar: pueden coincidir con un documento real por casualidad. Úsalos solo en entornos de prueba y nunca como si fueran de alguien.',
      },
      {
        q: '¿Por qué el DNI no lleva Ñ, I, O ni U?',
        a: 'La tabla de 23 letras se eligió para evitar confusiones al leer y escribir: la I y la O se parecen al 1 y al 0, la U a la V, y la Ñ no existe fuera del teclado español.',
      },
    ],
    en: [
      {
        q: 'Do these DNI exist?',
        a: 'Generated numbers carry the right letter, so they pass any format check, but they are random: one could match a real document by chance. Use them only in test environments and never as if they belonged to someone.',
      },
      {
        q: 'Why does the DNI never use Ñ, I, O or U?',
        a: 'The 23-letter table was chosen to avoid reading and typing mistakes: I and O look like 1 and 0, U looks like V, and Ñ only exists on Spanish keyboards.',
      },
    ],
  },
};
