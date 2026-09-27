import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'workdays',
  category: 'calc',
  icon: 'calendar-days',
  slug: { es: 'calculadora-dias-habiles', en: 'spanish-business-days-calculator' },
  name: { es: 'Días hábiles', en: 'Business days' },
  title: {
    es: 'Calculadora de días hábiles y días entre fechas',
    en: 'Spanish business days calculator between two dates',
  },
  description: {
    es: 'Cuenta los días naturales, laborables y hábiles entre dos fechas, con los festivos nacionales de España calculados para cualquier año, Viernes Santo incluido.',
    en: 'Count calendar days, weekdays and business days between two dates, with Spain’s national holidays worked out for any year, Good Friday included.',
  },
  keywords: {
    es: [
      'días hábiles',
      'días entre fechas',
      'calcular plazo',
      'días laborables',
      'festivos nacionales',
      'contar días',
    ],
    en: [
      'business days calculator',
      'days between dates',
      'working days spain',
      'spanish holidays',
      'count days',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Cuenta los festivos de mi comunidad?',
        a: 'No. Solo los festivos nacionales comunes a toda España. Los autonómicos y locales (como Jueves Santo o San José) y los traslados de festivos que caen en domingo cambian según la comunidad y el año.',
      },
      {
        q: '¿El sábado es día hábil?',
        a: 'Aquí no: se cuentan de lunes a viernes. En los plazos administrativos tampoco lo es desde la Ley 39/2015, que declara inhábiles los sábados, los domingos y los festivos.',
      },
    ],
    en: [
      {
        q: 'Does it include my region’s holidays?',
        a: 'No. Only the national holidays shared by all of Spain. Regional and local holidays (such as Maundy Thursday or Saint Joseph’s Day) and holidays moved from a Sunday change by region and year.',
      },
      {
        q: 'Is Saturday a business day?',
        a: 'Not here: Monday to Friday are counted. It is not one for Spanish administrative deadlines either since Law 39/2015, which excludes Saturdays, Sundays and holidays.',
      },
    ],
  },
  rememberInput: true,
};
