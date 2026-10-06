import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'rule-of-three',
  category: 'calc',
  icon: 'divide',
  slug: { es: 'regla-de-tres', en: 'rule-of-three-calculator' },
  name: { es: 'Regla de tres', en: 'Rule of three' },
  title: {
    es: 'Calculadora de regla de tres directa e inversa',
    en: 'Rule of three calculator: direct and inverse',
  },
  heading: {
    es: 'Calculadora de regla de tres',
    en: 'Rule of three calculator',
  },
  description: {
    es: 'Resuelve reglas de tres directas e inversas: si A es a B, cuánto es C. Muestra la fórmula con tus valores para que veas de dónde sale el resultado.',
    en: 'Solve direct and inverse rules of three: if A goes with B, what goes with C. Shows the formula with your values so you can see where the result comes from.',
  },
  keywords: {
    es: [
      'regla de tres',
      'regla de tres inversa',
      'regla de tres simple',
      'proporciones',
      'calcular proporción',
    ],
    en: [
      'rule of three',
      'inverse proportion',
      'direct proportion',
      'proportion calculator',
      'cross multiplication',
    ],
  },
  tabs: { es: ['Directa', 'Inversa'], en: ['Direct', 'Inverse'] },
  faq: {
    es: [
      {
        q: '¿Cuándo es directa y cuándo inversa?',
        a: 'Es directa si al aumentar una magnitud aumenta la otra (más kilos, más precio). Es inversa si al aumentar una disminuye la otra (más trabajadores, menos días).',
      },
    ],
    en: [
      {
        q: 'When is it direct and when inverse?',
        a: 'It is direct when one quantity grows as the other grows (more kilos, higher price). It is inverse when one grows as the other shrinks (more workers, fewer days).',
      },
    ],
  },
  rememberInput: true,
  related: ['percent', 'units', 'iva'],
};
