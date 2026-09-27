import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'px-rem',
  category: 'conv',
  icon: 'scaling',
  slug: { es: 'conversor-px-rem', en: 'px-to-rem-converter' },
  name: { es: 'px a rem', en: 'px to rem' },
  title: {
    es: 'Conversor de px a rem y em con base configurable',
    en: 'PX to REM and EM converter with custom base size',
  },
  description: {
    es: 'Convierte píxeles a rem y em, y al revés, con el tamaño base que uses. Incluye el CSS listo para copiar y una tabla de tamaños habituales.',
    en: 'Convert pixels to rem and em and back, with your own base font size. Includes ready-to-copy CSS and a table of common sizes.',
  },
  keywords: {
    es: ['px a rem', 'rem a px', 'px a em', 'conversor rem', 'tamaño de fuente css', 'rem css'],
    en: ['px to rem', 'rem to px', 'px to em', 'rem converter', 'css font size', 'rem css'],
  },
  faq: {
    es: [
      {
        q: '¿Qué diferencia hay entre rem y em?',
        a: 'rem se mide respecto al tamaño de letra del elemento raíz (html), que suele ser 16 px. em se mide respecto al tamaño de letra del elemento padre, así que cambia si lo anidas.',
      },
    ],
    en: [
      {
        q: 'What is the difference between rem and em?',
        a: 'rem is relative to the font size of the root element (html), usually 16px. em is relative to the font size of the parent element, so it changes when you nest it.',
      },
    ],
  },
  rememberInput: true,
};
