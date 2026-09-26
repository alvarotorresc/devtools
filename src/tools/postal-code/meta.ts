import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'postal-code',
  category: 'ids',
  icon: 'map-pin',
  slug: { es: 'codigo-postal-provincia', en: 'spanish-postal-code-province' },
  name: { es: 'Código postal', en: 'Postal codes' },
  title: {
    es: 'Código postal a provincia: busca la provincia de un CP',
    en: 'Spanish postal code to province lookup',
  },
  description: {
    es: 'Escribe uno o muchos códigos postales y ve su provincia, comunidad y capital. Recupera el 0 que pierden las hojas de cálculo y busca el rango de cada provincia.',
    en: 'Type one or many Spanish postal codes to see their province, region and capital. Restores the leading 0 spreadsheets drop and shows each province’s range.',
  },
  keywords: {
    es: [
      'codigo postal provincia',
      'provincia de un codigo postal',
      'cp españa',
      'codigos postales madrid',
    ],
    en: [
      'spanish postal code',
      'postal code to province',
      'spain zip code',
      'codigo postal lookup',
    ],
  },
  rememberInput: true,
};
