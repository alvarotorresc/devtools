import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'color',
  category: 'conv',
  icon: 'palette',
  slug: { es: 'conversor-colores', en: 'color-converter' },
  name: { es: 'Colores', en: 'Colors' },
  title: {
    es: 'Conversor de colores HEX, RGB, HSL y OKLCH con contraste WCAG',
    en: 'HEX, RGB, HSL and OKLCH color converter with WCAG contrast',
  },
  description: {
    es: 'Convierte colores entre HEX, RGB, HSL y OKLCH con todos los campos editables y sincronizados, y comprueba su contraste WCAG con blanco y negro.',
    en: 'Convert colors between HEX, RGB, HSL and OKLCH with every field editable and in sync, and check their WCAG contrast against white and black.',
  },
  keywords: {
    es: [
      'conversor de colores',
      'hex a rgb',
      'rgb a hex',
      'hsl',
      'oklch',
      'contraste wcag',
      'selector de color',
    ],
    en: [
      'color converter',
      'hex to rgb',
      'rgb to hex',
      'hsl',
      'oklch',
      'wcag contrast',
      'color picker',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Qué ventaja tiene OKLCH?',
        a: 'Su luminosidad (L) corresponde a cómo percibimos el brillo: dos colores con la misma L se ven igual de claros aunque cambie el tono. Eso facilita crear paletas y variantes accesibles.',
      },
    ],
    en: [
      {
        q: 'Why use OKLCH?',
        a: 'Its lightness (L) matches how we perceive brightness: two colors with the same L look equally light even if the hue changes. That makes palettes and accessible variants easier.',
      },
    ],
  },
};
