import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'mock',
  category: 'gen',
  icon: 'database',
  slug: { es: 'generador-datos-de-prueba', en: 'mock-data-generator' },
  name: { es: 'Datos de prueba', en: 'Mock data' },
  title: {
    es: 'Generador de datos de prueba: JSON, CSV y SQL',
    en: 'Mock data generator: JSON, CSV and SQL',
  },
  description: {
    es: 'Genera hasta 1000 filas de datos ficticios coherentes (nombre, email, DNI, IBAN, dirección…) en JSON, CSV o SQL. Con semilla, siempre los mismos.',
    en: 'Generate up to 1000 rows of consistent fake data (name, email, Spanish IDs, IBAN, address…) as JSON, CSV or SQL. With a seed, always the same.',
  },
  keywords: {
    es: [
      'datos de prueba',
      'generador datos falsos',
      'mock data',
      'datos ficticios',
      'generar csv',
      'insert sql',
    ],
    en: [
      'mock data generator',
      'fake data',
      'test data generator',
      'random json',
      'sql insert generator',
    ],
  },
  rememberInput: true,
  faq: {
    es: [
      {
        q: '¿Los datos pertenecen a alguien?',
        a: 'No. Nombres y apellidos salen de listas de los más comunes y se combinan al azar; los emails usan dominios reservados (example.com) que no llegan a ningún buzón, y los documentos son números al azar con el control correcto.',
      },
      {
        q: '¿Qué hace la semilla?',
        a: 'Con la misma semilla y la misma configuración obtienes exactamente las mismas filas en cualquier navegador. Sirve para tests reproducibles o para compartir un conjunto de datos sin enviar el archivo.',
      },
    ],
    en: [
      {
        q: 'Does the data belong to anyone?',
        a: 'No. Names come from lists of the most common ones and are combined at random; emails use reserved domains (example.com) that reach no mailbox, and IDs are random numbers with the right check characters.',
      },
      {
        q: 'What does the seed do?',
        a: 'With the same seed and settings you get exactly the same rows in any browser. It is handy for reproducible tests or to share a data set without sending the file.',
      },
    ],
  },
};
