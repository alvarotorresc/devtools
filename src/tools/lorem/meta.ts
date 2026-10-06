import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'lorem',
  category: 'gen',
  icon: 'pilcrow',
  slug: { es: 'generador-lorem-ipsum', en: 'lorem-ipsum-generator' },
  name: { es: 'Lorem ipsum', en: 'Lorem ipsum' },
  title: {
    es: 'Generador de Lorem ipsum: párrafos y frases',
    en: 'Lorem ipsum generator: paragraphs, sentences',
  },
  heading: {
    es: 'Generador de Lorem ipsum',
    en: 'Lorem ipsum generator',
  },
  description: {
    es: 'Genera texto de relleno Lorem ipsum por párrafos, frases o palabras, empezando o no por «Lorem ipsum dolor sit amet», como texto o en <p> HTML.',
    en: 'Generate Lorem ipsum placeholder text by paragraphs, sentences or words, starting with “Lorem ipsum dolor sit amet” or not, as plain text or HTML <p>.',
  },
  keywords: {
    es: [
      'lorem ipsum',
      'texto de relleno',
      'texto de ejemplo',
      'generador de texto',
      'placeholder',
      'dummy text',
    ],
    en: [
      'lorem ipsum',
      'placeholder text',
      'dummy text',
      'filler text',
      'text generator',
      'sample text',
    ],
  },
  tabs: { es: ['Párrafos', 'Frases', 'Palabras'], en: ['Paragraphs', 'Sentences', 'Words'] },
};
