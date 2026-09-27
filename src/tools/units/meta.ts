import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'units',
  category: 'conv',
  icon: 'ruler',
  slug: { es: 'conversor-unidades', en: 'unit-converter' },
  name: { es: 'Unidades', en: 'Units' },
  title: {
    es: 'Conversor de unidades: longitud, peso, temperatura y más',
    en: 'Unit converter: length, weight, temperature and more',
  },
  description: {
    es: 'Convierte longitud, masa, temperatura, volumen, área, velocidad y datos, y ve el valor en todas las unidades a la vez, cada una con su botón de copiar.',
    en: 'Convert length, mass, temperature, volume, area, speed and data, and see the value in every unit at once, each one with its own copy button.',
  },
  keywords: {
    es: [
      'conversor de unidades',
      'millas a km',
      'libras a kilos',
      'fahrenheit a celsius',
      'galones a litros',
      'mb a gb',
    ],
    en: [
      'unit converter',
      'miles to km',
      'pounds to kg',
      'fahrenheit to celsius',
      'gallons to liters',
      'mb to gb',
    ],
  },
  tabs: {
    es: ['Longitud', 'Masa', 'Temperatura', 'Volumen', 'Área', 'Velocidad', 'Datos'],
    en: ['Length', 'Mass', 'Temperature', 'Volume', 'Area', 'Speed', 'Data'],
  },
  rememberInput: true,
};
