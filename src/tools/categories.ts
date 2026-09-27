import type { Category } from './types';

export const categories: Category[] = [
  {
    id: 'gen',
    icon: 'sparkles',
    name: { es: 'Generadores', en: 'Generators' },
    description: {
      es: 'Identificadores, textos de relleno y datos de prueba.',
      en: 'Identifiers, placeholder text and test data.',
    },
  },
  {
    id: 'enc',
    icon: 'code',
    name: { es: 'Codificación', en: 'Encoding' },
    description: {
      es: 'Codificar, decodificar e inspeccionar tokens y hashes.',
      en: 'Encode, decode and inspect tokens and hashes.',
    },
  },
  {
    id: 'data',
    icon: 'braces',
    name: { es: 'Texto y datos', en: 'Text & data' },
    description: {
      es: 'Formatear, comparar y transformar texto y JSON.',
      en: 'Format, compare and transform text and JSON.',
    },
  },
  {
    id: 'ids',
    icon: 'id-card',
    name: { es: 'Identificadores', en: 'Identifiers' },
    description: {
      es: 'Documentos y códigos oficiales. De momento, formatos de España.',
      en: 'Official documents and codes. Spanish formats for now.',
    },
  },
  {
    id: 'conv',
    icon: 'arrow-left-right',
    name: { es: 'Conversores', en: 'Converters' },
    description: {
      es: 'Fechas, colores, bases numéricas y unidades.',
      en: 'Dates, colors, number bases and units.',
    },
  },
  {
    id: 'calc',
    icon: 'calculator',
    name: { es: 'Calculadoras', en: 'Calculators' },
    description: {
      es: 'IVA, IRPF, porcentajes, reglas de tres y días hábiles.',
      en: 'VAT, withholding, percentages, rule of three and business days.',
    },
  },
  {
    id: 'rand',
    icon: 'dices',
    name: { es: 'Azar', en: 'Random' },
    description: { es: 'Ruletas, sorteos y dados.', en: 'Wheels, draws and dice.' },
  },
  {
    id: 'ref',
    icon: 'book-open',
    name: { es: 'Referencia', en: 'Reference' },
    description: {
      es: 'Chuletas y explicaciones rápidas.',
      en: 'Cheat sheets and quick explanations.',
    },
  },
];
