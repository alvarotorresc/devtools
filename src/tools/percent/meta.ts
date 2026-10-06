import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'percent',
  category: 'calc',
  icon: 'percent',
  slug: { es: 'calculadora-porcentajes', en: 'percentage-calculator' },
  name: { es: 'Porcentajes', en: 'Percentages' },
  title: {
    es: 'Calculadora de porcentajes: % y variación',
    en: 'Percentage calculator: percent of and change',
  },
  heading: {
    es: 'Calculadora de porcentajes',
    en: 'Percentage calculator',
  },
  description: {
    es: 'Calcula el X % de un número, qué porcentaje es una cantidad de otra y la variación porcentual entre dos valores, con descuentos y recargos.',
    en: 'Work out X% of a number, what percentage one amount is of another and the percentage change between two values, with discounts and markups.',
  },
  keywords: {
    es: [
      'calculadora de porcentajes',
      'calcular porcentaje',
      'porcentaje de un número',
      'variación porcentual',
      'descuento',
    ],
    en: [
      'percentage calculator',
      'percent of a number',
      'percentage change',
      'what percent',
      'discount calculator',
    ],
  },
  tabs: {
    es: ['X % de Y', 'Qué % es', 'Variación'],
    en: ['X% of Y', 'What %', 'Change'],
  },
  rememberInput: true,
  related: ['rule-of-three', 'iva', 'currency'],
};
