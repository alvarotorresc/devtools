import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'cron',
  category: 'ref',
  icon: 'calendar-clock',
  slug: { es: 'explicar-expresion-cron', en: 'cron-expression-explainer' },
  name: { es: 'Cron', en: 'Cron' },
  title: {
    es: 'Expresión cron: explicar y próximas ejecuciones',
    en: 'Cron expression explainer with next run times',
  },
  heading: {
    es: 'Explicador de expresiones cron',
    en: 'Cron expression explainer',
  },
  description: {
    es: 'Traduce una expresión cron a palabras y calcula sus próximas ejecuciones en tu zona horaria, con los cambios de hora resueltos como en cron de Unix.',
    en: 'Turn a cron expression into plain words and list its next run times in your time zone, with daylight saving changes handled like Unix cron.',
  },
  keywords: {
    es: [
      'cron',
      'expresion cron',
      'crontab',
      'explicar cron',
      'proxima ejecucion cron',
      'cron cada 5 minutos',
    ],
    en: [
      'cron expression',
      'crontab',
      'cron explainer',
      'cron next run',
      'cron schedule',
      'cron every 5 minutes',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Qué pasa si pongo día del mes y día de la semana a la vez?',
        a: 'En el cron de Unix, si los dos campos tienen un valor (no empiezan por *), basta con que se cumpla uno: «0 9 1 * 1» se ejecuta el día 1 de cada mes y además todos los lunes.',
      },
      {
        q: '¿Qué hace cron con el cambio de hora?',
        a: 'Si la hora no existe (la noche de marzo en que se adelanta el reloj), se ejecuta en el primer minuto que sí existe. Si se repite (en octubre), se ejecuta una sola vez, la primera.',
      },
      {
        q: '¿Sirve para Quartz, Spring o AWS?',
        a: 'No. Esos formatos añaden segundos o años y símbolos como L, W o #. Aquí se usa el cron clásico de 5 campos de Linux y de la mayoría de servicios.',
      },
    ],
    en: [
      {
        q: 'What if I set both day of month and day of week?',
        a: 'In Unix cron, when both fields have a value (neither starts with *), either one is enough: “0 9 1 * 1” runs on day 1 of every month and also every Monday.',
      },
      {
        q: 'What does cron do when the clocks change?',
        a: 'If the time does not exist (the spring night the clock jumps forward), it runs at the first minute that does. If it happens twice (in autumn), it runs once, the first time.',
      },
      {
        q: 'Does it work for Quartz, Spring or AWS?',
        a: 'No. Those formats add seconds or years and symbols such as L, W or #. This tool uses the classic 5-field cron of Linux and most services.',
      },
    ],
  },
};
