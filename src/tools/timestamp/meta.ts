import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'timestamp',
  category: 'conv',
  icon: 'clock',
  slug: { es: 'conversor-timestamp-unix', en: 'unix-timestamp-converter' },
  name: { es: 'Timestamp Unix', en: 'Unix timestamp' },
  title: {
    es: 'Conversor de timestamp Unix a fecha (segundos y milisegundos)',
    en: 'Unix timestamp to date converter (seconds and milliseconds)',
  },
  description: {
    es: 'Reloj Unix en vivo y conversión de timestamps en segundos o milisegundos a ISO 8601, UTC, hora local y relativa en cualquier zona horaria, y al revés.',
    en: 'Live Unix clock and conversion of timestamps in seconds or milliseconds to ISO 8601, UTC, local and relative time in any time zone, and back.',
  },
  keywords: {
    es: [
      'timestamp',
      'unix time',
      'epoch',
      'convertir timestamp',
      'fecha a timestamp',
      'zona horaria',
      'milisegundos',
    ],
    en: [
      'timestamp',
      'unix time',
      'epoch converter',
      'timestamp to date',
      'date to timestamp',
      'time zone',
      'milliseconds',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Cómo sé si un timestamp está en segundos o en milisegundos?',
        a: 'Por el tamaño: hoy un timestamp en segundos tiene 10 cifras y en milisegundos 13. La herramienta lo detecta sola, y puedes fijar la unidad si hace falta.',
      },
    ],
    en: [
      {
        q: 'How do I know if a timestamp is in seconds or milliseconds?',
        a: 'By its size: today a timestamp in seconds has 10 digits and in milliseconds 13. The tool detects it on its own, and you can force the unit if needed.',
      },
    ],
  },
};
