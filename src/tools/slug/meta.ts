import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'slug',
  category: 'gen',
  icon: 'link-2',
  slug: { es: 'generador-slug', en: 'slug-generator' },
  name: { es: 'Slug', en: 'Slug' },
  title: {
    es: 'Generador de slugs para URL: quita tildes y espacios',
    en: 'URL slug generator: remove accents and spaces',
  },
  description: {
    es: 'Convierte títulos en slugs limpios para URL: sin tildes, eñes ni símbolos, con el separador que elijas y sin cortar palabras. Una línea, un slug.',
    en: 'Turn titles into clean URL slugs: no accents or symbols, with the separator you choose and without splitting words. One line, one slug.',
  },
  keywords: {
    es: [
      'generador de slug',
      'slug url',
      'quitar tildes',
      'url amigable',
      'convertir titulo a url',
      'slugify',
    ],
    en: [
      'slug generator',
      'url slug',
      'slugify',
      'remove accents',
      'seo friendly url',
      'title to url',
    ],
  },
};
