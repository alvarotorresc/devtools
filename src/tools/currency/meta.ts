import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'currency',
  category: 'conv',
  icon: 'coins',
  slug: { es: 'conversor-divisas', en: 'currency-converter' },
  name: { es: 'Divisas', en: 'Currency' },
  title: {
    es: 'Conversor de divisas con tipos de cambio del BCE',
    en: 'Currency converter with ECB exchange rates',
  },
  heading: {
    es: 'Conversor de divisas',
    en: 'Currency converter',
  },
  description: {
    es: 'Convierte entre euros, dólares, libras y otras 27 divisas con los tipos de referencia del BCE. El importe se calcula en tu navegador, sin conexión.',
    en: 'Convert between euros, dollars, pounds and 27 other currencies with ECB reference rates. The amount is computed in your browser and it works offline.',
  },
  keywords: {
    es: [
      'conversor de divisas',
      'euro a dólar',
      'tipo de cambio',
      'cambio de moneda',
      'bce',
      'libras a euros',
    ],
    en: [
      'currency converter',
      'euro to dollar',
      'exchange rate',
      'ecb rates',
      'convert currency',
      'pounds to euros',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Por qué mi banco me da otro cambio?',
        a: 'Estos son los tipos de referencia que publica el Banco Central Europeo una vez por día hábil. Bancos, tarjetas y casas de cambio aplican su propio tipo, normalmente con un margen, y a veces una comisión aparte.',
      },
      {
        q: '¿Se envía mi importe a algún sitio?',
        a: 'No. La herramienta descarga la tabla completa de tipos, sin parámetros, y hace la conversión en tu navegador. El importe y las divisas que eliges no salen de tu equipo.',
      },
    ],
    en: [
      {
        q: 'Why does my bank give me a different rate?',
        a: 'These are the reference rates the European Central Bank publishes once per working day. Banks, cards and exchange offices apply their own rate, usually with a margin, and sometimes a separate fee.',
      },
      {
        q: 'Is my amount sent anywhere?',
        a: 'No. The tool downloads the whole rate table, with no parameters, and converts in your browser. The amount and the currencies you pick never leave your device.',
      },
    ],
  },
  rememberInput: true,
};
