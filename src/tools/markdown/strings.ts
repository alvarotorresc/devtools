import type { Locale } from '../types';

export const strings = {
  es: {
    view: 'Vista',
    input: 'Markdown',
    placeholder: 'Escribe o pega Markdown: # Título, **negrita**, - [ ] tarea, | tabla |',
    externalImages: 'Cargar imágenes externas',
    preview: 'Vista previa',
    html: 'HTML saneado',
    empty: 'Escribe Markdown a la izquierda y aquí verás cómo queda.',
    blocked:
      'Imágenes externas sin cargar: {n}. Activa «Cargar imágenes externas» si te fías de su origen.',
    sanitized: 'Saneado con DOMPurify',
    copyHtml: 'Copiar HTML',
    sample: 'Cargar un ejemplo',
  },
  en: {
    view: 'View',
    input: 'Markdown',
    placeholder: 'Type or paste Markdown: # Title, **bold**, - [ ] task, | table |',
    externalImages: 'Load external images',
    preview: 'Preview',
    html: 'Sanitised HTML',
    empty: 'Type Markdown on the left and you will see how it looks here.',
    blocked: 'External images not loaded: {n}. Turn on “Load external images” if you trust them.',
    sanitized: 'Sanitised with DOMPurify',
    copyHtml: 'Copy HTML',
    sample: 'Load an example',
  },
} satisfies Record<Locale, Record<string, string>>;
